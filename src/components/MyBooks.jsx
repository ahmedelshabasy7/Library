import { useEffect, useState } from "react";
import api from "@utils/api.js";
import { useAuth } from "../hooks/AuthContext.jsx";

export default function MyBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/books/mine");
        if (!alive) return;
        setBooks((data.data || []).filter((b) => !b.isRejected));
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>My Books</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
          <ul>
            {books.map((b) => {
              const statusEl = b.isRejected ? (
                <span style={{ color: "crimson", marginLeft: "0.5rem" }}>
                  Rejected
                </span>
              ) : b.isApproved ? (
                <span style={{ color: "green", marginLeft: "0.5rem" }}>
                  Approved
                </span>
              ) : (
                <span style={{ color: "#c58f00", marginLeft: "0.5rem" }}>
                  Pending
                </span>
              );
              return (
                <li key={b._id} style={{ marginBottom: "0.5rem" }}>
                  <strong>{b.title || b.type}</strong>{" "}
                  <span style={{ opacity: 0.8 }}>- {b.type}</span>
                  {statusEl}
                  {b.isRejected && (
                    <div style={{ fontSize: "0.9rem", color: "#990000" }}>
                      Sorry, admin rejected this book. You can edit and
                      republish it.
                    </div>
                  )}
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this book?"
                        )
                      ) {
                        await api.delete(`/books/${b._id}`);
                        setBooks((books) =>
                          books.filter((x) => x._id !== b._id)
                        );
                      }
                    }}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
