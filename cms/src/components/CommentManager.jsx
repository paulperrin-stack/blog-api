import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/client.js";

export default function CommentManager() {
    const { id } = useParams();
    const [comments, setComments] = useState([]);

    const load = () => apiFetch(`/posts/${id}/comments`).then(setComments);
    useEffect(() => { load(); }, [id]);

    const remove = async (commentId) => {
        if (!confirm("Delete this comment?")) return;
        await apiFetch(`/posts/${id}/comments/${commentId}`, { method: "DELETE" });
        load();
    };

    return (
        <div>
            <Link to="/">← Back</Link>
            <h2>Comments</h2>
            {comments.length === 0 && <p>No comments yet.</p>}
            <ul>
                {comments.map((c) => {
                    <li key={c.id}>
                        <strong>{c.user.username}:</strong> {c.content}{" "}
                        <button onClick={() => remove(c.id)}>Delete</button>
                    </li>
                })}
            </ul>
        </div>
    );
}