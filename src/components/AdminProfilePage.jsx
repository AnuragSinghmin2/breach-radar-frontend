import { useEffect, useRef, useState } from "react";
import { getErrorMessage, userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getInitials, resolveAvatarUrl } from "../utils/profile";
import { Camera, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import "./AdminProfile.css";

function validateAvatarFile(file) {
  if (!file) return "Choose a profile picture first.";
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) return "Profile picture must be JPG, JPEG, PNG, or WEBP.";
  if (file.size > 5 * 1024 * 1024) return "Profile picture must be 5 MB or smaller.";
  return "";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AdminProfilePage() {
  const { user, refreshProfile, updateAuthenticatedUser } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ name: "", email: "" });
  const [account, setAccount] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const canEditEmail = account?.role === "super_admin";
  const roleLabel = account?.role === "super_admin" ? "Super Admin" : "Admin";

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const profileUser = await refreshProfile();
        if (!active) return;
        setAccount(profileUser);
        setForm({ name: profileUser?.profile?.name || "", email: profileUser?.email || "" });
      } catch (error) {
        if (active) setMessage({ type: "error", text: getErrorMessage(error, "Failed to load profile.") });
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  function handleAvatarInput(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    const error = validateAvatarFile(file);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
    setAvatarFile(file);
    setMessage(null);
  }

  async function uploadAvatar() {
    const error = validateAvatarFile(avatarFile);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setSaving(true);
    try {
      const result = await userApi.uploadAvatar(avatarFile);
      updateAuthenticatedUser(result.user);
      setAccount(result.user);
      setAvatarFile(null);
      setMessage({ type: "success", text: result.message || "Profile picture updated." });
    } catch (uploadError) {
      setMessage({ type: "error", text: getErrorMessage(uploadError, "Failed to upload profile picture.") });
    } finally {
      setSaving(false);
    }
  }

  async function removeAvatar() {
    setSaving(true);
    try {
      const result = await userApi.removeAvatar();
      updateAuthenticatedUser(result.user);
      setAccount(result.user);
      setAvatarFile(null);
      setMessage({ type: "success", text: result.message || "Profile picture removed." });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to remove profile picture.") });
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage({ type: "error", text: "Full name is required." });
      return;
    }

    if (canEditEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setMessage({ type: "error", text: "Enter a valid email address." });
      return;
    }

    setSaving(true);
    try {
      const result = await userApi.updateProfile({
        name: form.name,
        email: canEditEmail ? form.email : account?.email,
        phoneNumber: account?.profile?.phoneNumber || "",
        organization: account?.profile?.organization || "",
        jobTitle: account?.profile?.jobTitle || "",
        country: account?.profile?.country || "",
        timezone: account?.preferences?.timezone || "",
      });
      updateAuthenticatedUser(result.user);
      setAccount(result.user);
      setForm({ name: result.user?.profile?.name || "", email: result.user?.email || "" });
      setMessage({ type: "success", text: result.message || "Profile updated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to update profile.") });
    } finally {
      setSaving(false);
    }
  }

  const avatarUrl = avatarPreview || resolveAvatarUrl(account?.profile?.avatar || user?.profile?.avatar);
  const initials = getInitials(form.name, form.email);

  if (loading) {
    return (
      <div className="admin-profile-page admin-profile-loading">
        <Loader2 size={22} className="admin-profile-spin" />
        <span>Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      {message && <div className={`admin-profile-message ${message.type}`}>{message.text}</div>}

      <section className="admin-profile-card">
        <div className="admin-profile-avatar-row">
          <div className="admin-profile-avatar-wrap">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
          </div>

          <div className="admin-profile-avatar-actions">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={saving}>
              <Camera size={15} /> Choose Photo
            </button>
            {avatarFile && (
              <button type="button" className="primary" onClick={uploadAvatar} disabled={saving}>
                {saving ? "Uploading..." : "Save Photo"}
              </button>
            )}
            {account?.profile?.avatar && !avatarFile && (
              <button type="button" className="danger" onClick={removeAvatar} disabled={saving}>
                <Trash2 size={15} /> Remove
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              hidden
              onChange={handleAvatarInput}
            />
          </div>
        </div>

        <div className="admin-profile-meta-grid">
          <div>
            <span>Role</span>
            <strong>
              <ShieldCheck size={14} /> {roleLabel}
            </strong>
          </div>
          <div>
            <span>Account Created</span>
            <strong>{formatDate(account?.createdAt)}</strong>
          </div>
        </div>

        <form className="admin-profile-form" onSubmit={saveProfile}>
          <label>
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Email {!canEditEmail && <em>(read-only)</em>}</span>
            <input
              type="email"
              value={form.email}
              readOnly={!canEditEmail}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>

          <div className="admin-profile-form-actions">
            <button type="submit" className="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}