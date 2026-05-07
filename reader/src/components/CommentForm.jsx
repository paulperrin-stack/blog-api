import { useState } from "react";
import { apiFetch } from "../api/client.js";

export default function CommentForm({ postId, onAdded }) {
    const [content, setContent] = useState("");
    const [token, setToken] = useState(localStorage.getItem("readerToken") || "");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const login = async (e) => {
        e.preventDefault();
        try {
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });
            localStorage.setItem("readerToken", data.token);
            setToken(data.json);
        } catch (err) {
            alert(err.message);
        }
    };

    const signup = async () => {
        try {
            await apiFetch("/auth/signup", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });
            alert("Account created - now log in.");
        } catch (err) {
            alert(err.message);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        await apiFetch(`/posts/${postId}/comments`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ content }),
        });
        setContent("");
        onAdded();
    };

    if (!token) {
        return (
            <form onSubmit={login} style={{ display: "grid", gap: 8 }}>
                <p>Log in to comment:</p>
                <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div>
                    <button type="submit">Log in</button>
                    <button type="button" onClick={signup}>Sign up</button>
                </div>
            </form>
        );
    }

    return (
        <form onSubmit={submit}>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
            <button type="submit">Post comment</button>
        </form>
    );
}