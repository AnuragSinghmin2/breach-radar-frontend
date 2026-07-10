import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthPageLayout from "./AuthPageLayout";

export default function EmailverifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [error, setError] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setError("Invalid verification link. Please request a new one.");
      return;
    }

    // Auto verify on page load
    verifyEmail();
  }, []);

  async function verifyEmail() {
    try {
      const res = await fetch("/api/v1/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.message || "Verification failed. Please try again.");
        if (email) setResendEmail(decodeURIComponent(email));
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setError("Network error. Please check your connection.");
    }
  }

  async function handleResend() {
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendSuccess(true);
    } catch {
      setResendSuccess(false);
    } finally {
      setResendLoading(false);
    }
  }

  // Verifying State
  if (status === "verifying") {
    return (
      <AuthPageLayout>
        <div className="signin-card" style={{ textAlign: "center", minHeight: "auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h2>Verifying Your Email...</h2>
          <p style={{ color: "#aeb8c7", marginTop: 10 }}>
            Please wait while we verify your email address.
          </p>
        </div>
      </AuthPageLayout>
    );
  }

  // Success State
  if (status === "success") {
    return (
      <AuthPageLayout>
        <div className="signin-card" style={{ textAlign: "center", minHeight: "auto" }}>
          <div
            style={{
              width: 72,
              height: 72,
              margin: "0 auto 22px",
              borderRadius: "50%",
              background: "rgba(22,224,149,0.12)",
              display: "grid",
              placeItems: "center",
              fontSize: 36,
            }}
          >
            ✅
          </div>
          <h2>Email Verified!</h2>
          <p style={{ marginTop: 10, color: "#c4d2cf", lineHeight: 1.6 }}>
            Your email has been verified successfully.
            <br />
            Your account is now active!
          </p>
          <button
            className="signin-submit"
            style={{ marginTop: 28 }}
            onClick={() => navigate("/login")}
          >
            Go to Login →
          </button>
        </div>
      </AuthPageLayout>
    );
  }

  // Error State
  return (
    <AuthPageLayout>
      <div className="signin-card" style={{ textAlign: "center", minHeight: "auto" }}>
        <div
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 22px",
            borderRadius: "50%",
            background: "rgba(239,68,68,0.12)",
            display: "grid",
            placeItems: "center",
            fontSize: 36,
          }}
        >
          ❌
        </div>
        <h2>Verification Failed</h2>
        <p style={{ marginTop: 10, color: "#ef4444", lineHeight: 1.6 }}>
          {error}
        </p>

        {!resendSuccess ? (
          <div style={{ marginTop: 24 }}>
            <p style={{ color: "#aeb8c7", marginBottom: 12, fontSize: 14 }}>
              Request a new verification link:
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #20324a",
                background: "#091421",
                color: "#fff",
                fontSize: 14,
                marginBottom: 12,
                boxSizing: "border-box",
              }}
            />
            <button
              className="signin-submit"
              onClick={handleResend}
              disabled={resendLoading || !resendEmail}
            >
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        ) : (
          <div
            style={{
              marginTop: 20,
              padding: "14px",
              borderRadius: 8,
              background: "rgba(22,224,149,0.07)",
              border: "1px solid rgba(22,224,149,0.2)",
              color: "#16e095",
            }}
          >
            ✅ New verification link sent! Check your inbox.
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            marginTop: 16,
            background: "none",
            border: "none",
            color: "#16e095",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Back to Login
        </button>
      </div>
    </AuthPageLayout>
  );
}