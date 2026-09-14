import { useEffect, useRef, useState } from "react";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
// bias + restrict results to the Okinawa prefecture area
const PROXIMITY = "127.9,26.35";
const OKINAWA_BBOX = "122.8,24.0,131.4,27.9";

// onSelect receives { name, address, lat, lng }
// onHoverResult (optional) receives { name, lat, lng } while hovering a result, or null when not
export default function PlaceSearch({ onSelect, placeholder, onHoverResult }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!query || query.trim().length < 3) {
            clearTimeout(debounceRef.current);
            setLoading(false);
            setResults([]);
            onHoverResult?.(null);
            return;
        }

        // show feedback immediately, don't wait for the debounce/fetch
        setLoading(true);

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&country=jp&bbox=${OKINAWA_BBOX}&proximity=${PROXIMITY}&limit=10&access_token=${MAPBOX_TOKEN}`)
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
        setLoading(false);
        onHoverResult?.(null);
    }

    const showDropdown = loading || results.length > 0;

    return (
        <div className="place-search">
            <input
                type="text"
                placeholder={placeholder || "Search for a restaurant or address in Okinawa"}
                value={query}
                onChange={ev => setQuery(ev.target.value)}
            />
            {showDropdown && (
                <ul className="place-search-results">
                    {loading && (
                        <li className="place-search-loading">Searching Okinawa spots…</li>
                    )}
                    {!loading && results.map(f => {
                        const [lng, lat] = f.geometry.coordinates;
                        return (
                            <li
                                key={f.properties.mapbox_id}
                                onClick={() => handleSelect(f)}
                                onMouseEnter={() => onHoverResult?.({ name: f.properties.name, lat, lng })}
                                onMouseLeave={() => onHoverResult?.(null)}
                            >
                                <span className="place-search-name">{f.properties.name}</span>
                                <span className="place-search-address">{f.properties.place_formatted}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
