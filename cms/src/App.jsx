import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import PostEditor from './components/PostEditor.jsx'
import CommentManager from './components/CommentManager.jsx'

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { user, logout } = useAuth();
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1><Link to="/">CMS</Link></h1>
        {user && (
          <div>
            <span style={{ marginRight: 8 }}>{user.username}</span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/new" element={<Protected><PostEditor /></Protected>} />
        <Route path="/edit/:id" element={<Protected><PostEditor /></Protected>} />
        <Route path="/posts/:id/comments" element={<Protected><CommentManager /></Protected>} />
      </Routes>
    </div>
  );
}