import { useRef, useState } from "react";

// Automatically picks up every image dropped into src/assets/about —
// no code changes needed to add or remove a photo.
function importAll(r) {
    return r.keys().map(r);
}
const images = importAll(require.context('./assets/about', false, /\.(png|jpe?g|webp)$/i));

export default function PhotoCarousel() {
    const [current, setCurrent] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const wheelLocked = useRef(false);

    if (images.length === 0) return null;

    function goPrev() {
        setCurrent(c => (c - 1 + images.length) % images.length);
    }

    function goNext() {
        setCurrent(c => (c + 1) % images.length);
    }

    function handleWheel(ev) {
        if (Math.abs(ev.deltaX) <= Math.abs(ev.deltaY)) return;
        ev.preventDefault();
        if (wheelLocked.current) return;

        if (ev.deltaX > 15) {
            goNext();
        } else if (ev.deltaX < -15) {
            goPrev();
        } else {
            return;
        }

        wheelLocked.current = true;
        setTimeout(() => { wheelLocked.current = false; }, 450);
    }

    return (
        <>
            <div className="carousel" onWheel={handleWheel}>
                {images.length > 1 && (
                    <button className="carousel-arrow carousel-arrow-left" onClick={goPrev} aria-label="Previous photo">
                        &#8249;
                    </button>
                )}
                <img
                    className="carousel-image"
                    src={images[current]}
                    alt={`Okinawa, ${current + 1} of ${images.length}`}
                    onClick={() => setLightboxOpen(true)}
                />
                {images.length > 1 && (
                    <button className="carousel-arrow carousel-arrow-right" onClick={goNext} aria-label="Next photo">
                        &#8250;
                    </button>
                )}
            </div>
            <p className="about-gallery-credit">Click a photo to enlarge, or scroll sideways to swipe through</p>

            {lightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
                    <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">
                        &times;
                    </button>
                    <img
                        className="lightbox-image"
                        src={images[current]}
                        alt={`Okinawa, ${current + 1} of ${images.length}, enlarged`}
                        onClick={ev => ev.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
