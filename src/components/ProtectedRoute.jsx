import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { isAuthed, user } = useAuth();
  if (!isAuthed) return <Navigate to="/auth" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return children;
}
