import { Routes, Route, Link } from "react-router-dom";
import PostList from "./components/PostList.jsx";
import PostDetail from "./components/PostDetail.jsx";

export default function App() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <header>
        <h1><Link to="/">My Blog</Link></h1>
      </header>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>
    </div>
  );
}