const API = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Request failed");
    }
    return res.status === 204 ? null : res.json();
}