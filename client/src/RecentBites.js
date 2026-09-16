import { Link } from "react-router-dom";
import { getAuthorColor } from "./authorColor";
import onigiri from "./assets/about/onigiri.png";
import ramen from "./assets/about/ramen.png";
import revolvingSushi from "./assets/about/revolving_sushi.png";
import riceSoba from "./assets/about/rice_soba.png";
import sobaWithEgg from "./assets/about/soba_with_egg.png";
import veggiePlate from "./assets/about/veggie_plate.png";
import foodAndMountains from "./assets/about/food_and_mountains.png";

// placeholder data until this is wired up to real spots
const FAKE_BITES = [
    { name: "Soba House", description: "One of the best soba sets on the island. Loved the egg and beef additions, with the side of ginger!", image: sobaWithEgg, author: "tayo", date: "January 25 2025" },
    { name: "当間 7-Eleven", description: "My favorite snack run in all of Okinawa. Tuna mayo onigiri, 10/10 every single time.", image: onigiri, author: "taylor", date: "January 25 2025" },
    { name: "Hama Sushi", description: "I ate revolving sushi almost every single day. Hama Sushi was the best.", image: revolvingSushi, author: "taylor", date: "January 25 2025" },
    { name: "Makishi Public Market", description: "Pick your fish downstairs, they grill it for you upstairs. Unreal.", image: foodAndMountains, author: "ray", date: "January 24 2025" },
    { name: "Ryukyu Udon", description: "Thick, chewy noodles in a simple broth. Comfort food done right.", image: riceSoba, author: "tayo", date: "January 23 2025" },
    { name: "Family Mart Fami Chiki", description: "Convenience store fried chicken hits different here. Paired with peach tea, obviously.", image: veggiePlate, author: "taylor", date: "January 22 2025" },
    { name: "Kariyushi Cafe", description: "Taco rice with a fried egg on top. Didn't expect to think about it for weeks after.", image: ramen, author: "ray", date: "January 21 2025" },
    { name: "Chatan Beach BBQ", description: "Grilled everything with an ocean view. Sunset made it better.", image: onigiri, author: "taylor", date: "January 20 2025" },
    { name: "Nakagusuku Bakery", description: "Purple sweet potato bread, still warm. Went back the next day for more.", image: sobaWithEgg, author: "tayo", date: "January 19 2025" },
    { name: "Naha Ramen Spot", description: "Rich tonkotsu broth, soft-boiled egg, perfect chashu. A proper late-night stop.", image: ramen, author: "ray", date: "January 18 2025" },
];

export default function RecentBites() {
    return (
        <section className="recent-bites">
            <h2 className="recent-bites-heading">Recent Bites</h2>
            <div className="bite-scroll">
                {FAKE_BITES.map((bite, i) => (
                    <div key={i} className="bite-card">
                        <img className="bite-card-image" src={bite.image} alt={bite.name} />
                        <div className="bite-card-body">
                            <h3 className="bite-card-title">{bite.name}</h3>
                            <p className="bite-card-description">{bite.description}</p>
                            <div className="bite-card-footer">
                                <span className="bite-author" style={{backgroundColor: getAuthorColor(bite.author)}}>{bite.author}</span>
                                <span className="bite-date">{bite.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Link to="/explore" className="explore-link">Explore all bites →</Link>
        </section>
    );
}
