import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPageLayout from "./AuthPageLayout";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthPageLayout>
        <div className="signin-card" style={{ textAlign: "center", minHeight: "auto" }}>
          <div
            style={{
              width: 66,
              height: 66,
              margin: "0 auto 22px",
              borderRadius: "50%",
              background: "rgba(29,239,145,0.12)",
              display: "grid",
              placeItems: "center",
              fontSize: 32,
            }}
          >
            ✅
          </div>
          <h2>Check Your Email</h2>
          <p style={{ marginTop: 10, color: "#c4d2cf", lineHeight: 1.6 }}>
            If an account exists for <strong style={{ color: "#20ef94" }}>{email}</strong>,
            a password reset link has been sent. Please check your inbox (and spam folder).
          </p>
          <p style={{ marginTop: 16, color: "#aeb8c7", fontSize: 14 }}>
            The link will expire in <strong style={{ color: "#ffffff" }}>1 hour</strong>.
          </p>
          <button
            className="signin-submit"
            style={{ marginTop: 28 }}
            onClick={() => navigate("/login")}
          >
            Back to Login <span></span>
          </button>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <form className="signin-card" onSubmit={handleSubmit} style={{ minHeight: "auto" }}>
        <div className="form-lock"></div>
        <h2>Forgot Password?</h2>
        <p style={{ marginTop: 8, color: "#c4d2cf", lineHeight: 1.6 }}>
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>

        <label className="field-label" htmlFor="email" style={{ marginTop: 28 }}>
          Email Address
        </label>
        <div className="input-shell mail">
          <input
            id="email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {error && (
          <div
            style={{
              color: "#ef4444",
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              padding: "0.75rem",
              borderRadius: "0.375rem",
              marginTop: "1rem",
              fontSize: "0.875rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <button
          className="signin-submit"
          type="submit"
          disabled={loading}
          style={{ marginTop: 28 }}
        >
          {loading ? "Sending..." : "Send Reset Link"} <span></span>
        </button>

        <p className="auth-switch" style={{ marginTop: 20 }}>
          Remember your password?
          <button type="button" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </p>
      </form>
    </AuthPageLayout>
  );
}
