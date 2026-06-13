import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Settings, Shield, Lock, Bell, Server } from "lucide-react";
import "./SuperAdmin.css";

export default function SuperAdminSettings() {
  const { user } = useAuth();
  
  // Settings Form state
  const [name, setName] = useState(user?.profile?.name || "Super Admin");
  const [email, setEmail] = useState(user?.email || "");
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    // Simulate updating settings
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="sa-container" style={{ maxWidth: "800px" }}>
      <div className="sa-card">
        <div className="sa-card-header">
          <h3>Super Admin Preferences</h3>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {success && (
            <div style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", padding: "12px", borderRadius: "6px", border: "1px solid rgba(34,197,94,0.2)" }}>
              Administrative settings successfully updated.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="sa-form-group">
              <label>Profile Display Name</label>
              <input
                type="text"
                required
                className="sa-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="sa-form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                className="sa-form-input"
                value={email}
                disabled
              />
              <span style={{ fontSize: "11px", color: "#64748b" }}>Contact support to change root administrative emails</span>
            </div>
          </div>

          <div className="sa-form-group">
            <label>API Session Timeout (Minutes)</label>
            <input
              type="number"
              min={5}
              max={1440}
              required
              className="sa-form-input"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            />
          </div>

          <div style={{ borderTop: "1px solid rgba(42, 69, 96, 0.4)", paddingTop: "20px" }}>
            <h4 style={{ margin: "0 0 16px", color: "#f8fafc" }}>Multi-Factor Authentication (MFA)</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="checkbox"
                id="sa-mfa"
                style={{ width: "18px", height: "18px", accentColor: "#00d68f", cursor: "pointer" }}
                checked={mfaEnabled}
                onChange={(e) => setMfaEnabled(e.target.checked)}
              />
              <label htmlFor="sa-mfa" style={{ cursor: "pointer", color: "#cbd5e1" }}>
                Require dynamic authenticator codes for all Super Admin route accesses
              </label>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(42, 69, 96, 0.4)", paddingTop: "20px" }}>
            <button type="submit" className="sa-btn" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
