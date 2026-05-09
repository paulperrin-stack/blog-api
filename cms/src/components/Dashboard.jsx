import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client.js";

export default function Dashboard() {
    const [posts, setPosts] = useState([]);

    const load = useCallback(() => apiFetch("/posts").then(setPosts), []);

    useEffect(() => { load(); }, [load]);

    const togglePublish = async (post) => {
        await apiFetch(`/posts/${post.id}`, {
            method: "PUT",
            body: JSON.stringify({ published: !post.published }),
        });
        load();
    };

    const remove = async (id) => {
        if (!confirm("Delete this post?")) return;
        await apiFetch(`/posts/${id}`, { method: "DELETE" });
        load();
    };

    return (
        <div>
            <Link to="/new"><button>+ New Post</button></Link>
            <table style={{ width: "100%", marginTop: 16 }}>
                <thead>
                    <tr>
                        <th align="left">Title</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((p) => (
                        <tr key={p.id}>
                            <td>{p.title}</td>
                            <td align="center">{p.published ? "✅ Published" : "📝 Draft"}</td>
                            <td align="center">
                                <button onClick={() => togglePublished(p)}>
                                    {p.published ? "Unpublish" : "Publish"}
                                </button>
                                <Link to={`/edit/${p.id}`}><button>Edit</button></Link>
                                <Link to={`/posts/${p.id}/comments`}><button>Comments</button></Link>
                                <button onClick={() => remove(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}