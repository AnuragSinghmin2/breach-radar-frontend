import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSessionValid } from "../utils/auth";

export default function PublicAuthRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <p>Loading session...</p>
      </div>
    );
  }

  if (isAuthenticated && isSessionValid()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
