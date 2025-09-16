import { useEffect, useState } from "react";
import api from "@utils/api.js";
import { useAuth } from "../hooks/AuthContext.jsx";

export default function BorrowingHistory() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/borrow");
      setItems(data.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  if (user?.role === "admin") {
    return (
      <div className="container">
        <h2>Borrowed Books</h2>
        <div className="alert">Admins are not allowed to borrow books.</div>
      </div>
    );
  }
  useEffect(() => {
    load();
  }, []);

  const returnBook = async (bookId) => {
    try {
      await api.put(`/borrow/${bookId}/return`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to return book");
    }
  };
  return (
    <div className="container">
      <h2>Borrowed Books</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table className="table">
        <thead>
          <tr>
            <th>Book</th>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => {
            const now = Date.now();
            const from = new Date(it.borrowed_from);
            const to = new Date(it.borrowed_to);
            let status = "Active";
            if (to.getTime() < now) status = "Expired";
            const disabled = status !== "Active";
            return (
              <tr key={i}>
                <td>{it.book?.title || it.book?.type}</td>
                <td>{from.toLocaleDateString()}</td>
                <td>{to.toLocaleDateString()}</td>
                <td>
                  <span
                    style={{
                      color:
                        status === "Active"
                          ? "#27ae60"
                          : status === "Expired"
                          ? "#c0392b"
                          : "#555",
                      fontWeight: 500,
                    }}
                  >
                    {status}
                  </span>
                </td>
                <td>
                  <button
                    disabled={disabled}
                    style={{ marginLeft: ".5rem", opacity: disabled ? 0.5 : 1 }}
                    onClick={() => returnBook(it.book?._id)}
                  >
                    Return
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
