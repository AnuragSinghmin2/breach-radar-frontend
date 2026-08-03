import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage, securityApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { KeyRound } from "lucide-react";
import "./AdminProfile.css";

const emptyForm = { current: "", next: "", confirm: "" };

export default function AdminChangePasswordPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();

    if (!form.current || !form.next || !form.confirm) {
      setMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (form.next.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (form.next !== form.confirm) {
      setMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setSaving(true);
    try {
      await securityApi.changePassword({ oldPassword: form.current, newPassword: form.next });
      setForm(emptyForm);
      setMessage({ type: "success", text: "Password updated successfully. Please log in again." });
      setRedirecting(true);

      setTimeout(async () => {
        await logout();
        navigate("/login", { replace: true });
      }, 1800);
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to update password.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-profile-page">
      {message && <div className={`admin-profile-message ${message.type}`}>{message.text}</div>}

      <section className="admin-profile-card admin-password-card">
        <div className="admin-password-head">
          <span className="admin-password-icon">
            <KeyRound size={18} />
          </span>
          <div>
            <h3>Change Password</h3>
            <p>Update your admin account password. You will need to log in again afterwards.</p>
          </div>
        </div>

        <form className="admin-profile-form" onSubmit={submit}>
          <label>
            <span>Current Password</span>
            <input
              type="password"
              value={form.current}
              onChange={(event) => updateField("current", event.target.value)}
              autoComplete="current-password"
              disabled={redirecting}
            />
          </label>

          <label>
            <span>New Password</span>
            <input
              type="password"
              value={form.next}
              onChange={(event) => updateField("next", event.target.value)}
              autoComplete="new-password"
              disabled={redirecting}
            />
          </label>

          <label>
            <span>Confirm New Password</span>
            <input
              type="password"
              value={form.confirm}
              onChange={(event) => updateField("confirm", event.target.value)}
              autoComplete="new-password"
              disabled={redirecting}
            />
          </label>

          <div className="admin-profile-form-actions">
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              disabled={saving || redirecting}
            >
              Clear
            </button>
            <button type="submit" className="primary" disabled={saving || redirecting}>
              {saving ? "Updating..." : redirecting ? "Redirecting..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}