import { useEffect, useState } from "react";
import api from "@utils/api.js";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/users/me");
      const notes = data?.user?.notifications || [];
      setItems(
        notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
      setUnread(notes.filter((n) => !n.read).length);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    await api.put("/users/notifications/read-all");
    await load();
  };

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0 }}>
          Notifications{" "}
          {unread > 0 && (
            <span className="badge" style={{ background: "#2563eb" }}>
              {unread}
            </span>
          )}
        </h3>
        <button onClick={markAll} disabled={unread === 0}>
          Mark all as read
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && items.length === 0 && <p>No notifications yet.</p>}
      <ul>
        {items.map((n, i) => (
          <li key={i} style={{ margin: "0.5rem 0", opacity: n.read ? 0.7 : 1 }}>
            <div>{n.message}</div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
