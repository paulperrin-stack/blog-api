import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { apiFetch } from '../api/client.js';

export default function PostEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);

    useEffect(() => {
        if (id) {
            apiFetch(`/posts/${id}`).then((p) => {
                setTitle(p.title);
                setContent(p.content);
                setPublished(p.published);
            });
        }
    }, [id]);

    const save = async (e) => {
        e.preventDefault();
        const body = {
            title,
            content: editorRef.current.getContent(),
            published,
        };
        if (id) {
            await apiFetch(`/posts/${id}`, { method: "PUT", body: JSON.stringify(body) });
        } else {
            await apiFetch(`/posts`, { method: "POST", body: JSON.stringify(body) });
        }
        navigate("/");
    };

    return (
        <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
            <h2>{id ? "Edit Post" : "New Post"}</h2>
            <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                onInit={(_evt, editor) => (editorRef.current = editor)}
                initialValue={content}
                init={{
                    height: 400,
                    menubar: false,
                    plugins: ["lists", "link", "image", "code", "preview"],
                    toolbar:
                        "undo redo | formatselect | bold italic | bullist numlist | link image | code preview",
                }}
            />
            <label>
                <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                />
                Published
            </label>
            <button type="submit">Save</button>
        </form>
    );
}