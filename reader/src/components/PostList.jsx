import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client.js";

export default function PostList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/posts").then(setPosts).finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;
    if (!posts.length) return <p>No posts yet.</p>;

    return (
        <ul style={{ listStyle: "none", padding: 0 }}>
            {posts.map((p) => (
                <li key={p.id} style={{ marginBottom: 24}}>
                    <h2><Link to={`/posts/${p.id}`}>{p.title}</Link></h2>
                    <small>by {p.author.username} · {new Date(p.createdAt).toLocaleDateString()}</small>
                </li>
            ))}
        </ul>
    );
}