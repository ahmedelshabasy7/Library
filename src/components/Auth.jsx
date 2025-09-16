import { useState } from "react";
import { useAuth } from "../hooks/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loginAsAdmin, setLoginAsAdmin] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    try {
      if (mode === "login") {
        const data = await login({
          email: form.email,
          password: form.password,
          admin: loginAsAdmin,
        });
        setMessage(`Welcome ${data?.user?.username || data?.user?.name || ""}`);
        navigate("/");
      } else {
        const data = await register({
          username: form.username,
          email: form.email,
          password: form.password,
        });
        setMessage(data.message || "Registered");
        setMode("login");
      }
    } catch (err) {
      const backend = err?.response?.data;
      if (backend) {
        setMessage(backend.message || "Request failed");
        if (backend.errors) setErrors(backend.errors);
      } else {
        setMessage(err.message || "Network error");
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>
          {mode === "login" ? "Login" : "Register"}
        </h2>
        {mode === "login" && (
          <div className="flex gap" style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".35rem",
                fontSize: ".85rem",
              }}
            >
              <input
                type="checkbox"
                checked={loginAsAdmin}
                onChange={(e) => setLoginAsAdmin(e.target.checked)}
              />{" "}
              Login as admin
            </label>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              placeholder="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          )}
          <input
            placeholder="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
        <div style={{ marginTop: "1rem" }}>
          {mode === "login" ? (
            <span>
              Need an account?{" "}
              <button className="secondary" onClick={() => setMode("register")}>
                Register
              </button>
            </span>
          ) : (
            <span>
              Have an account?{" "}
              <button className="secondary" onClick={() => setMode("login")}>
                Login
              </button>
            </span>
          )}
        </div>
        {message && (
          <p className="alert" style={{ marginTop: "1rem" }}>
            {message}
          </p>
        )}
        {errors && (
          <ul
            className="alert"
            style={{ marginTop: "1rem", listStyle: "disc inside" }}
          >
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>
                <strong>{k}:</strong> {v}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
