import { useEffect, useState } from "react";
import { getAuthorColor } from "./authorColor";

const REACTION_EMOJIS = ['🍜', '🍣', '🍱', '😋', '🔥', '❤️', '🎉'];

// A location's comment thread — shown both on the map's duplicate-spot
// panel and at the bottom of an individual post tied to that location.
export default function LocationComments({ locationId, userId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!locationId) return;
        setLoading(true);
        setError('');
        fetch(`http://localhost:4000/locations/${locationId}/comments`)
            .then(res => {
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                return res.json();
            })
            .then(data => {
                setComments(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load comments:', err);
                setLoading(false);
                setError("Couldn't load comments.");
            });
    }, [locationId]);

    async function submitComment() {
        if (!newComment.trim() || !locationId) return;
        setPosting(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:4000/locations/${locationId}/comments`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ text: newComment.trim() }),
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const comment = await res.json();
            setComments(prev => [...prev, comment]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to post comment:', err);
            setError("Couldn't post that comment.");
        } finally {
            setPosting(false);
        }
    }

    async function toggleReaction(commentId, emoji) {
        try {
            const res = await fetch(`http://localhost:4000/comments/${commentId}/react`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ emoji }),
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const updated = await res.json();
            setComments(prev => prev.map(c => c._id === updated._id ? updated : c));
        } catch (err) {
            console.error('Failed to react:', err);
        }
    }

    function reactionCounts(comment) {
        const counts = {};
        (comment.reactions || []).forEach(r => {
            counts[r.emoji] = (counts[r.emoji] || 0) + 1;
        });
        return counts;
    }

    function userReacted(comment, emoji) {
        return (comment.reactions || []).some(r => r.emoji === emoji && r.user === userId);
    }

    return (
        <div className="location-comments">
            {error && <p className="map-action-error">{error}</p>}
            {loading && <p className="map-popup-loading">Loading comments…</p>}
            {!loading && comments.length === 0 && (
                <p className="map-popup-empty">No comments yet — say something nice! 🌺</p>
            )}
            {!loading && comments.map(c => (
                <div key={c._id} className="location-comment">
                    <div className="location-comment-body">
                        <span
                            className="map-comment-author"
                            style={{backgroundColor: getAuthorColor(c.author?.username)}}
                        >
                            {c.author?.username}
                        </span>
                        <span className="map-comment-text">{c.text}</span>
                    </div>
                    <div className="location-comment-reactions">
                        {REACTION_EMOJIS.map(emoji => {
                            const count = reactionCounts(c)[emoji];
                            return (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={`reaction-btn ${userReacted(c, emoji) ? 'active' : ''}`}
                                    onClick={() => toggleReaction(c._id, emoji)}
                                >
                                    {emoji}{count > 0 && <span className="reaction-count">{count}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="map-comment-form">
                <input
                    type="text"
                    placeholder="Add a comment…"
                    value={newComment}
                    onChange={ev => setNewComment(ev.target.value)}
                    onKeyDown={ev => ev.key === 'Enter' && submitComment()}
                />
                <button type="button" onClick={submitComment} disabled={!newComment.trim() || posting}>
                    {posting ? '…' : 'Post'}
                </button>
            </div>
        </div>
    );
}
