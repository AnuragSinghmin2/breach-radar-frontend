import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { validateRegisterForm } from "../utils/authValidation";

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

export default function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const validationErrors = validateRegisterForm({
      name,
      email,
      password,
      confirmPassword,
    });

    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    if (!acceptedTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      await register(email.trim(), password, name.trim());
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="signin-card signup-card" onSubmit={handleSubmit}>
      <div className="form-lock form-user-add"></div>
      <h2>Create Account</h2>
      <p>Join SecureScan and start your security journey today.</p>

      <label className="field-label" htmlFor="fullName">
        Full Name
      </label>
      <div className="input-shell user">
        <input
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </div>

      <label className="field-label" htmlFor="signupEmail">
        Email Address
      </label>
      <div className="input-shell mail">
        <input
          id="signupEmail"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <label className="field-label" htmlFor="signupPassword">
        Password
      </label>
      <div className="input-shell password">
        <input
          id="signupPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          aria-label="Show password"
          onClick={() => setShowPassword(!showPassword)}
          className={showPassword ? "visible" : ""}
        ></button>
      </div>

      <label className="field-label" htmlFor="confirmPassword">
        Confirm Password
      </label>
      <div className="input-shell password">
        <input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          aria-label="Show confirm password"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className={showConfirmPassword ? "visible" : ""}
        ></button>
      </div>

      <label className="terms-check">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        />
        <span></span>
        <strong>
          I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </strong>
      </label>

      <AuthErrorMessage message={error} />

      <button className="signin-submit" type="submit" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
        <span></span>
      </button>

      <p className="auth-switch">
        Already have an account?
        <button type="button" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </p>

      <div className="divider">
        <span></span>
        or sign up with
        <span></span>
      </div>

      <div className="social-login">
        <button type="button">
          <span className="google">G</span>Google
        </button>
        <button type="button">
          <span className="github">GH</span>GitHub
        </button>
        <button type="button">
          <span className="microsoft"></span>Microsoft
        </button>
      </div>

      <div className="secure-note">
        <span></span>
        Your data is protected with enterprise-grade security
      </div>
    </form>
  );
}
