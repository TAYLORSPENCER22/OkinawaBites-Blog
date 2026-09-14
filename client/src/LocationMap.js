import { useCallback, useContext, useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import { Link } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import PlaceSearch from "./PlaceSearch";
import ImageDropzone from "./ImageDropzone";
import { UserContext } from "./UserContext";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// centered roughly over the main Okinawa island
const INITIAL_VIEW = { longitude: 127.9, latitude: 26.35, zoom: 9.5 };

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export default function LocationMap() {
    const { userInfo } = useContext(UserContext);
    const [locations, setLocations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [pendingPlace, setPendingPlace] = useState(null);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [note, setNote] = useState('');
    const [files, setFiles] = useState(null);
    const [saving, setSaving] = useState(false);

    const loggedIn = Boolean(userInfo?.id);

    useEffect(() => {
        fetch('http://localhost:4000/locations')
            .then(res => res.json())
            .then(setLocations);
    }, []);

    const openLocation = useCallback((location) => {
        setSelected(location);
        setSelectedPosts([]);
        fetch(`http://localhost:4000/locations/${location._id}/posts`)
            .then(res => res.json())
            .then(setSelectedPosts);
    }, []);

    function handleSearchSelect(place) {
        if (!loggedIn) {
            setShowAuthPrompt(true);
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

    async function submitPendingPlace() {
        if (!pendingPlace) return;
        setSaving(true);

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
        const locationDoc = await locationRes.json();

        const data = new FormData();
        data.set('title', pendingPlace.name);
        data.set('summary', note.slice(0, 150));
        data.set('content', note
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => `<p>${escapeHtml(line)}</p>`)
            .join(''));
        data.set('location', locationDoc._id);
        if (files?.[0]) {
            data.set('file', files[0]);
        }

        await fetch('http://localhost:4000/post', {
            method: 'POST',
            body: data,
            credentials: 'include',
        });

        setSaving(false);
        setLocations(prev => [...prev, locationDoc]);
        openLocation(locationDoc);
        cancelPendingPlace();
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
            {showAuthPrompt && (
                <div className="map-auth-prompt">
                    <p>You need an account to add a pin.</p>
                    <Link to="/login" onClick={() => setShowAuthPrompt(false)}>Sign in</Link>
                    <Link to="/register" onClick={() => setShowAuthPrompt(false)}>Register</Link>
                    <button type="button" onClick={() => setShowAuthPrompt(false)} aria-label="Dismiss">&times;</button>
                </div>
            )}

            {pendingPlace && (
                <div className="map-add-pin">
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
            )}

            <div className="map-container">
                <div className="map-search-overlay">
                    <PlaceSearch placeholder="Search to add a pin" onSelect={handleSearchSelect} />
                </div>
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
                            <div className="map-pin" title={loc.name} />
                        </Marker>
                    ))}

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
                                <h3>{selected.name}</h3>
                                {selected.address && <p className="map-popup-address">{selected.address}</p>}
                                {selectedPosts.length === 0 && (
                                    <p className="map-popup-empty">No posts yet for this spot.</p>
                                )}
                                {selectedPosts.map(post => (
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
