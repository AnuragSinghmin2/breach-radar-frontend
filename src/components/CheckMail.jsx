import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthPageLayout from "./AuthPageLayout";

export default function CheckMail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleResend() {
    if (!email) return;
    setResendLoading(true);
    try {
      await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendSuccess(true);
    } catch {
      setResendSuccess(false);
    } finally {
      setResendLoading(false);
    }
  }

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
          📧
        </div>

        <h2>Check Your Email</h2>

        <p style={{ marginTop: 10, color: "#c4d2cf", lineHeight: 1.6 }}>
          We sent a verification link to:
        </p>

        {email && (
          <strong
            style={{
              display: "block",
              margin: "10px 0 20px",
              color: "#16e095",
              fontSize: 16,
            }}
          >
            {email}
          </strong>
        )}

        <p style={{ color: "#aeb8c7", fontSize: 14, lineHeight: 1.6 }}>
          Click the link in the email to activate your account.
          <br />
          The link will expire in <strong style={{ color: "#fff" }}>24 hours</strong>.
        </p>

        <div
          style={{
            margin: "24px 0",
            padding: "14px",
            borderRadius: 8,
            background: "#091421",
            border: "1px solid #20324a",
            fontSize: 13,
            color: "#aeb8c7",
            textAlign: "left",
          }}
        >
          <strong style={{ color: "#fff", display: "block", marginBottom: 8 }}>
            Did not receive the email?
          </strong>
          • Check your spam/junk folder
          <br />
          • Make sure the email address is correct
          <br />
          • Wait a few minutes and try again
        </div>

        {!resendSuccess ? (
          <button
            className="signin-submit"
            onClick={handleResend}
            disabled={resendLoading}
            style={{ marginBottom: 12 }}
          >
            {resendLoading ? "Sending..." : "Resend Verification Email"}
          </button>
        ) : (
          <div
            style={{
              padding: "14px",
              borderRadius: 8,
              background: "rgba(22,224,149,0.07)",
              border: "1px solid rgba(22,224,149,0.2)",
              color: "#16e095",
              marginBottom: 12,
            }}
          >
            ✅ New verification link sent!
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
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