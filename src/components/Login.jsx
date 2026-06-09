import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }

      navigate("/", { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span>
            <ShieldCheck size={26} />
          </span>
          <div>
            <h1>SecureScan</h1>
            <p>{mode === "login" ? "Sign in to continue" : "Create your workspace account"}</p>
          </div>
        </div>

        <div className="login-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "register" && (
          <label>
            <span>Name</span>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              autoComplete="name"
              required
            />
          </label>
        )}

        <label>
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button className="login-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>
    </main>
  );
}
