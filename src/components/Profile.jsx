import { useAuth } from "../hooks/AuthContext.jsx";
import Notifications from "./Notifications.jsx";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Profile</h2>
        <span>
          <strong> {user.username || user.name || user.email}</strong>
        </span>
        <br></br>
        <span>
          <strong>Email : </strong> {user.email}
        </span>
        <br></br>
        <span>
          <strong>Joined : </strong>{" "}
          {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
        </span>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <Notifications />
      </div>
    </div>
  );
}
