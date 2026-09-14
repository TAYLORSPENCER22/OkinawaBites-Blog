import { useEffect, useRef, useState } from "react";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
// bias search results toward the Okinawa area
const PROXIMITY = "127.9,26.35";

// onSelect receives { name, address, lat, lng }
export default function PlaceSearch({ onSelect, placeholder }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!query || query.trim().length < 3) {
            setResults([]);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setLoading(true);
            fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&proximity=${PROXIMITY}&access_token=${MAPBOX_TOKEN}`)
                .then(res => res.json())
                .then(data => {
                    setResults(data.features || []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    function handleSelect(feature) {
        const [lng, lat] = feature.geometry.coordinates;
        onSelect({
            name: feature.properties.name || feature.properties.full_address,
            address: feature.properties.full_address || feature.properties.place_formatted || '',
            lat,
            lng,
        });
        setQuery('');
        setResults([]);
    }

    return (
        <div className="place-search">
            <input
                type="text"
                placeholder={placeholder || "Search for a restaurant or address"}
                value={query}
                onChange={ev => setQuery(ev.target.value)}
            />
            {loading && <p className="place-search-hint">Searching…</p>}
            {results.length > 0 && (
                <ul className="place-search-results">
                    {results.map(f => (
                        <li key={f.properties.mapbox_id} onClick={() => handleSelect(f)}>
                            <span className="place-search-name">{f.properties.name}</span>
                            <span className="place-search-address">{f.properties.place_formatted}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
