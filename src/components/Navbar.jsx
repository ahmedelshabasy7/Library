import { useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext.jsx";
import api from "@utils/api.js";

export default function Navbar() {
  const { user, logout, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [unread, setUnread] = useState(0);

  const loadPending = useCallback(async () => {
    if (user?.role !== "admin") return;
    try {
      const { data } = await api.get("/admin/books");
      const all = data.data || [];
      const pending = all.filter((b) => !b.isApproved).length;
      setPendingCount(pending);
    } catch (e) {
      /* silent */
    }
  }, [user]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  // Listen to custom event fired from AdminPanel after approve/reject
  useEffect(() => {
    const handler = () => loadPending();
    window.addEventListener("books-moderated", handler);
    return () => window.removeEventListener("books-moderated", handler);
  }, [loadPending]);

  // fetch unread notifications count (lightweight from /users/me)
  const loadUnread = useCallback(async () => {
    if (!isAuthed || !user) return;
    if (user.role === "admin") {
      setUnread(0);
      return;
    }
    try {
      const { data } = await api.get("/users/me");
      const notes = data?.user?.notifications || [];
      setUnread(notes.filter((n) => !n.read).length);
    } catch (e) {
      /* silent */
    }
  }, [isAuthed, user]);

  useEffect(() => {
    loadUnread();
  }, [loadUnread]);
  useEffect(() => {
    const handler = () => {
      loadUnread();
    };
    window.addEventListener("books-moderated", handler);
    return () => window.removeEventListener("books-moderated", handler);
  }, [loadUnread]);
  return (
    <nav className="navbar">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/books">Books</NavLink>
      {isAuthed && user?.role === "user" && (
        <NavLink to="/publish">Publish</NavLink>
      )}
      {isAuthed && user?.role === "user" && (
        <NavLink to="/my-books">My Books</NavLink>
      )}
      {isAuthed && user?.role === "user" && (
        <NavLink to="/borrowed">Borrowed</NavLink>
      )}
      {isAuthed && <NavLink to="/profile">Profile</NavLink>}
      {user?.role === "admin" && (
        <NavLink to="/admin">
          Admin{" "}
          {pendingCount > 0 && (
            <span className="badge" style={{ background: "#b45309" }}>
              {pendingCount}
            </span>
          )}
        </NavLink>
      )}
      <div style={{ marginLeft: "auto" }} />
      {!isAuthed && <NavLink to="/auth">Login</NavLink>}
      {isAuthed && (
        <>
          <button
            onClick={() => navigate("/profile")}
            title="Notifications"
            style={{ marginRight: ".5rem" }}
          >
            🔔
            {unread > 0 && (
              <span
                className="badge"
                style={{ marginLeft: 4, background: "#2563eb" }}
              >
                {unread}
              </span>
            )}
          </button>
          <span
            style={{
              marginRight: ".5rem",
              fontWeight: "bold",
              color: "#2563eb",
              fontSize: "1.1em",
            }}
          >
            Welcome {user?.username || user?.name || user?.email || ""}
          </span>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
          <span className="badge">{user?.role || ""}</span>
        </>
      )}
    </nav>
  );
}
