import { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const INITIAL_VIEW = { longitude: 127.9, latitude: 26.35, zoom: 9.5 };

// value: selected location _id (or '' for none). onChange: (id) => void
export default function LocationPicker({ value, onChange }) {
    const [locations, setLocations] = useState([]);
    const [mode, setMode] = useState('existing');
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newPin, setNewPin] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('http://localhost:4000/locations')
            .then(res => res.json())
            .then(setLocations);
    }, []);

    async function saveNewLocation() {
        if (!newName || !newPin) return;
        setSaving(true);
        const res = await fetch('http://localhost:4000/locations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ name: newName, lat: newPin.lat, lng: newPin.lng, address: newAddress }),
        });
        const doc = await res.json();
        setSaving(false);
        setLocations(prev => [...prev, doc]);
        onChange(doc._id);
        setMode('existing');
        setNewName('');
        setNewAddress('');
        setNewPin(null);
    }

    return (
        <div className="location-picker">
            <div className="location-picker-tabs">
                <button type="button" className={mode === 'existing' ? 'active' : ''} onClick={() => setMode('existing')}>
                    Pick existing spot
                </button>
                <button type="button" className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>
                    + Add new spot
                </button>
            </div>

            {mode === 'existing' && (
                <select value={value || ''} onChange={ev => onChange(ev.target.value)}>
                    <option value="">No location</option>
                    {locations.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.name}</option>
                    ))}
                </select>
            )}

            {mode === 'new' && (
                <div className="location-picker-new">
                    <input
                        type="text"
                        placeholder="Restaurant / spot name"
                        value={newName}
                        onChange={ev => setNewName(ev.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Address (optional)"
                        value={newAddress}
                        onChange={ev => setNewAddress(ev.target.value)}
                    />
                    {MAPBOX_TOKEN ? (
                        <div className="location-picker-map">
                            <Map
                                mapboxAccessToken={MAPBOX_TOKEN}
                                initialViewState={INITIAL_VIEW}
                                style={{ width: '100%', height: '100%' }}
                                mapStyle="mapbox://styles/mapbox/streets-v12"
                                onClick={ev => setNewPin({ lat: ev.lngLat.lat, lng: ev.lngLat.lng })}
                            >
                                {newPin && (
                                    <Marker longitude={newPin.lng} latitude={newPin.lat} anchor="bottom">
                                        <div className="map-pin" />
                                    </Marker>
                                )}
                            </Map>
                        </div>
                    ) : (
                        <p className="location-picker-hint">Add a Mapbox token to drop a pin.</p>
                    )}
                    <p className="location-picker-hint">Click the map to drop a pin at the restaurant.</p>
                    <button
                        type="button"
                        className="location-picker-save"
                        disabled={!newName || !newPin || saving}
                        onClick={saveNewLocation}
                    >
                        {saving ? 'Saving...' : 'Save this spot'}
                    </button>
                </div>
            )}
        </div>
    );
}
