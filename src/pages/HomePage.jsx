import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSessionValid } from "../utils/auth";
import { getUserHomePath, logAuthTrace } from "../utils/session";
import LandingPage from "../components/LandingPage";

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const hash = location.hash.replace("#", "");
    if (!hash) return;

    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [isAuthenticated, isLoading, location.hash]);

  if (isLoading) {
    return (
      <div className="auth-loading">
        <p>Loading session...</p>
      </div>
    );
  }

  if (isAuthenticated && isSessionValid()) {
    const destination = getUserHomePath(user);

    logAuthTrace("HomePage authenticated redirect", {
      role: user?.role,
      destination,
    });

    return <Navigate to={destination} replace />;
  }

  return <LandingPage />;
}
