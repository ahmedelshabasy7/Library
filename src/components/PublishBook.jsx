import { useState } from "react";
import api from "@utils/api.js";
import { Link } from "react-router-dom";

export default function PublishBook() {
  const [type, setType] = useState("");
  const [message, setMessage] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/books", { type });
    setMessage("Book submitted. Waiting for admin approval.");
    setType("");
  };
  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Publish Book</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
          <button type="submit">Publish</button>
        </form>
        {message && (
          <p className="alert" style={{ marginTop: "1rem" }}>
            {message} View it in <Link to="/my-books">My Books</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
