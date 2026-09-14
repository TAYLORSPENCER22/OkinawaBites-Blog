import { useCallback, useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import { Link } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// centered roughly over the main Okinawa island
const INITIAL_VIEW = { longitude: 127.9, latitude: 26.35, zoom: 9.5 };

export default function LocationMap() {
    const [locations, setLocations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedPosts, setSelectedPosts] = useState([]);

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

    if (!MAPBOX_TOKEN) {
        return (
            <div className="map-missing-token">
                Add a Mapbox token to client/.env as REACT_APP_MAPBOX_TOKEN to show the map.
            </div>
        );
    }

    return (
        <div className="map-container">
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
    );
}
