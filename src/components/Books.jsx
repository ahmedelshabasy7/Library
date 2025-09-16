import { useEffect, useState } from "react";
import api from "@utils/api.js";
import { useAuth } from "../hooks/AuthContext.jsx";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthed, user } = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/books");
        if (mounted) setBooks(data.data || []);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container">
      <h2>Books</h2>
      {loading && <p>Loading...</p>}
      <div className="books-grid">
        {books.map((b) => (
          <div key={b._id} className="card">
            <strong>{b.type}</strong>
            <div style={{ fontSize: ".75rem", opacity: 0.7 }}>
              Author: {b.author?.username || b.author?.email || "Unknown"}
            </div>
            <div
              className={b.isApproved ? "status-approved" : "status-pending"}
            >
              {b.isApproved ? "Approved" : "Pending"}
            </div>
            <div style={{ marginTop: ".25rem", fontSize: ".7rem" }}>
              <span
                style={{
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: b.state === "borrowed" ? "#c0392b" : "#2ecc71",
                  color: "#fff",
                }}
              >
                {b.state === "borrowed" ? "Borrowed" : "Available"}
              </span>
            </div>
            {isAuthed && user?.role === "user" && <BorrowAction book={b} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function BorrowAction({ book }) {
  const { isAuthed } = useAuth();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [date, setDate] = useState("");
  if (!isAuthed) return null;
  const disabled = book.state === "borrowed";
  const borrow = async () => {
    if (!date) {
      setError("Please set the date before borrowing.");
      return;
    }
    if (disabled) return;
    try {
      setError(null);
      setInfo(null);
      const { data } = await api.post(`/borrow/${book._id}`, {
        borrowed_to: date,
      });
      setInfo(data.message);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed");
    }
  };
  return (
    <div style={{ marginTop: ".5rem" }}>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        disabled={disabled}
      />
      <button
        style={{ marginLeft: ".5rem" }}
        onClick={borrow}
        disabled={disabled}
      >
        Borrow
      </button>
      {disabled && (
        <div style={{ fontSize: ".7rem", color: "#888", marginTop: ".25rem" }}>
          Currently borrowed
        </div>
      )}
      {info && (
        <div className="alert" style={{ marginTop: ".5rem" }}>
          {info}
        </div>
      )}
      {error && (
        <div
          className="alert"
          style={{ marginTop: ".5rem", background: "#e74c3c", color: "#fff" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
