import { useEffect, useState, useRef } from "react";
import api from "@utils/api.js";

export default function AdminPanel() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const { data } = await api.get("/admin/books");
      const all = (data.data || []).filter((b) => !b.isRejected);
      setApproved(all.filter((b) => b.isApproved));
      setPending(all.filter((b) => !b.isApproved));
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    // simple polling every 20s
    pollRef.current = setInterval(load, 20000);
    return () => clearInterval(pollRef.current);
  }, []);

  const dispatchModerated = () => {
    window.dispatchEvent(new CustomEvent("books-moderated"));
  };
  const approve = async (id) => {
    await api.put(`/admin/books/${id}/approve`);
    await load();
    dispatchModerated();
  };
  const reject = async (id) => {
    await api.put(`/admin/books/${id}/reject`);
    await load();
    dispatchModerated();
  };

  const deleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      await api.delete(`/books/${id}`);
      await load();
      dispatchModerated();
    }
  };
  return (
    <div className="container">
      <h2>Admin Panel</h2>
      {loading && <p>Loading...</p>}
      {error && (
        <p
          className="alert"
          style={{ background: "#fee2e2", borderColor: "#b91c1c" }}
        >
          Error: {error}
        </p>
      )}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h3>Pending</h3>
          {pending.length === 0 && !loading && (
            <div className="card" style={{ fontSize: ".8rem" }}>
              No pending books.
            </div>
          )}
          {pending.map((b) => (
            <div key={b._id} className="card">
              <strong>{b.type}</strong>
              <div style={{ fontSize: ".7rem", opacity: 0.7 }}>
                Author: {b.author?.username || "Unknown"}
              </div>
              <div className="flex gap" style={{ marginTop: ".5rem" }}>
                <button onClick={() => approve(b._id)}>Approve</button>
                <button className="danger" onClick={() => reject(b._id)}>
                  Reject
                </button>
                <button
                  style={{ marginLeft: "1rem" }}
                  onClick={() => deleteBook(b._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3>Approved</h3>
          {approved.length === 0 && !loading && (
            <div className="card" style={{ fontSize: ".8rem" }}>
              No approved books yet.
            </div>
          )}
          {approved.map((b) => (
            <div key={b._id} className="card">
              <strong>{b.type}</strong>
              <div style={{ fontSize: ".7rem", opacity: 0.7 }}>
                Author: {b.author?.username || "Unknown"}
              </div>
              <span className="status-approved">Approved</span>
              <button
                style={{ marginLeft: "1rem" }}
                onClick={() => deleteBook(b._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
