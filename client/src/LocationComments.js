import { useEffect, useState } from "react";
import { getAuthorColor } from "./authorColor";

// A location's comment thread — shown both on the map's duplicate-spot
// panel and at the bottom of an individual post tied to that location.
export default function LocationComments({ locationId, userId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

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

    function startEditing(comment) {
        setEditingId(comment._id);
        setEditingText(comment.text);
    }

    function cancelEditing() {
        setEditingId(null);
        setEditingText('');
    }

    async function saveEdit(commentId) {
        if (!editingText.trim()) return;
        setSavingEdit(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:4000/comments/${commentId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ text: editingText.trim() }),
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const updated = await res.json();
            setComments(prev => prev.map(c => c._id === updated._id ? updated : c));
            cancelEditing();
        } catch (err) {
            console.error('Failed to edit comment:', err);
            setError("Couldn't save that edit.");
        } finally {
            setSavingEdit(false);
        }
    }

    async function deleteComment(commentId) {
        setError('');
        try {
            const res = await fetch(`http://localhost:4000/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment:', err);
            setError("Couldn't delete that comment.");
        }
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
                    {editingId === c._id ? (
                        <div className="location-comment-edit">
                            <input
                                type="text"
                                value={editingText}
                                onChange={ev => setEditingText(ev.target.value)}
                                onKeyDown={ev => ev.key === 'Enter' && saveEdit(c._id)}
                            />
                            <button type="button" onClick={() => saveEdit(c._id)} disabled={!editingText.trim() || savingEdit}>
                                {savingEdit ? '…' : 'Save'}
                            </button>
                            <button type="button" onClick={cancelEditing} disabled={savingEdit}>Cancel</button>
                        </div>
                    ) : (
                        <div className="location-comment-body">
                            <span
                                className="map-comment-author"
                                style={{backgroundColor: getAuthorColor(c.author?.username)}}
                            >
                                {c.author?.username}
                            </span>
                            <span className="map-comment-text">{c.text}</span>
                            {c.author?._id === userId && (
                                <span className="location-comment-owner-actions">
                                    <button type="button" onClick={() => startEditing(c)}>Edit</button>
                                    <button type="button" onClick={() => deleteComment(c._id)}>Delete</button>
                                </span>
                            )}
                        </div>
                    )}
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
