import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSessionValid } from "../utils/auth";
import { logAuthTrace } from "../utils/session";

export default function SuperAdminRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasValidSession = isSessionValid() && isAuthenticated;

  logAuthTrace("SuperAdminRoute role check", {
    path: location.pathname,
    isAuthenticated,
    isLoading,
    hasValidSession,
    role: user?.role,
    user,
  });

  if (isLoading) {
    return (
      <div className="auth-loading" style={{ color: "#00d68f", textAlign: "center", padding: "50px" }}>
        <p>Verifying administrative clearance...</p>
      </div>
    );
  }

  if (!hasValidSession) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== "super_admin") {
    // If user is authenticated but does not possess super_admin role, kick back to primary workspace
    return <Navigate to="/" replace />;
  }

  return children;
}
