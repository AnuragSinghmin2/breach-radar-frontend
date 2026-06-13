import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSessionValid } from "../utils/auth";
import { getUserHomePath, logAuthTrace } from "../utils/session";

export default function PublicAuthRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <p>Loading session...</p>
      </div>
    );
  }

  if (isAuthenticated && isSessionValid()) {
    const destination = getUserHomePath(user);

    logAuthTrace("PublicAuthRoute redirect", {
      role: user?.role,
      destination,
    });

    return <Navigate to={destination} replace />;
  }

  return children;
}
