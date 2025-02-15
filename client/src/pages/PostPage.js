import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { UserContext } from "../UserContext";

export default function PostPage() {
    const [postInfo, setPostInfo] = useState(null);
    const { userInfo } = useContext(UserContext);
    const { id } = useParams();

    useEffect(() => {
        if (!id) return; // prevenet fetch if !id

        fetch(`http://localhost:4000/post/${id}`)
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch post");
                return response.json();
            })
            .then((data) => setPostInfo(data))
            .catch((error) => {
                console.error("Error fetching post data:", error);
                setPostInfo(null);
            });
    }, [id]); //id dependency 

    if (!postInfo) return null; // null if no post info

    return (
        <div className="post-page">
            <div className="infoContainer">
                {postInfo?.author?.username ? (
                    <div className="author"> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM92,96a12,12,0,1,1-12,12A12,12,0,0,1,92,96Zm82.92,60c-10.29,17.79-27.39,28-46.92,28s-36.63-10.2-46.92-28a8,8,0,1,1,13.84-8c7.47,12.91,19.21,20,33.08,20s25.61-7.1,33.08-20a8,8,0,1,1,13.84,8ZM164,120a12,12,0,1,1,12-12A12,12,0,0,1,164,120Z"></path></svg>
                        {postInfo.author.username}</div>
                ) : (
                    <div className="author">by Unknown</div>
                )}
                <time className="editTime">
                    {postInfo.createdAt
                        ? format(new Date(postInfo.createdAt), "MMM d, yyyy HH:mm")
                        : "Unknown Date"}
                </time>
            </div>
            <h1>{postInfo.title || "Untitled Post"}</h1>
            {userInfo?.id === postInfo?.author?._id && (
                <div className="edit-row">
                    <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                        </svg>
                        Edit this post
                    </Link>
                </div>
            )}
            {postInfo.cover && (
                <div className="image">
                    <img src={`http://localhost:4000/${postInfo.cover}`} alt="Post Cover" />
                </div>
            )}
            <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content || "" }} />
        </div>
    );
}
