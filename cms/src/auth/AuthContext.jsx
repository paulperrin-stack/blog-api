import { createContext, useContext, useState } from 'react'
import { apiFetch } from '../api/client.js'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("cmsUser");
        return raw ? JSON.parse(raw) : null;
    });

    const login = async (username, password) => {
        const data = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        if (!data.user.isAuthor) throw new Error("Author access required");
        localStorage.setItem("cmsToken", data.token);
        localStorage.setItem("cmsUser", JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem("cmsToken");
        localStorage.removeItem("cmsUser");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);