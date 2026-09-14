import { useEffect, useState } from "react"
import Post from "../Post"
import LocationMap from "../LocationMap"

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        fetch('http://localhost:4000/post').then(response => {
            response.json().then(posts => {
                setPosts(posts);
            });
        })
    }, []);
    return (
        <>
            <LocationMap />
            <div className="postCard">
            {posts.length > 0 && posts.map(post => (
                <Post key={post._id} {...post} />
            ))}
            </div>
        </>
    )
}