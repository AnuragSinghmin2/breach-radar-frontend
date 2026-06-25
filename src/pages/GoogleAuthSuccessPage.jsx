import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// This page handles the redirect from Google OAuth callback
// URL: /auth/google/success?token=ACCESS_TOKEN
export default function GoogleAuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login?error=google_failed", { replace: true });
      return;
    }

    // Store token and redirect to dashboard
    loginWithToken(token)
      .then(() => {
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        navigate("/login?error=google_failed", { replace: true });
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#03090f",
        color: "#eef9f6",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <p style={{ fontSize: 18, color: "#aeb8c7" }}>Completing Google Sign In...</p>
      </div>
    </div>
  );
}
