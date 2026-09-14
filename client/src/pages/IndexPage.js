import { useCallback, useEffect, useState } from "react"
import Post from "../Post"
import LocationMap from "../LocationMap"

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    const [highlightedLocationId, setHighlightedLocationId] = useState(null);

    const fetchPosts = useCallback(() => {
        fetch('http://localhost:4000/post').then(response => {
            response.json().then(posts => {
                setPosts(posts);
            });
        })
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return (
        <>
            <LocationMap onPostCreated={fetchPosts} highlightedLocationId={highlightedLocationId} />
            <div className="postCard">
            {posts.length > 0 && posts.map(post => (
                <Post key={post._id} {...post} onHoverLocation={setHighlightedLocationId} />
            ))}
            </div>
        </>
    )
}
