import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Clock3, LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, teamApi } from "../services/api";
import { formatAccountDate } from "../utils/profile";
import "./InvitePage.css";

function InviteSkeleton() {
  return (
    <div className="invite-card">
      <div className="invite-skeleton invite-title-skeleton" />
      <div className="invite-skeleton" />
      <div className="invite-skeleton" />
      <div className="invite-skeleton invite-button-skeleton" />
    </div>
  );
}

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [mode, setMode] = useState("accept");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const invitedEmail = invitation?.email || "";
  const expiry = useMemo(() => formatAccountDate(invitation?.expiresAt), [invitation?.expiresAt]);

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      setLoading(true);
      try {
        const data = await teamApi.getInvitation(token);
        if (!active) return;
        setInvitation(data);
        setForm((current) => ({ ...current, email: data.email || "" }));
        setMessage(null);
      } catch (error) {
        if (active) {
          const status = error.response?.status;
          setMessage({
            type: "error",
            text: status === 410 ? "Invitation expired. Request a new invitation from your organization admin." : getErrorMessage(error, "Invitation link is invalid."),
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInvitation();
    return () => {
      active = false;
    };
  }, [token]);

  async function acceptCurrentInvitation() {
    setSaving(true);
    try {
      await teamApi.acceptInvitation(token);
      setMessage({ type: "success", text: "Invitation accepted. Redirecting to your dashboard..." });
      setTimeout(() => navigate("/dashboard", { replace: true }), 700);
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to accept invitation.") });
    } finally {
      setSaving(false);
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (mode === "register") {
        await register(invitedEmail, form.password, form.name);
      } else {
        await login(invitedEmail, form.password);
      }
      await teamApi.acceptInvitation(token);
      setMessage({ type: "success", text: "Invitation accepted. Redirecting to your dashboard..." });
      setTimeout(() => navigate("/dashboard", { replace: true }), 700);
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Could not complete invitation acceptance.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="invite-page">
      <section className="invite-shell">
        <div className="invite-brand">
          <ShieldCheck size={30} />
          <span>Breach Radar</span>
        </div>

        {loading ? (
          <InviteSkeleton />
        ) : invitation ? (
          <div className="invite-card">
            <div className="invite-icon"><Mail size={28} /></div>
            <h1>Team Invitation</h1>
            <p>{invitation.organization?.name} invited you to join their Breach Radar workspace.</p>

            <dl className="invite-details">
              <div><dt>Organization</dt><dd>{invitation.organization?.name}</dd></div>
              <div><dt>Invited Email</dt><dd>{invitedEmail}</dd></div>
              <div><dt>Assigned Role</dt><dd>{invitation.role}</dd></div>
              <div><dt>Expires</dt><dd>{expiry}</dd></div>
            </dl>

            {message && <div className={`invite-message ${message.type === "error" ? "error" : ""}`}>{message.text}</div>}

            {isAuthenticated && mode === "accept" ? (
              <div className="invite-actions">
                <button type="button" onClick={acceptCurrentInvitation} disabled={saving}>
                  <CheckCircle2 size={17} /> {saving ? "Accepting..." : "Accept Invitation"}
                </button>
              </div>
            ) : (
              <>
                <div className="invite-tabs">
                  <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>
                    <LogIn size={15} /> Login
                  </button>
                  <button className={mode === "register" ? "active" : ""} type="button" onClick={() => setMode("register")}>
                    <UserPlus size={15} /> Create Account
                  </button>
                </div>
                <form className="invite-form" onSubmit={submitAuth}>
                  {mode === "register" && (
                    <label>
                      <span>Name</span>
                      <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
                    </label>
                  )}
                  <label>
                    <span>Email</span>
                    <input type="email" value={invitedEmail} readOnly />
                  </label>
                  <label>
                    <span>Password</span>
                    <input type="password" minLength={8} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
                  </label>
                  <button type="submit" disabled={saving}>
                    <CheckCircle2 size={17} /> {saving ? "Working..." : "Accept Invitation"}
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          <div className="invite-card">
            <div className="invite-icon expired"><Clock3 size={28} /></div>
            <h1>Invitation Unavailable</h1>
            {message && <div className="invite-message error">{message.text}</div>}
            <Link className="invite-link-button" to="/login">Request New Invitation</Link>
          </div>
        )}
      </section>
    </main>
  );
}
