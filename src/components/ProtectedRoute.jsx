import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSessionValid } from "../utils/auth";
import { getUserHomePath, logAuthTrace } from "../utils/session";

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasValidSession = isSessionValid() && isAuthenticated;
  const role = user?.role;
  const roleAllowed = !allowedRoles || allowedRoles.includes(role);
  const redirectDestination = hasValidSession ? getUserHomePath(user) : "/login";

  logAuthTrace("ProtectedRoute decision", {
    path: location.pathname,
    isAuthenticated,
    isLoading,
    hasValidSession,
    role,
    allowedRoles,
    roleAllowed,
    redirectDestination,
  });

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

  if (!roleAllowed) {
    return <Navigate to={redirectDestination} replace />;
  }

  return children;
}
