export default function AboutPage() {
    return (
        <div className="about-container">
            <h1>About OkinawaBites</h1>

            <div className="about-gallery">
                <img src="https://commons.wikimedia.org/wiki/Special:FilePath/File:Sunset_beach_at_Okinawa.jpg?width=600" alt="Sunset over an Okinawa beach" />
                <img src="https://commons.wikimedia.org/wiki/Special:FilePath/File:Okinawa_soba_and_goya_chanpuru.jpg?width=600" alt="Okinawa soba and goya chanpuru" />
                <img src="https://commons.wikimedia.org/wiki/Special:FilePath/File:JP-47_Naha_Makishi-Public-Market.jpg?width=600" alt="Makishi Public Market in Naha" />
            </div>
            <p className="about-gallery-credit">Photos via Wikimedia Commons — swap these for our own whenever.</p>

            <p>
                OkinawaBites started as a personal diary during my trip to Okinawa, Japan in January 2025 —
                a way to keep track of every dish I fell in love with before I inevitably forgot what half of it was called.
                (Okinawa soba is a soup. I promise. It still surprises me.)
            </p>
            <p>
                It's turned into a running collection for our friends and family: a place to document my favorite
                Okinawan food, snacks, and spots worth tracking down, so nothing gets lost to a camera roll no one
                ever looks back through.
            </p>
            <p>
                And it's not just for me. If you're one of my friends or family who's visited Okinawa — or planning
                a trip there yourself — I'd love for you to add your own favorites too. The more of us contributing,
                the better this gets as a shared list for the next person heading to the island.
            </p>
        </div>
    );
}
