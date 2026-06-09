import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSessionValid } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const hasValidSession = isSessionValid() && isAuthenticated;

  if (isLoading) {
    return (
      <div className="auth-loading">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!hasValidSession) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
