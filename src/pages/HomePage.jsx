import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSessionValid } from "../utils/auth";
import LandingPage from "../components/LandingPage";
import AppLayout from "../components/AppLayout";
import DashboardPage from "./DashboardPage";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
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
    return (
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    );
  }

  return <LandingPage />;
}
