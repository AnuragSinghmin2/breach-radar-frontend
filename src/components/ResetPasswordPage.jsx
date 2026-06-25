import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthPageLayout from "./AuthPageLayout";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token, email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password. Please try again.");
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
            🎉
          </div>
          <h2>Password Reset!</h2>
          <p style={{ marginTop: 10, color: "#c4d2cf", lineHeight: 1.6 }}>
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <button
            className="signin-submit"
            style={{ marginTop: 28 }}
            onClick={() => navigate("/login")}
          >
            Go to Login <span></span>
          </button>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <form className="signin-card" onSubmit={handleSubmit} style={{ minHeight: "auto" }}>
        <div className="form-lock"></div>
        <h2>Set New Password</h2>
        <p style={{ marginTop: 8, color: "#c4d2cf", lineHeight: 1.6 }}>
          Enter your new password below. Make sure it is at least 8 characters long.
        </p>

        {email && (
          <div
            style={{
              marginTop: 20,
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(29,239,145,0.07)",
              border: "1px solid rgba(29,239,145,0.2)",
              color: "#20ef94",
              fontSize: 14,
            }}
          >
            Resetting for: <strong>{decodeURIComponent(email)}</strong>
          </div>
        )}

        <label className="field-label" htmlFor="newPassword" style={{ marginTop: 24 }}>
          New Password
        </label>
        <div className="input-shell password">
          <input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password (min 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            aria-label="Toggle password"
            onClick={() => setShowPassword(!showPassword)}
            className={showPassword ? "visible" : ""}
          ></button>
        </div>

        <label className="field-label" htmlFor="confirmPassword" style={{ marginTop: 20 }}>
          Confirm New Password
        </label>
        <div className="input-shell password">
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
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
          disabled={loading || !token || !email}
          style={{ marginTop: 28 }}
        >
          {loading ? "Resetting..." : "Reset Password"} <span></span>
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
