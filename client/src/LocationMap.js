import { useCallback, useContext, useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import { Link } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import PlaceSearch from "./PlaceSearch";
import ImageDropzone from "./ImageDropzone";
import LocationComments from "./LocationComments";
import { UserContext } from "./UserContext";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// centered roughly over the main Okinawa island
const INITIAL_VIEW = { longitude: 127.9, latitude: 26.35, zoom: 9.5 };

// a search result within this many meters of an existing pin counts as the same spot
const DUPLICATE_THRESHOLD_METERS = 60;

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function distanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = deg => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LocationMap({ onPostCreated, highlightedLocationId }) {
    const { userInfo } = useContext(UserContext);
    const [locations, setLocations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [pendingPlace, setPendingPlace] = useState(null);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [note, setNote] = useState('');
    const [files, setFiles] = useState(null);
    const [saving, setSaving] = useState(false);
    const [hoverPin, setHoverPin] = useState(null);
    const [duplicateLocation, setDuplicateLocation] = useState(null);
    const [endorsing, setEndorsing] = useState(false);
    const [actionError, setActionError] = useState('');

    const loggedIn = Boolean(userInfo?.id);
    const isEndorsed = Boolean(duplicateLocation?.endorsedBy?.includes(userInfo?.id));

    useEffect(() => {
        fetch('http://localhost:4000/locations')
            .then(res => res.json())
            .then(setLocations);
    }, []);

    const openLocation = useCallback((location) => {
        setSelected(location);
        setSelectedPosts([]);
        setPostsLoading(true);
        fetch(`http://localhost:4000/locations/${location._id}/posts`)
            .then(res => res.json())
            .then(data => {
                setSelectedPosts(data);
                setPostsLoading(false);
            });
    }, []);

    function handleSearchSelect(place) {
        if (!loggedIn) {
            setShowAuthPrompt(true);
            return;
        }
        const match = locations.find(loc =>
            distanceMeters(loc.lat, loc.lng, place.lat, place.lng) < DUPLICATE_THRESHOLD_METERS
        );
        if (match) {
            openExistingSpot(match);
            return;
        }
        setPendingPlace(place);
        setNote('');
        setFiles(null);
    }

    function cancelPendingPlace() {
        setPendingPlace(null);
        setNote('');
        setFiles(null);
    }

    function openExistingSpot(location) {
        setDuplicateLocation(location);
        setActionError('');
        openLocation(location);
    }

    function closeDuplicatePanel() {
        setDuplicateLocation(null);
        setActionError('');
    }

    function switchToFullPost() {
        setPendingPlace({
            name: duplicateLocation.name,
            address: duplicateLocation.address,
            lat: duplicateLocation.lat,
            lng: duplicateLocation.lng,
            existingLocationId: duplicateLocation._id,
        });
        setNote('');
        setFiles(null);
        setDuplicateLocation(null);
    }

    async function toggleEndorse() {
        if (!duplicateLocation) return;
        setEndorsing(true);
        setActionError('');
        try {
            const res = await fetch(`http://localhost:4000/locations/${duplicateLocation._id}/endorse`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const updated = await res.json();
            setDuplicateLocation(updated);
            setLocations(prev => prev.map(l => l._id === updated._id ? updated : l));
        } catch (err) {
            console.error('Failed to toggle endorse:', err);
            setActionError("Couldn't save that — is the API server running the latest code?");
        } finally {
            setEndorsing(false);
        }
    }

    async function submitPendingPlace() {
        if (!pendingPlace) return;
        setSaving(true);

        let locationDoc = null;
        let locationId = pendingPlace.existingLocationId;
        if (!locationId) {
            const locationRes = await fetch('http://localhost:4000/locations', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    name: pendingPlace.name,
                    lat: pendingPlace.lat,
                    lng: pendingPlace.lng,
                    address: pendingPlace.address,
                }),
            });
            locationDoc = await locationRes.json();
            locationId = locationDoc._id;
        }

        const data = new FormData();
        data.set('title', pendingPlace.name);
        data.set('summary', note.slice(0, 150));
        data.set('content', note
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => `<p>${escapeHtml(line)}</p>`)
            .join(''));
        data.set('location', locationId);
        if (files?.[0]) {
            data.set('file', files[0]);
        }

        await fetch('http://localhost:4000/post', {
            method: 'POST',
            body: data,
            credentials: 'include',
        });

        setSaving(false);
        if (locationDoc) {
            setLocations(prev => [...prev, locationDoc]);
            openLocation(locationDoc);
        } else {
            openLocation({
                _id: locationId,
                lat: pendingPlace.lat,
                lng: pendingPlace.lng,
                name: pendingPlace.name,
                address: pendingPlace.address,
            });
        }
        cancelPendingPlace();
        onPostCreated?.();
    }

    if (!MAPBOX_TOKEN) {
        return (
            <div className="map-missing-token">
                Add a Mapbox token to client/.env as REACT_APP_MAPBOX_TOKEN to show the map.
            </div>
        );
    }

    return (
        <div className="map-section">
            <div className="map-container">
                <div className="map-search-overlay">
                    <PlaceSearch
                        placeholder="Search to add a pin"
                        onSelect={handleSearchSelect}
                        onHoverResult={setHoverPin}
                    />
                </div>

                {showAuthPrompt && (
                    <div className="map-overlay-backdrop" onClick={() => setShowAuthPrompt(false)}>
                        <div className="map-auth-prompt" onClick={ev => ev.stopPropagation()}>
                            <button type="button" className="map-overlay-close" onClick={() => setShowAuthPrompt(false)} aria-label="Close">&times;</button>
                            <p>You need an account to add a pin.</p>
                            <div className="map-auth-prompt-links">
                                <Link to="/login" onClick={() => setShowAuthPrompt(false)}>Sign in</Link>
                                <Link to="/register" onClick={() => setShowAuthPrompt(false)}>Register</Link>
                            </div>
                        </div>
                    </div>
                )}

                {pendingPlace && (
                    <div className="map-overlay-backdrop" onClick={cancelPendingPlace}>
                        <div className="map-add-pin" onClick={ev => ev.stopPropagation()}>
                            <button type="button" className="map-overlay-close" onClick={cancelPendingPlace} aria-label="Close">&times;</button>
                            <h3>{pendingPlace.name}</h3>
                            {pendingPlace.address && <p className="map-add-pin-address">{pendingPlace.address}</p>}
                            <ImageDropzone onFilesSelected={setFiles} />
                            <textarea
                                placeholder="Add a note about this spot (optional)"
                                value={note}
                                onChange={ev => setNote(ev.target.value)}
                            />
                            <div className="map-add-pin-actions">
                                <button type="button" onClick={cancelPendingPlace} disabled={saving}>Cancel</button>
                                <button type="button" className="map-add-pin-save" onClick={submitPendingPlace} disabled={saving}>
                                    {saving ? 'Adding…' : 'Add pin'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {duplicateLocation && (
                    <div className="map-overlay-backdrop" onClick={closeDuplicatePanel}>
                        <div className="map-duplicate-spot" onClick={ev => ev.stopPropagation()}>
                            <button type="button" className="map-overlay-close" onClick={closeDuplicatePanel} aria-label="Close">&times;</button>
                            <h3>📍 {duplicateLocation.name}</h3>
                            <p className="map-duplicate-spot-hint">This spot's already on the map!</p>
                            {actionError && <p className="map-action-error">{actionError}</p>}

                            <button
                                type="button"
                                className={`map-endorse-btn ${isEndorsed ? 'endorsed' : ''}`}
                                onClick={toggleEndorse}
                                disabled={endorsing}
                            >
                                👍 {isEndorsed ? 'Endorsed' : 'Endorse'} ({duplicateLocation.endorsedBy?.length || 0})
                            </button>

                            {selectedPosts.length > 0 && (
                                <div className="map-duplicate-spot-posts">
                                    {selectedPosts.map(post => (
                                        <Link key={post._id} to={`/post/${post._id}`} className="map-popup-post">
                                            📖 {post.title}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <LocationComments locationId={duplicateLocation._id} userId={userInfo?.id} />

                            <button type="button" className="map-write-post-btn" onClick={switchToFullPost}>
                                ✍️ Write a full post instead
                            </button>
                        </div>
                    </div>
                )}

                <Map
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={INITIAL_VIEW}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                >
                    {locations.map(loc => (
                        <Marker
                            key={loc._id}
                            longitude={loc.lng}
                            latitude={loc.lat}
                            anchor="bottom"
                            onClick={ev => {
                                ev.originalEvent.stopPropagation();
                                openLocation(loc);
                            }}
                        >
                            <div
                                className={`map-pin ${loc._id === highlightedLocationId ? 'map-pin-highlighted' : ''}`}
                                title={loc.name}
                            />
                        </Marker>
                    ))}

                    {hoverPin && (
                        <Marker longitude={hoverPin.lng} latitude={hoverPin.lat} anchor="bottom">
                            <div className="map-pin map-pin-preview" title={hoverPin.name} />
                        </Marker>
                    )}

                    {selected && (
                        <Popup
                            longitude={selected.lng}
                            latitude={selected.lat}
                            anchor="bottom"
                            offset={16}
                            closeOnClick={false}
                            onClose={() => setSelected(null)}
                        >
                            <div className="map-popup">
                                <h3>🍽️ {selected.name}</h3>
                                {selected.address && <p className="map-popup-address">{selected.address}</p>}
                                {postsLoading && (
                                    <p className="map-popup-loading">
                                        Digging up posts<span className="map-popup-loading-dots"><span>.</span><span>.</span><span>.</span></span>
                                    </p>
                                )}
                                {!postsLoading && selectedPosts.length === 0 && (
                                    <p className="map-popup-empty">Nothing here yet — be the first to post! 🌺</p>
                                )}
                                {!postsLoading && selectedPosts.map(post => (
                                    <Link key={post._id} to={`/post/${post._id}`} className="map-popup-post">
                                        {post.title}
                                    </Link>
                                ))}
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>
        </div>
    );
}
