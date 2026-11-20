import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function ProtectedRoute({ role, children }) {
  const user = getCurrentUser();
  if (!user || user.role !== role) return <Navigate to="/login" replace />;
  return children;
}
