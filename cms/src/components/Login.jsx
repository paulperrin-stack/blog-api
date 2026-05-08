import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
            <h2>Author Login</h2>
            <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Log in</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    );
}