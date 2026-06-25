import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, teamApi } from "../services/api";
import { validateLoginForm } from "../utils/authValidation";
import { getUserHomePath, logAuthTrace } from "../utils/session";
import AuthPageLayout from "./AuthPageLayout";

const PENDING_INVITE_TOKEN_KEY = "pendingInviteToken";
const TEAM_SETTINGS_PATH = "/dashboard/settings/team";

function AuthErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div
      className="auth-error-message"
      style={{
        color: "#ef4444",
        backgroundColor: "#fef2f2",
        border: "1px solid #fee2e2",
        padding: "0.75rem",
        borderRadius: "0.375rem",
        marginBottom: "1rem",
        fontSize: "0.875rem",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState(location.state?.invitedEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationErrors = validateLoginForm({ email, password });
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password);
      const inviteToken = location.state?.inviteToken || sessionStorage.getItem(PENDING_INVITE_TOKEN_KEY);
      let destination = getUserHomePath(data.user);

      if (inviteToken) {
        await teamApi.acceptInvitation(inviteToken);
        sessionStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
        destination = TEAM_SETTINGS_PATH;
      }

      logAuthTrace("SignInPage detected role", data.user?.role);
      logAuthTrace("SignInPage redirect destination", {
        requestedPath: location.state?.from?.pathname,
        destination,
      });
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      <form className="signin-card" onSubmit={handleSubmit}>
        <div className="form-lock"></div>
        <h2>Welcome Back!</h2>
        <p>Login to your account and continue securing your digital assets.</p>

        <label className="field-label" htmlFor="email">
          Email Address
        </label>
        <div className="input-shell mail">
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <div className="input-shell password">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            aria-label="Show password"
            onClick={() => setShowPassword(!showPassword)}
            className={showPassword ? "visible" : ""}
          ></button>
        </div>

        <div className="form-row">
          <label className="remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span></span>
            Remember me
          </label>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }} style={{ color: "#20ef94", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>Forgot Password?</a>
        </div>

        <AuthErrorMessage message={error} />

        <button className="signin-submit" type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
          <span></span>
        </button>

        <p className="auth-switch">
          Don't have an account ?
          <button type="button" onClick={() => navigate("/register", { state: location.state })}>
            Create Account
          </button>
        </p>

        <div className="divider">
          <span></span>
          or continue with
          <span></span>
        </div>

        <div className="social-login">
          <button type="button" onClick={() => window.location.href = '/api/v1/auth/google'}>
            <span className="google">G</span>Google
          </button>
          <button type="button" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span className="github">GH</span>GitHub
          </button>
          <button type="button" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span className="microsoft"></span>Microsoft
          </button>
        </div>

        <div className="secure-note">
          <span></span>
          Your data is protected with enterprise-grade security
        </div>
      </form>
    </AuthPageLayout>
  );
}
