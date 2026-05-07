import { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import { apiFetch } from "../api/client.js";
import commentForm from "./CommentForm.jsx";

export default function PostDetails() {
    const { id } = useParams();
    const [post, setPost] = useState(null);

    const load = () => apiFetch(`/posts/${id}`).then(setPost);
    useEffect(() => { load(); }, [id]);

    if (!post) return <p>Loading...</p>;

    return (
        <article>
            <h1>{post.title}</h1>
            <small>by {post.author.username}</small>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />

            <hr />
            <h3>Comments</h3>
            <CommentForm postId={id} onAdded={load} />
            <ul>
                {post.comments.map((c) =>(
                    <li key={c.id}>
                        <strong>{c.user.username}:</strong> {c.content}
                    </li>
                ))}
            </ul>
        </article>
    );
}