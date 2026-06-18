import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Camera,
  ChevronDown,
  Check,
  Clock3,
  Code2,
  Copy,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Info,
  KeyRound,
  Lock,
  Mail,
  MessageSquare,
  Monitor,
  MoreVertical,
  ShieldCheck,
  Smartphone,
  Trash2,
  UploadCloud,
  UserPlus,
  UserRound,
  UsersRound,
  Webhook,
  Wrench,
} from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { billingApi, getErrorMessage, teamApi, userApi, settingsApi, securityApi, apiAccessApi, integrationsApi, activityLogApi } from "../services/api";
import { formatAccountDate, getInitials, resolveAvatarUrl } from "../utils/profile";
import "./SettingsPage.css";

const settingSections = {
  profile: {
    title: "Profile",
    text: "Update your profile details, avatar, and account information.",
    icon: UserRound,
  },
  team: {
    title: "Team",
    text: "Manage members, roles, invitations, and team access.",
    icon: UsersRound,
  },
  "plan-billing": {
    title: "Plan & Billing",
    text: "Review your subscription, invoices, payment method, and usage.",
    icon: CreditCard,
  },
  notifications: {
    title: "Notifications",
    text: "Control alerts for scans, vulnerabilities, reports, and security events.",
    icon: Activity,
  },
  "scan-preferences": {
    title: "Scan Preferences",
    text: "Configure default scan depth, schedule, exclusions, and scan behavior.",
    icon: ShieldCheck,
  },
  security: {
    title: "Security",
    text: "Manage password, two-factor authentication, and session policies.",
    icon: Lock,
  },
  integrations: {
    title: "Integrations",
    text: "Connect CI/CD, chat, webhook, and monitoring tools.",
    icon: Webhook,
  },
  "activity-log": {
    title: "Activity Log",
    text: "Track team actions, authentication events, and audit history.",
    icon: Clock3,
  },
};

const overviewStats = [
  { label: "Total API Keys", value: "3", detail: "Active keys", icon: Wrench, tone: "green" },
  { label: "Total Requests", value: "128,645", detail: "This month", icon: CreditCard, tone: "blue" },
  { label: "Success Rate", value: "99.8%", detail: "This month", icon: Activity, tone: "purple" },
  { label: "Avg. Response Time", value: "245ms", detail: "This month", icon: Clock3, tone: "orange" },
];

const apiKeys = [
  {
    name: "Production Key",
    desc: "Used in production environment",
    key: "sk_live_....................a1b2c3d4",
    created: ["16 May 2024", "10:30 AM"],
    used: ["16 May 2024", "02:45 PM"],
  },
  {
    name: "Development Key",
    desc: "Used for development & testing",
    key: "sk_test_....................e5f6g7h8",
    created: ["10 May 2024", "09:15 AM"],
    used: ["16 May 2024", "11:20 AM"],
  },
  {
    name: "CI/CD Pipeline Key",
    desc: "GitHub Actions integration",
    key: "sk_live_....................i9j0k1l2",
    created: ["05 May 2024", "04:20 PM"],
    used: ["15 May 2024", "08:10 PM"],
  },
];

const endpoints = [
  ["GET", "/v1/domains", "List all domains", "green"],
  ["POST", "/v1/scans", "Initiate a new security scan", "green"],
  ["GET", "/v1/vulnerabilities", "Get vulnerabilities for a domain", "blue"],
  ["GET", "/v1/reports/{report_id}", "Retrieve a scan report", "yellow"],
  ["DELETE", "/v1/domains/{domain_id}", "Remove a domain", "red"],
];

const quickLinks = [
  ["API Documentation", "View full API reference", FileText],
  ["Authentication Guide", "Learn how to authenticate requests", Wrench],
  ["Code Examples", "Check out integration examples", Code2],
  ["Postman Collection", "Import our API collection", FileText],
];

const notificationEvents = [
  { key: "criticalVulnerabilities", title: "Critical vulnerabilities", desc: "Immediate alert when a critical finding appears.", channel: "Instant" },
  { key: "scanCompleted", title: "Scan completed", desc: "Notify when domain, port, or deep scans finish.", channel: "Instant" },
  { key: "monitorDown", title: "Monitor downtime", desc: "Alert when a monitored endpoint returns timeout or outage.", channel: "Instant" },
  { key: "reportReady", title: "Report ready", desc: "Send report links after PDF or executive summaries generate.", channel: "Digest" },
  { key: "remediationDue", title: "Remediation due", desc: "Remind owners before SLA deadlines are missed.", channel: "Digest" },
];

const notificationActivity = [
  ["Critical SQL Injection", "example.com", "Sent 2 min ago", "Critical"],
  ["Daily security digest", "4 domains summarized", "Sent 08:00 AM", "Digest"],
  ["Monitor recovered", "api.vulnerable.net", "Sent yesterday", "Resolved"],
];

const scanProfiles = [
  { name: "Quick Scan", time: "8-12 min", coverage: "Headers, DNS, SSL, ports", tone: "green" },
  { name: "Standard Scan", time: "25-40 min", coverage: "OWASP checks, services, technologies", tone: "blue" },
  { name: "Deep Scan", time: "60-90 min", coverage: "Authenticated paths, crawl depth, API checks", tone: "purple" },
];

const defaultExclusions = ["/logout", "/admin/delete", "*.pdf", "staging.internal"];

const securitySessions = [
  ["Chrome on Windows", "Mumbai, India", "Current session", "Active"],
  ["Edge on Windows", "Delhi, India", "Yesterday, 07:45 PM", "Active"],
  ["Mobile app", "Bengaluru, India", "12 May 2024", "Expired"],
];

const securityEvents = [
  ["Password changed", "Rahul Sharma", "12 days ago", "Success"],
  ["MFA challenge passed", "Chrome on Windows", "Today, 11:10 AM", "Success"],
  ["API key scope updated", "Production Key", "Yesterday, 03:18 PM", "Review"],
];

const integrationCatalog = [
  { key: "slack", name: "Slack", desc: "Send critical alerts and scan updates to security channels.", status: "Connected", icon: MessageSquare, target: "#security-alerts" },
  { key: "github", name: "GitHub", desc: "Create issues for vulnerabilities and sync remediation status.", status: "Connected", icon: Code2, target: "securescan/app" },
  { key: "jira", name: "Jira", desc: "Open tickets when vulnerabilities cross SLA thresholds.", status: "Available", icon: Wrench, target: "SEC project" },
  { key: "webhook", name: "Webhook", desc: "Post scan, report, and monitoring events to custom endpoints.", status: "Connected", icon: Webhook, target: "3 endpoints" },
];

const integrationActivity = [
  ["Slack alert delivered", "Critical vulnerability on example.com", "2 min ago", "Success"],
  ["GitHub issue created", "SQL injection remediation task", "36 min ago", "Success"],
  ["Webhook retry queued", "monitor.down event", "1 hour ago", "Retry"],
];

const auditEvents = [
  { id: "ACT-1029", type: "Scan", title: "Deep scan started", actor: "Ananya Verma", target: "example.com", time: "Today, 11:24 AM", status: "Success", severity: "Info" },
  { id: "ACT-1028", type: "Security", title: "MFA challenge passed", actor: "Rahul Sharma", target: "Chrome on Windows", time: "Today, 11:10 AM", status: "Success", severity: "Info" },
  { id: "ACT-1027", type: "Vulnerability", title: "Critical vulnerability assigned", actor: "Karan Mehta", target: "SQL Injection", time: "Today, 10:48 AM", status: "Review", severity: "Critical" },
  { id: "ACT-1026", type: "Report", title: "Executive report generated", actor: "System", target: "Weekly Summary", time: "Yesterday, 06:20 PM", status: "Success", severity: "Low" },
  { id: "ACT-1025", type: "Integration", title: "Webhook delivery failed", actor: "SecureScan API", target: "monitor.down", time: "Yesterday, 03:02 PM", status: "Retry", severity: "Medium" },
  { id: "ACT-1024", type: "Team", title: "Role changed to Admin", actor: "Rahul Sharma", target: "Ananya Verma", time: "20 May 2024", status: "Success", severity: "Info" },
];

function InfoCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="api-overview-card">
      <span className={`api-card-icon ${item.tone}`}>
        <Icon size={27} />
      </span>
      <span>
        <small>{item.label}</small>
        <strong>{item.value}</strong>
        <em>{item.detail}</em>
      </span>
    </article>
  );
}

function SimpleSettingsSection({ section }) {
  const data = settingSections[section] || settingSections.profile;
  const Icon = data.icon;

  return (
    <section className="settings-simple-panel">
      <span className="settings-simple-icon">
        <Icon size={34} />
      </span>
      <h3>{data.title}</h3>
      <p>{data.text}</p>
      <div className="settings-simple-grid">
        <div>
          <strong>General</strong>
          <span>Basic configuration and preferences</span>
        </div>
        <div>
          <strong>Access</strong>
          <span>Permissions and security controls</span>
        </div>
        <div>
          <strong>History</strong>
          <span>Recent changes and audit details</span>
        </div>
      </div>
    </section>
  );
}

const emptyProfileForm = {
  name: "",
  email: "",
  phoneNumber: "",
  organization: "",
  jobTitle: "",
  country: "",
  timezone: "",
};

const timeZoneOptions = [
  "",
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Australia/Sydney",
];

function mapUserToProfileForm(user) {
  return {
    name: user?.profile?.name || "",
    email: user?.email || "",
    phoneNumber: user?.profile?.phoneNumber || "",
    organization: user?.profile?.organization || "",
    jobTitle: user?.profile?.jobTitle || "",
    country: user?.profile?.country || "",
    timezone: user?.preferences?.timezone || "",
  };
}

function validateProfileForm(form) {
  if (!form.name.trim()) return "Full name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address.";
  if (form.phoneNumber.trim() && !/^[+]?[\d\s().-]{7,20}$/.test(form.phoneNumber.trim())) {
    return "Enter a valid phone number.";
  }
  return "";
}

function validateAvatarFile(file) {
  if (!file) return "Choose a profile picture first.";
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) return "Profile picture must be JPG, JPEG, PNG, or WEBP.";
  if (file.size > 5 * 1024 * 1024) return "Profile picture must be 5 MB or smaller.";
  return "";
}

function ProfileSettings() {
  const { user, refreshProfile, updateAuthenticatedUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(emptyProfileForm);
  const [account, setAccount] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const profileUser = await refreshProfile();
        if (!active) return;
        setProfile(mapUserToProfileForm(profileUser));
        setAccount(profileUser);
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
  }, [refreshProfile]);

  useEffect(() => {
    if (!user) return;
    setProfile(mapUserToProfileForm(user));
    setAccount(user);
  }, [user]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function selectAvatar(file) {
    const error = validateAvatarFile(file);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setAvatarFile(file);
    setMessage(null);
  }

  function handleAvatarInput(event) {
    selectAvatar(event.target.files?.[0]);
    event.target.value = "";
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
      await refreshProfile();
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
      await refreshProfile();
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to remove profile picture.") });
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    const error = validateProfileForm(profile);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setSaving(true);
    try {
      const result = await userApi.updateProfile({
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        organization: profile.organization,
        jobTitle: profile.jobTitle,
        country: profile.country,
        timezone: profile.timezone,
      });
      updateAuthenticatedUser(result.user);
      setProfile(mapUserToProfileForm(result.user));
      setAccount(result.user);
      setMessage({ type: "success", text: result.message || "Profile updated successfully." });
      await refreshProfile();
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to save profile.") });
    } finally {
      setSaving(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    selectAvatar(event.dataTransfer.files?.[0]);
  }

  const avatarUrl = avatarPreview || resolveAvatarUrl(account?.profile?.avatar);
  const initials = getInitials(profile.name, profile.email);

  return (
    <div className="profile-settings-layout">
      {message && <div className={`settings-message ${message.type === "error" ? "error" : ""}`}>{message.text}</div>}
      {loading && <div className="settings-message">Loading profile...</div>}

      <div className="profile-content-grid">
        <aside className="profile-side-column">
          <section className="settings-panel profile-card-panel profile-avatar-card">
            <div className="settings-panel-title">
              <h3>Profile Picture</h3>
              <p>Upload a JPG, JPEG, PNG, or WEBP image up to 5 MB.</p>
            </div>

            <div className="profile-avatar-wrap">
              <div className="profile-avatar-preview">
                {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
              </div>
            </div>

            <div
              className={dragActive ? "profile-dropzone active" : "profile-dropzone"}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <UploadCloud size={22} />
              <strong>Drop image here</strong>
              <span>or choose a file from your device</span>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarInput} />
            </div>

            <div className="profile-avatar-actions">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={saving}>
                <Camera size={15} /> Change
              </button>
              <button type="button" onClick={uploadAvatar} disabled={!avatarFile || saving}>
                <UploadCloud size={15} /> Upload
              </button>
              <button type="button" onClick={removeAvatar} disabled={saving || (!account?.profile?.avatar && !avatarFile)}>
                <Trash2 size={15} /> Remove
              </button>
            </div>
          </section>

          <section className="settings-panel profile-card-panel">
            <h3>Account Information</h3>
            <div className="profile-account-list">
              <span><b>User Role</b>{account?.role || ""}</span>
              <span><b>Account Status</b>{account?.status || ""}</span>
              <span><b>Account Created Date</b>{formatAccountDate(account?.createdAt)}</span>
              <span><b>Last Login</b>{formatAccountDate(account?.lastLogin)}</span>
            </div>
          </section>
        </aside>

        <section className="settings-panel profile-form-panel">
          <div className="settings-panel-title">
            <h3>Personal Information</h3>
            <p>These details come from your authenticated Breach Radar account.</p>
          </div>

          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              <span>Full Name</span>
              <input value={profile.name} onChange={(event) => updateProfile("name", event.target.value)} required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={profile.email} onChange={(event) => updateProfile("email", event.target.value)} required />
            </label>
            <label>
              <span>Phone Number</span>
              <input value={profile.phoneNumber} onChange={(event) => updateProfile("phoneNumber", event.target.value)} />
            </label>
            <label>
              <span>Organization</span>
              <input value={profile.organization} onChange={(event) => updateProfile("organization", event.target.value)} />
            </label>
            <label>
              <span>Job Title</span>
              <input value={profile.jobTitle} onChange={(event) => updateProfile("jobTitle", event.target.value)} />
            </label>
            <label>
              <span>Country</span>
              <input value={profile.country} onChange={(event) => updateProfile("country", event.target.value)} />
            </label>
            <label className="profile-wide-field">
              <span>Time Zone</span>
              <select value={profile.timezone} onChange={(event) => updateProfile("timezone", event.target.value)}>
                {timeZoneOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <div className="profile-actions">
              <button type="button" onClick={() => setProfile(mapUserToProfileForm(account))} disabled={saving}>Reset</button>
              <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function TeamSettings() {
  const [members, setMembers] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [orgForm, setOrgForm] = useState({
    name: "",
    logo: "",
    companyWebsite: "",
    industry: "",
    timezone: "UTC",
  });
  const [stats, setStats] = useState({ members: 0, active: 0, pending: 0, admins: 0, seatsUsed: 0, maxSeats: 0 });
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [manageableRoles, setManageableRoles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", role: "" });
  const [invite, setInvite] = useState({ email: "", role: "ANALYST" });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [copiedInviteId, setCopiedInviteId] = useState(null);

  const canManageTeam = ["OWNER", "ADMIN"].includes(currentUserRole);
  const isOwner = currentUserRole === "OWNER";

  function showMessage(type, text) {
    setMessage({ type, text });
  }

  function roleLabel(role) {
    return String(role || "").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
  }

  function statusLabel(status) {
    return roleLabel(status);
  }

  function formatTeamDate(value, fallback = "-") {
    return value ? formatAccountDate(value) : fallback;
  }

  function canEditMember(member) {
    if (!canManageTeam || member.type !== "member") return false;
    if (member.role === "OWNER") return false;
    if (member.role === "ADMIN" || currentUserRole === "ADMIN") return isOwner && member.role !== "OWNER";
    return true;
  }

  async function loadTeam(next = {}) {
    setLoading(true);
    try {
      const params = {
        page: next.page || pagination.page,
        limit: pagination.limit,
        search: next.search ?? filters.search,
        role: next.role ?? filters.role,
      };
      const data = await teamApi.getTeam(params);
      setMembers(data.members || []);
      setOrganization(data.organization || null);
      setOrgForm({
        name: data.organization?.name || "",
        logo: data.organization?.logo || "",
        companyWebsite: data.organization?.companyWebsite || "",
        industry: data.organization?.industry || "",
        timezone: data.organization?.timezone || "UTC",
      });
      setStats(data.stats || {});
      setPermissions(data.permissions || []);
      setRoles(data.roles || []);
      setManageableRoles(data.manageableRoles || []);
      setActivities(data.activities || []);
      setCurrentUserRole(data.currentUserRole || "");
      setPagination(data.pagination || { page: 1, limit: 8, total: 0, totalPages: 1 });
    } catch (error) {
      showMessage("error", getErrorMessage(error, "Failed to load team."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam({ page: 1 });
  }, []);

  async function inviteMember(event) {
    event.preventDefault();
    const email = invite.email.trim().toLowerCase();

    if (!email || !invite.role) {
      showMessage("error", "Email and role are required to send invitation.");
      return;
    }

    setSaving(true);
    try {
      const result = await teamApi.inviteMember({ email, role: invite.role });
      setInvite({ email: "", role: "ANALYST" });
      showMessage(result.emailDelivery?.success === false ? "error" : "success", result.message || `Invitation sent to ${email}.`);
      await loadTeam({ page: 1 });
    } catch (error) {
      showMessage("error", getErrorMessage(error, "Failed to send invitation."));
    } finally {
      setSaving(false);
    }
  }

  async function resendInvite(member) {
    setSaving(true);
    try {
      const result = await teamApi.resendInvitation(member.id);
      showMessage(result.emailDelivery?.success === false ? "error" : "success", result.message || `Invitation resent to ${member.email}.`);
      await loadTeam();
    } catch (error) {
      showMessage("error", getErrorMessage(error, "Failed to resend invitation."));
    } finally {
      setSaving(false);
    }
  }

  async function copyInviteLink(member) {
    if (!member.inviteLink) {
      showMessage("error", "Invite link is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(member.inviteLink);
      setCopiedInviteId(member.id);
      showMessage("success", "Invite link copied.");
      window.setTimeout(() => setCopiedInviteId(null), 1800);
    } catch (error) {
      showMessage("error", "Could not copy invite link.");
    }
  }

  async function updateRole(member, role) {
    setSaving(true);
    try {
      const result = await teamApi.updateMemberRole(member.id, role);
      showMessage("success", result.message || "Role updated.");
      await loadTeam();
    } catch (error) {
      showMessage("error", getErrorMessage(error, "Failed to update role."));
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(member, status) {
    setSaving(true);
    try {
      const result = await teamApi.updateMemberStatus(member.id, status);
      showMessage("success", result.message || "Member status updated.");
      await loadTeam();
    } catch (error) {
      showMessage("error", getErrorMessage(error, "Failed to update member status."));
    } finally {
      setSaving(false);
    }
  }

  async function confirmRemoveMember() {
    if (!removeTarget) return;
    setSaving(true);
    try {
      const result = await teamApi.removeMember(removeTarget.id);
      showMessage("success", result.message || `${removeTarget.email} removed from team.`);
      setRemoveTarget(null);
      await loadTeam({ page: 1 });
    } catch (error) {
      showMessage("error", getErrorMessage(error, "Failed to remove member."));
    } finally {
      setSaving(false);
    }
  }

  async function saveOrganization(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await teamApi.updateOrganization(orgForm);
      showMessage("success", result.message || "Organization settings saved.");
      await loadTeam();
    } catch (error) {
      showMessage("error", getErrorMessage(error, "Failed to save organization settings."));
    } finally {
      setSaving(false);
    }
  }

  function updateFilter(field, value) {
    const next = { ...filters, [field]: value };
    setFilters(next);
    loadTeam({ ...next, page: 1 });
  }

  return (
    <div className="team-settings-layout">
      {message && <div className={`settings-message ${message.type === "error" ? "error" : ""}`}>{message.text}</div>}

      <div className="team-stats-grid">
        {[
          ["Members", stats.members || 0, `${stats.seatsUsed || 0}/${stats.maxSeats || "Unlimited"} seats`, UsersRound, "green"],
          ["Active", stats.active || 0, "Currently active", ShieldCheck, "blue"],
          ["Pending", stats.pending || 0, "Invitations sent", Clock3, "orange"],
          ["Admins", stats.admins || 0, "Privileged users", Crown, "purple"],
        ].map(([label, value, detail, Icon, tone]) => (
          <article className="api-overview-card" key={label}>
            <span className={`api-card-icon ${tone}`}>
              <Icon size={27} />
            </span>
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
              <em>{detail}</em>
            </span>
          </article>
        ))}
      </div>

      <div className="team-content-grid">
        <section className="settings-panel team-members-panel">
          <div className="settings-panel-title">
            <h3>Team Members</h3>
            <p>Manage who can scan domains, review vulnerabilities, and approve remediation work.</p>
          </div>

          <div className="team-table-toolbar">
            <input
              placeholder="Search members"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
            <select value={filters.role} onChange={(event) => updateFilter("role", event.target.value)}>
              <option value="">All Roles</option>
              {roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
            </select>
          </div>

          <div className="team-member-list">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div className="team-skeleton-row" key={index} />)
            ) : members.length === 0 ? (
              <div className="team-empty-state">No team members match the current filters.</div>
            ) : (
              <div className="team-table-wrap">
                <table className="team-members-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => {
                      const avatarUrl = resolveAvatarUrl(member.avatar);
                      const displayName = member.name || member.email;
                      const editable = canEditMember(member);
                      return (
                        <tr key={`${member.type}-${member.id}`}>
                          <td>
                            <span className="team-avatar">
                              {avatarUrl ? <img src={avatarUrl} alt="" /> : getInitials(displayName, member.email)}
                            </span>
                          </td>
                          <td>{displayName}</td>
                          <td>{member.email}</td>
                          <td>
                            <select value={member.role} onChange={(event) => updateRole(member, event.target.value)} disabled={!editable || saving}>
                              {roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                            </select>
                          </td>
                          <td><span className={`team-status ${member.status === "PENDING" ? "pending" : member.status === "SUSPENDED" ? "suspended" : "active"}`}>{statusLabel(member.status)}</span></td>
                          <td>{formatTeamDate(member.joinedAt, member.type === "invitation" ? "Invitation pending" : "-")}</td>
                          <td>{formatTeamDate(member.lastLogin, "Never")}</td>
                          <td>
                            <div className="team-table-actions">
                              <button type="button" onClick={() => setViewMember(member)}>View</button>
                              {member.type === "invitation" ? (
                                <>
                                  <button type="button" onClick={() => resendInvite(member)} disabled={!canManageTeam || saving || member.status !== "PENDING"}>
                                    <Mail size={14} /> Resend Invite
                                  </button>
                                  <button type="button" onClick={() => copyInviteLink(member)} disabled={!canManageTeam || !member.inviteLink}>
                                    {copiedInviteId === member.id ? <Check size={14} /> : <Copy size={14} />} Copy Invite Link
                                  </button>
                                </>
                              ) : (
                                <>
                                  {member.status === "SUSPENDED" ? (
                                    <button type="button" onClick={() => updateStatus(member, "ACTIVE")} disabled={!editable || saving}>Activate</button>
                                  ) : (
                                    <button type="button" onClick={() => updateStatus(member, "SUSPENDED")} disabled={!editable || saving}>Suspend</button>
                                  )}
                                  <button type="button" onClick={() => setRemoveTarget(member)} disabled={!editable || saving}>Remove</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="team-pagination">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div>
              <button type="button" disabled={pagination.page <= 1 || loading} onClick={() => loadTeam({ page: pagination.page - 1 })}>Previous</button>
              <button type="button" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => loadTeam({ page: pagination.page + 1 })}>Next</button>
            </div>
          </div>
        </section>

        <aside className="team-side-column">
          <section className="settings-panel team-invite-panel">
            <h3>Invite Member</h3>
            <p>{canManageTeam ? "Add teammates and assign security access before they join." : "Owner or Admin access is required to invite teammates."}</p>
            <form onSubmit={inviteMember}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={invite.email}
                  disabled={!canManageTeam || saving}
                  onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                <span>Role</span>
                <select value={invite.role} disabled={!canManageTeam || saving} onChange={(event) => setInvite((current) => ({ ...current, role: event.target.value }))}>
                  {manageableRoles.map((role) => (
                    <option key={role} value={role} disabled={role === "ADMIN" && !isOwner}>{roleLabel(role)}</option>
                  ))}
                </select>
              </label>
              <button type="submit" disabled={!canManageTeam || saving}>
                <UserPlus size={16} /> {saving ? "Sending..." : "Send Invite"}
              </button>
            </form>
          </section>

          <section className="settings-panel team-permissions-panel">
            <h3>Role Permissions</h3>
            <div className="team-permission-table-wrap">
              <table className="team-permission-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    {roles.map((role) => <th key={role}>{roleLabel(role)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission.feature}>
                      <td>{permission.feature}</td>
                      {roles.map((role) => (
                        <td key={role}>{permission[role] ? <Check size={15} /> : "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </aside>
      </div>

      <div className="team-bottom-grid">
        <section className="settings-panel team-org-panel">
          <div className="settings-panel-title">
            <h3>Organization Settings</h3>
            <p>{isOwner ? "Update company profile information for this organization." : "Only the Owner can edit organization settings."}</p>
          </div>
          <form className="team-org-form" onSubmit={saveOrganization}>
            <label>
              <span>Organization Name</span>
              <input value={orgForm.name} disabled={!isOwner || saving} onChange={(event) => setOrgForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              <span>Organization Logo</span>
              <input placeholder="https://example.com/logo.png" value={orgForm.logo} disabled={!isOwner || saving} onChange={(event) => setOrgForm((current) => ({ ...current, logo: event.target.value }))} />
            </label>
            <label>
              <span>Company Website</span>
              <input placeholder="https://example.com" value={orgForm.companyWebsite} disabled={!isOwner || saving} onChange={(event) => setOrgForm((current) => ({ ...current, companyWebsite: event.target.value }))} />
            </label>
            <label>
              <span>Industry</span>
              <input value={orgForm.industry} disabled={!isOwner || saving} onChange={(event) => setOrgForm((current) => ({ ...current, industry: event.target.value }))} />
            </label>
            <label>
              <span>Timezone</span>
              <select value={orgForm.timezone} disabled={!isOwner || saving} onChange={(event) => setOrgForm((current) => ({ ...current, timezone: event.target.value }))}>
                {timeZoneOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <button type="submit" disabled={!isOwner || saving}>{saving ? "Saving..." : "Save Organization"}</button>
          </form>
        </section>

        <section className="settings-panel team-activity-panel">
          <div className="settings-panel-title">
            <h3>Team Activity</h3>
            <p>Recent login, scan, domain, report, vulnerability, role, and invitation events.</p>
          </div>
          <div className="team-activity-list">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div className="team-skeleton-row" key={index} />)
            ) : activities.length === 0 ? (
              <div className="team-empty-state">No team activity has been recorded yet.</div>
            ) : activities.map((activity) => (
              <article className="team-activity-row" key={activity.id}>
                <span className="team-avatar">
                  {resolveAvatarUrl(activity.user?.avatar) ? <img src={resolveAvatarUrl(activity.user.avatar)} alt="" /> : getInitials(activity.user?.name, activity.user?.email)}
                </span>
                <strong>{activity.user?.name || activity.user?.email || "System"}<small>{activity.action}{activity.target ? ` • ${activity.target}` : ""}</small></strong>
                <span>{formatTeamDate(activity.timestamp)}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      {removeTarget && (
        <div className="team-modal-backdrop">
          <div className="team-confirm-modal">
            <h3>Remove Team Member</h3>
            <p>Remove {removeTarget.email} from {organization?.name || "this organization"}?</p>
            <strong>This action cannot be undone.</strong>
            <div>
              <button type="button" onClick={() => setRemoveTarget(null)} disabled={saving}>Cancel</button>
              <button type="button" onClick={confirmRemoveMember} disabled={saving}>{saving ? "Removing..." : "Remove"}</button>
            </div>
          </div>
        </div>
      )}

      {viewMember && (
        <div className="team-modal-backdrop">
          <div className="team-confirm-modal">
            <h3>{viewMember.name || viewMember.email}</h3>
            <p>{viewMember.email}</p>
            <span className={`team-status ${viewMember.status === "PENDING" ? "pending" : viewMember.status === "SUSPENDED" ? "suspended" : "active"}`}>{roleLabel(viewMember.role)} • {statusLabel(viewMember.status)}</span>
            <p>Joined: {formatTeamDate(viewMember.joinedAt, viewMember.type === "invitation" ? "Invitation pending" : "-")}</p>
            <p>Last Login: {formatTeamDate(viewMember.lastLogin, "Never")}</p>
            <div>
              <button type="button" onClick={() => setViewMember(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanBillingSettings() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [billing, setBilling] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState("");

  // Modal states
  const [modalType, setModalType] = useState(null); // 'upgrade', 'downgrade'
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [billingCycleSelection, setBillingCycleSelection] = useState("monthly");
  const [downgradeError, setDowngradeError] = useState("");
  const [downgradeViolations, setDowngradeViolations] = useState([]);

  // Phase 2 states
  const [alerts, setAlerts] = useState({ domainsThreshold: 90, scansThreshold: 90, seatsThreshold: 90 });
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(true);

  const loadTimeline = async () => {
    try {
      setLoadingTimeline(true);
      const data = await billingApi.getTimeline();
      setTimeline(data);
    } catch (err) {
      console.error("Failed to load billing timeline", err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const loadBilling = async () => {
    try {
      setLoading(true);
      const data = await billingApi.getBilling();
      setBilling(data);
      setBillingCycle(data.subscription?.billingCycle === "yearly" ? "yearly" : "monthly");
      if (data.subscription?.usageAlerts) {
        setAlerts({
          domainsThreshold: data.subscription.usageAlerts.domainsThreshold || 90,
          scansThreshold: data.subscription.usageAlerts.scansThreshold || 90,
          seatsThreshold: data.subscription.usageAlerts.seatsThreshold || 90
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to load billing.") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
    loadTimeline();
  }, []);

  async function saveAlertSettings(e) {
    e.preventDefault();
    setSavingAlerts(true);
    setMessage(null);
    try {
      const result = await billingApi.updateUsageAlerts(alerts);
      setMessage({ type: "success", text: "Usage alert thresholds saved successfully!" });
      setBilling(prev => ({
        ...prev,
        subscription: {
          ...prev.subscription,
          usageAlerts: result.usageAlerts
        }
      }));
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err, "Failed to save alert settings.") });
    } finally {
      setSavingAlerts(false);
    }
  }

  const currentPlan = billing?.subscription?.currentPlan || billing?.organization?.subscriptionPlan || "Starter";
  const activePlan = billing?.activePlan || billing?.plans?.find((plan) => plan.name === currentPlan) || null;
  const isOwner = billing?.role === "OWNER";
  const currency = activePlan?.currency || "INR";
  const totalPaid = billing?.invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0) || 0;

  function formatMoney(amount, planCurrency = currency) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: planCurrency,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  }

  function formatBillingDate(value) {
    if (!value) return "Not scheduled";
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  }

  function planDescription(plan) {
    if (!plan) return "Your billing details are loading.";
    if (plan.name === "Starter") return "Core scanning and reporting for small teams.";
    if (plan.name === "Professional") return "Higher scan volume, API access, and team workflows.";
    if (plan.name === "Business") return "Advanced monitoring, compliance reports, and larger teams.";
    return "Custom security operations with enterprise governance.";
  }

  function planLimits(plan) {
    const displayVal = (val) => (val >= 999999 ? "Unlimited" : `${val.toLocaleString()}`);
    const seats = plan.seatLimit >= 999999 ? "Unlimited seats" : `${plan.seatLimit} seats`;
    return [
      `${displayVal(plan.domainLimit)} domains`,
      `${displayVal(plan.scanLimit)} scans/month`,
      seats,
      ...(plan.features || []),
    ];
  }

  const handleSelectPlan = (plan) => {
    if (!isOwner) {
      setMessage({ type: "error", text: "Only the organization owner can change the plan." });
      return;
    }

    const planOrder = ["Starter", "Professional", "Business", "Enterprise"];
    const currentIdx = planOrder.indexOf(currentPlan);
    const targetIdx = planOrder.indexOf(plan.name);

    if (plan.name === currentPlan) return;

    if (targetIdx < currentIdx) {
      // Downgrade check
      const violations = [];
      const usage = billing?.usage || [];
      
      const domainUsage = usage.find(u => u.key === 'domains');
      if (domainUsage && domainUsage.used > plan.domainLimit) {
        violations.push(`You are currently using ${domainUsage.used} domains, but the ${plan.displayName || plan.name} plan only allows ${plan.domainLimit} domains.`);
      }

      const seatUsage = usage.find(u => u.key === 'seats');
      const maxTargetSeats = plan.seatLimit;
      if (seatUsage && seatUsage.used > maxTargetSeats) {
        violations.push(`You have active/pending ${seatUsage.used} seats, but the ${plan.displayName || plan.name} plan only allows ${maxTargetSeats} seats.`);
      }

      const scanUsage = usage.find(u => u.key === 'scans');
      if (scanUsage && scanUsage.used > plan.scanLimit) {
        violations.push(`You have run ${scanUsage.used} scans this cycle, but the ${plan.displayName || plan.name} plan only allows ${plan.scanLimit} scans.`);
      }

      if (violations.length > 0) {
        setDowngradeViolations(violations);
        setDowngradeError("Cannot Downgrade: Your current usage exceeds the target plan limits.");
      } else {
        setDowngradeViolations([]);
        setDowngradeError("");
      }
      setSelectedPlanForModal(plan);
      setModalType("downgrade");
    } else {
      // Upgrade
      setSelectedPlanForModal(plan);
      setBillingCycleSelection(billingCycle);
      setModalType("upgrade");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  async function executeUpgrade(e) {
    e.preventDefault();
    setSavingPlan(selectedPlanForModal.name);
    setMessage(null);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      const response = await billingApi.createRazorpayOrder({
        planId: selectedPlanForModal.id || selectedPlanForModal.name,
        billingCycle: billingCycleSelection
      });

      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        name: "SecureScan",
        description: `Upgrade to ${selectedPlanForModal.displayName || selectedPlanForModal.name}`,
        order_id: response.orderId,
        handler: async function (paymentRes) {
          setSavingPlan(selectedPlanForModal.name);
          try {
            await billingApi.verifyRazorpayPayment({
              razorpay_payment_id: paymentRes.razorpay_payment_id,
              razorpay_order_id: paymentRes.razorpay_order_id,
              razorpay_signature: paymentRes.razorpay_signature
            });

            const nextBilling = await billingApi.getBilling();
            setBilling(nextBilling);
            setModalType(null);
            setMessage({ type: "success", text: `${selectedPlanForModal.displayName || selectedPlanForModal.name} plan activated successfully!` });
          } catch (verifyErr) {
            setMessage({ type: "error", text: getErrorMessage(verifyErr, "Payment verification failed.") });
          } finally {
            setSavingPlan("");
          }
        },
        prefill: {
          email: billing?.paymentMethod?.billingEmail || ""
        },
        theme: {
          color: "#3b82f6"
        },
        modal: {
          ondismiss: function () {
            setSavingPlan("");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err, "Failed to initiate payment flow.") });
      setSavingPlan("");
    }
  }

  async function executeDowngrade() {
    setSavingPlan(selectedPlanForModal.name);
    setMessage(null);
    try {
      const data = await billingApi.downgradePlan({
        planName: selectedPlanForModal.name,
        billingCycle
      });
      setBilling(data.overview || data);
      setModalType(null);
      setMessage({ type: "success", text: `${selectedPlanForModal.name} plan activated (Downgraded successfully).` });
      await loadBilling();
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err, "Failed to downgrade plan.") });
    } finally {
      setSavingPlan("");
    }
  }

  async function executeCancelSubscription() {
    setSavingPlan("cancel");
    setMessage(null);
    try {
      const data = await billingApi.cancelSubscription();
      setBilling(data.overview || data);
      setCancelModalOpen(false);
      setMessage({ type: "success", text: "Subscription cancelled successfully." });
      await loadBilling();
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to cancel plan.") });
    } finally {
      setSavingPlan("");
    }
  }

  async function downloadInvoice(invoice) {
    try {
      setMessage({ type: "info", text: `Compiling PDF for ${invoice.invoiceNumber}...` });
      const blob = await billingApi.downloadInvoicePdf(invoice.id);
      
      const fileUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `${invoice.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(fileUrl);
      
      setMessage({ type: "success", text: `Invoice ${invoice.invoiceNumber} PDF downloaded successfully.` });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err, "Failed to download invoice PDF.") });
    }
  }

  return (
    <div className="billing-settings-layout">
      {message && <div className={`settings-message ${message.type === "error" ? "error" : message.type === "info" ? "" : "success"}`}>{message.text}</div>}
      {loading && <div className="settings-message">Loading billing...</div>}

      <section className="settings-panel billing-hero-panel">
        <div>
          <span className="profile-status" style={{ background: billing?.subscription?.status === "cancelled" ? "rgba(239, 68, 68, 0.16)" : "rgba(0, 214, 143, 0.14)", color: billing?.subscription?.status === "cancelled" ? "#ff6b6b" : "#00d68f" }}>
            {billing?.subscription?.status === "cancelled" ? "Cancelled / Expires Soon" : billing?.subscription?.status === "suspended" ? "Suspended" : "Active Subscription"}
          </span>
          <h3>{currentPlan} Plan</h3>
          <p>{planDescription(activePlan)}</p>
          <div className="profile-meta-row">
            <span><CreditCard size={15} /> {billing?.paymentMethod?.provider || "manual"} billing</span>
            <span><Clock3 size={15} /> Renews {formatBillingDate(billing?.subscription?.nextBillingDate)}</span>
            <span><ShieldCheck size={15} /> {billing?.organization?.name || "Workspace"} billing</span>
          </div>
        </div>
        <div className="billing-price-card">
          <small>{billingCycle === "monthly" ? "Monthly billing" : "Annual billing"}</small>
          <strong>{formatMoney(activePlan?.[billingCycle] || 0)}</strong>
          <span>{billingCycle === "monthly" ? "per month" : "per year"}</span>
          <div className="billing-cycle-toggle">
            <button className={billingCycle === "monthly" ? "active" : ""} type="button" onClick={() => setBillingCycle("monthly")}>
              Monthly
            </button>
            <button className={billingCycle === "yearly" ? "active" : ""} type="button" onClick={() => setBillingCycle("yearly")}>
              Yearly
            </button>
          </div>
        </div>
      </section>

      <div className="billing-content-grid">
        <section className="settings-panel billing-usage-panel">
          <div className="settings-panel-title">
            <h3>Plan Usage</h3>
            <p>Track domain, scan, report, and API team limits in real-time.</p>
          </div>
          <div className="billing-usage-list">
            {(billing?.usage || []).map((item) => {
              const numericLimit = Number(item.rawLimit) || 0;
              const percent = numericLimit ? Math.min(Math.round((item.used / numericLimit) * 100), 100) : 0;

              return (
                <div className={`billing-usage-row ${item.tone}`} key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.used.toLocaleString()} / {item.limit}</span>
                  </div>
                  <i><em style={{ width: `${percent}%` }} /></i>
                  <small>{percent}% used</small>
                </div>
              );
            })}
            {!loading && !billing?.usage?.length && <p>No usage data available yet.</p>}
          </div>
        </section>

        <aside className="billing-side-column">
          <section className="settings-panel billing-card-panel">
            <h3>Subscription Summary</h3>
            <div className="profile-account-list">
              <span><b>Current Plan</b>{currentPlan}</span>
              <span><b>Subscription Status</b><span style={{ color: billing?.subscription?.status === 'active' ? '#00d68f' : '#ff6b6b', fontWeight: 'bold' }}>{billing?.subscription?.status || "-"}</span></span>
              <span><b>Payment Status</b>{billing?.subscription?.paymentStatus || "-"}</span>
              <span><b>Next Billing Date</b>{formatBillingDate(billing?.subscription?.nextBillingDate)}</span>
              <span><b>Amount Paid</b>{formatMoney(totalPaid)}</span>
              <span><b>Invoices Count</b>{billing?.invoices?.length || 0}</span>
            </div>
          </section>

          <section className="settings-panel billing-card-panel">
            <h3>Payment Method</h3>
            <div className="profile-account-list">
              <span><b>Provider</b>{billing?.paymentMethod?.provider || "manual"}</span>
              <span><b>Billing Email</b>{billing?.paymentMethod?.billingEmail || "-"}</span>
              <span><b>Status</b>{billing?.subscription?.paymentStatus || "-"}</span>
            </div>
          </section>

          <section className="settings-panel billing-card-panel">
            <h3>Billing Controls</h3>
            <div className="billing-control-list">
              <button type="button" onClick={() => setCancelModalOpen(true)} disabled={!isOwner || currentPlan === "Starter" || billing?.subscription?.status === "cancelled"}>
                Cancel plan
              </button>
            </div>
          </section>
        </aside>
      </div>

      <section className="settings-panel billing-plans-panel">
        <div className="settings-panel-title">
          <h3>Available Plans</h3>
          <p>Switch plans as your monitored domains, scan volume, and reporting needs grow.</p>
        </div>
        <div className="billing-plan-grid">
          {(billing?.plans || []).map((plan) => (
            <article className={plan.name === currentPlan ? "billing-plan-card active" : "billing-plan-card"} key={plan.name}>
              <div className="billing-plan-head">
                <h4>{plan.displayName || plan.name}</h4>
                {plan.name === currentPlan && <span>Current</span>}
              </div>
              <strong>{formatMoney(plan[billingCycle], plan.currency)}<small>/{billingCycle === "monthly" ? "mo" : "yr"}</small></strong>
              <p>{planDescription(plan)}</p>
              <ul>
                {planLimits(plan).map((limit) => (
                  <li key={limit}><Check size={14} /> {limit}</li>
                ))}
              </ul>
              <button type="button" onClick={() => handleSelectPlan(plan)} disabled={!isOwner || plan.name === currentPlan || (plan.name === "Enterprise" && currentPlan === "Enterprise")}>
                {plan.name === currentPlan ? "Selected" : "Choose Plan"}
              </button>
            </article>
          ))}
          {!loading && !billing?.plans?.length && <p>No active plans are configured.</p>}
        </div>
      </section>

      <section className="settings-panel billing-invoices-panel">
        <div className="settings-panel-title">
          <h3>Invoice History</h3>
          <p>Download paid invoices for finance and compliance records.</p>
        </div>
        <div className="billing-invoice-list">
          {(billing?.invoices || []).map((invoice) => (
            <article className="billing-invoice-row" key={invoice.id || invoice.invoiceNumber}>
              <FileText size={18} />
              <strong>{invoice.invoiceNumber}<small>{formatBillingDate(invoice.date)}</small></strong>
              <span>{invoice.amountLabel || formatMoney(invoice.amount + invoice.tax, invoice.currency)}</span>
              <b>{invoice.status}</b>
              <button type="button" onClick={() => downloadInvoice(invoice)}>
                <Download size={15} /> Download PDF
              </button>
            </article>
          ))}
          {!loading && !billing?.invoices?.length && <p>No invoices generated yet.</p>}
        </div>
      </section>

      {/* 1. UPGRADE CHECKOUT MODAL */}
      {modalType === "upgrade" && selectedPlanForModal && (
        <div className="team-modal-backdrop">
          <div className="team-confirm-modal billing-modal">
            <h3>Upgrade Plan: {selectedPlanForModal.displayName}</h3>
            <p>Complete payment details below to subscribe to the {selectedPlanForModal.displayName} plan.</p>
            
            <div className="billing-modal-features">
              <h4>Limits included:</h4>
              <ul>
                <li><Check size={12} /> {selectedPlanForModal.domainLimit >= 999999 ? "Unlimited" : selectedPlanForModal.domainLimit} Domains</li>
                <li><Check size={12} /> {selectedPlanForModal.scanLimit >= 999999 ? "Unlimited" : selectedPlanForModal.scanLimit} Scans/month</li>
                <li><Check size={12} /> {selectedPlanForModal.seatLimit >= 999999 ? "Unlimited" : selectedPlanForModal.seatLimit} Team seats</li>
                {(selectedPlanForModal.features || []).slice(0, 3).map((f) => (
                  <li key={f}><Check size={12} /> {f}</li>
                ))}
              </ul>
            </div>

            <div className="billing-cycle-toggle" style={{ marginTop: 0, marginBottom: "16px" }}>
              <button className={billingCycleSelection === "monthly" ? "active" : ""} type="button" onClick={() => setBillingCycleSelection("monthly")}>
                Monthly
              </button>
              <button className={billingCycleSelection === "yearly" ? "active" : ""} type="button" onClick={() => setBillingCycleSelection("yearly")}>
                Yearly
              </button>
            </div>

            <div style={{ background: "rgba(0, 214, 143, 0.05)", border: "1px solid rgba(0, 214, 143, 0.2)", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", color: "#aeb8c7" }}>Amount to Pay:</span>
              <h4 style={{ margin: "4px 0 0 0", color: "#00d68f", fontSize: "20px" }}>
                {formatMoney(billingCycleSelection === "monthly" ? selectedPlanForModal.monthly : selectedPlanForModal.yearly)}
                <small style={{ fontSize: "11px", color: "#aeb8c7", fontWeight: "normal" }}>
                  /{billingCycleSelection === "monthly" ? "mo" : "yr"}
                </small>
              </h4>
            </div>

             <form onSubmit={executeUpgrade} style={{ display: "grid", gap: "12px" }}>
               <div style={{ color: "#aeb8c7", fontSize: "13px", lineHeight: "1.5", margin: "5px 0 15px 0" }}>
                 Secure transactions are processed directly via Razorpay. Click "Proceed to Pay" to launch the payment screen and complete your transaction.
               </div>

               <div className="billing-modal-actions">
                 <button className="secondary" type="button" onClick={() => setModalType(null)} disabled={savingPlan}>Cancel</button>
                 <button className="primary" type="submit" disabled={savingPlan}>
                   {savingPlan ? "Loading Checkout..." : "Proceed to Pay"}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* 2. DOWNGRADE WARNING & BLOCKED MODAL */}
      {modalType === "downgrade" && selectedPlanForModal && (
        <div className="team-modal-backdrop">
          <div className="team-confirm-modal billing-modal">
            <h3 style={{ color: downgradeError ? "#ef4444" : "#eab308" }}>
              {downgradeError ? "Downgrade Blocked" : "Downgrade Subscription"}
            </h3>
            <p>You are requesting a downgrade to the {selectedPlanForModal.displayName} plan.</p>

            {downgradeError ? (
              <div className="billing-modal-alert">
                <div className="billing-modal-alert-title">
                  <Info size={16} /> Asset Usage Exceeded
                </div>
                <p style={{ fontSize: "12px", color: "#fca5a5", margin: "0 0 8px 0" }}>
                  Your current workspace or seat counts exceed the limits of the {selectedPlanForModal.name} tier. Please remove assets before downgrading.
                </p>
                <ul className="billing-modal-alert-list">
                  {downgradeViolations.map((v, idx) => (
                    <li key={idx}>{v}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ background: "rgba(234, 179, 8, 0.05)", border: "1px solid rgba(234, 179, 8, 0.2)", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", color: "#eab308", fontWeight: "bold" }}>Warning:</span>
                <p style={{ fontSize: "12px", color: "#fef08a", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                  Downgrading will immediately reduce your workspace capacities to {selectedPlanForModal.domainLimit} domains and {selectedPlanForModal.seatLimit} team seats.
                </p>
              </div>
            )}

            <div className="billing-modal-actions">
              <button className="secondary" type="button" onClick={() => setModalType(null)} disabled={savingPlan}>Cancel</button>
              <button 
                className="primary" 
                style={{ 
                  background: downgradeError ? "#1e293b" : "linear-gradient(180deg, #f87171, #ef4444)", 
                  color: downgradeError ? "#64748b" : "#fff",
                  cursor: downgradeError ? "not-allowed" : "pointer" 
                }}
                disabled={!!downgradeError || savingPlan}
                onClick={executeDowngrade}
              >
                {savingPlan ? "Downgrading..." : "Confirm Downgrade"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CANCEL SUBSCRIPTION MODAL */}
      {cancelModalOpen && (
        <div className="team-modal-backdrop">
          <div className="team-confirm-modal">
            <h3>Cancel Subscription?</h3>
            <p>We're sorry to see you go. If you cancel, your current billing tier will remain active until the end of your billing cycle.</p>
            <p style={{ fontSize: "12px", color: "#aeb8c7" }}>
              On <strong>{formatBillingDate(billing?.subscription?.nextBillingDate)}</strong>, your organization limits will drop to the free Starter tier.
            </p>
            <div className="billing-modal-actions">
              <button className="secondary" type="button" onClick={() => setCancelModalOpen(false)} disabled={savingPlan}>Keep Subscription</button>
              <button 
                className="primary" 
                style={{ background: "linear-gradient(180deg, #f87171, #ef4444)", color: "#fff" }}
                disabled={savingPlan}
                onClick={executeCancelSubscription}
              >
                {savingPlan ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 2. TRANSACTIONS TABLE */}
      <section className="settings-panel billing-invoices-panel" style={{ marginTop: '24px' }}>
        <div className="settings-panel-title">
          <h3>Recent Transactions</h3>
          <p>A ledger of all processed or pending billing events for this workspace.</p>
        </div>
        <div className="team-table-wrap">
          <table className="team-members-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {(billing?.transactions || []).map((txn) => {
                const matchingInvoice = billing?.invoices?.find(inv => inv.transactionId === txn.transactionId);
                return (
                  <tr key={txn.id || txn.transactionId}>
                    <td>{formatBillingDate(txn.createdAt)}</td>
                    <td>{txn.metadata?.planName || activePlan?.name || "Professional"}</td>
                    <td>{txn.amountLabel || formatMoney(txn.amount, txn.currency)}</td>
                    <td>
                      <span className={`team-status ${txn.status === 'succeeded' ? 'active' : txn.status === 'pending' ? 'pending' : 'suspended'}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td>
                      {matchingInvoice ? (
                        <button type="button" className="sa-btn sa-btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => downloadInvoice(matchingInvoice)}>
                          Download
                        </button>
                      ) : (
                        <span style={{ color: '#64748b' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!billing?.transactions?.length && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No transaction history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. ALERTS SETTINGS PANEL */}
      <section className="settings-panel billing-invoices-panel" style={{ marginTop: '24px' }}>
        <div className="settings-panel-title">
          <h3>Usage Alert Thresholds</h3>
          <p>Configure notification alerts for domain counts, monthly scans, and seat limits.</p>
        </div>
        <form onSubmit={saveAlertSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end', marginTop: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Domain Usage Alert</span>
            <select 
              value={alerts.domainsThreshold} 
              onChange={(e) => setAlerts(prev => ({ ...prev, domainsThreshold: Number(e.target.value) }))}
              style={{ background: '#091421', border: '1px solid #20324a', color: '#f8fafc', padding: '8px', borderRadius: '6px' }}
            >
              <option value={50}>50% Usage</option>
              <option value={75}>75% Usage</option>
              <option value={90}>90% Usage</option>
              <option value={100}>100% Usage</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Scan Usage Alert</span>
            <select 
              value={alerts.scansThreshold} 
              onChange={(e) => setAlerts(prev => ({ ...prev, scansThreshold: Number(e.target.value) }))}
              style={{ background: '#091421', border: '1px solid #20324a', color: '#f8fafc', padding: '8px', borderRadius: '6px' }}
            >
              <option value={50}>50% Usage</option>
              <option value={75}>75% Usage</option>
              <option value={90}>90% Usage</option>
              <option value={100}>100% Usage</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Seat Usage Alert</span>
            <select 
              value={alerts.seatsThreshold} 
              onChange={(e) => setAlerts(prev => ({ ...prev, seatsThreshold: Number(e.target.value) }))}
              style={{ background: '#091421', border: '1px solid #20324a', color: '#f8fafc', padding: '8px', borderRadius: '6px' }}
            >
              <option value={50}>50% Usage</option>
              <option value={75}>75% Usage</option>
              <option value={90}>90% Usage</option>
              <option value={100}>100% Usage</option>
            </select>
          </label>
          <button type="submit" className="sa-btn" style={{ height: '38px' }} disabled={savingAlerts}>
            {savingAlerts ? 'Saving...' : 'Save Thresholds'}
          </button>
        </form>
      </section>

      {/* 4. SUBSCRIPTION LIFECYCLE TIMELINE */}
      <section className="settings-panel billing-invoices-panel" style={{ marginTop: '24px' }}>
        <div className="settings-panel-title">
          <h3>Subscription Lifecycle Timeline</h3>
          <p>A chronological record of subscription changes, payments, and invoice occurrences.</p>
        </div>
        <div className="billing-timeline-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #20324a', marginTop: '20px', marginLeft: '8px' }}>
          {timeline.map((event, index) => (
            <article key={event.id || index} style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '-31px',
                top: '2px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: event.action === 'Payment Success' || event.action === 'Plan Upgrade' ? '#00d68f' : event.status === 'Failure' ? '#ef4444' : '#3b82f6',
                border: '3px solid #07111f'
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ color: '#f8fafc', fontSize: '14px' }}>{event.action}</strong>
                <small style={{ color: '#64748b' }}>{formatBillingDate(event.timestamp)}</small>
              </div>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>{event.description}</p>
            </article>
          ))}
          {!timeline.length && !loadingTimeline && <p style={{ color: '#64748b' }}>No timeline events recorded.</p>}
        </div>
      </section>
    </div>
  );
}

function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    scanCompleted: true,
    vulnerabilityDetected: true,
    weeklyReports: true,
    billingAlerts: true,
    teamInvitations: true,
    marketingEmails: false,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsData, logsData] = await Promise.all([
          settingsApi.getNotifications(),
          notificationApi.getNotifications()
        ]);
        if (settingsData) setPrefs(settingsData);
        if (logsData) setLogs(logsData);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const triggerToast = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleToggle = async (key) => {
    try {
      const updated = { ...prefs, [key]: !prefs[key] };
      setPrefs(updated);
      await settingsApi.updateNotifications(updated);
      triggerToast("Preference updated and saved successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const sendTest = async () => {
    try {
      const res = await notificationApi.sendTestNotification();
      triggerToast(res.message || "Test notification sent successfully.");
      // Reload logs
      const logsData = await notificationApi.getNotifications();
      setLogs(logsData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const formatLogDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `Sent ${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Sent ${diffHours} hours ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  if (loading) {
    return <div style={{ padding: "40px", textRendering: "optimizeLegibility", textAlign: "center", color: "#94a3b8" }}>Loading preferences...</div>;
  }

  const enabledRulesCount = Object.keys(prefs).filter(k => k !== "emailAlerts" && prefs[k]).length;

  const ruleItems = [
    { key: "vulnerabilityDetected", title: "Vulnerability detected", desc: "Instant alert when a vulnerability is found in any domain." },
    { key: "scanCompleted", title: "Scan completed", desc: "Notify when a domain crawl or vulnerability scan completes." },
    { key: "weeklyReports", title: "Weekly digest reports", desc: "Receive weekly PDF executive status summaries." },
    { key: "billingAlerts", title: "Billing & subscription alerts", desc: "Receive renewal receipt invoices and limit warning updates." },
    { key: "teamInvitations", title: "Team invitations", desc: "Get alerted when invited to join a new organization." },
    { key: "marketingEmails", title: "Marketing & updates", desc: "Hear about newly released scanner versions and feature releases." }
  ];

  return (
    <div className="notification-settings-layout">
      {error && <div className="settings-error-banner" style={{ background: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid #ef4444", padding: "12px", borderRadius: "6px", color: "#fca5a5", marginBottom: "20px" }}>{error}</div>}
      {message && <div className="settings-message">{message}</div>}

      <div className="notification-stats-grid">
        {[
          ["Enabled Toggles", enabledRulesCount, "Active alert preference rules", Bell, "green"],
          ["Delivery Mode", prefs.emailAlerts ? "Email Enabled" : "Email Disabled", prefs.emailAlerts ? "Primary inbox active" : "Global inbox muted", Mail, prefs.emailAlerts ? "blue" : "orange"],
          ["Notification Log", logs.length, "Recent log events", Activity, "purple"],
          ["Delivery SLA", "Instant", "Real-time alerts", Clock3, "orange"],
        ].map(([label, value, detail, Icon, tone]) => (
          <article className="api-overview-card" key={label}>
            <span className={`api-card-icon ${tone}`}>
              <Icon size={27} />
            </span>
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
              <em>{detail}</em>
            </span>
          </article>
        ))}
      </div>

      <div className="notification-content-grid">
        <section className="settings-panel notification-events-panel">
          <div className="settings-panel-title">
            <h3>Notification Rules</h3>
            <p>Choose which security events should trigger alerts for your account.</p>
          </div>

          <div className="notification-rule-list">
            {ruleItems.map((item) => (
              <button className="notification-rule-row" type="button" key={item.key} onClick={() => handleToggle(item.key)}>
                <span className={prefs[item.key] ? "notification-toggle active" : "notification-toggle"}>{prefs[item.key] ? "On" : "Off"}</span>
                <strong>{item.title}<small>{item.desc}</small></strong>
                <b>Email</b>
              </button>
            ))}
          </div>
        </section>

        <aside className="notification-side-column">
          <section className="settings-panel notification-channel-panel">
            <h3>Delivery Channels</h3>
            <div className="notification-channel-list">
              <button type="button" onClick={() => handleToggle("emailAlerts")}>
                <Mail size={17} />
                <span>Email Notifications<small>Global toggle to enable email delivery</small></span>
                <i className={prefs.emailAlerts ? "active" : ""}>{prefs.emailAlerts ? "On" : "Off"}</i>
              </button>
            </div>
            <button className="notification-test-button" type="button" onClick={sendTest} style={{ cursor: "pointer" }}>
              Send Test Notification
            </button>
          </section>
        </aside>
      </div>

      <section className="settings-panel notification-activity-panel">
        <div className="settings-panel-title">
          <h3>Recent Notifications</h3>
          <p>Latest alerts delivered to your account.</p>
        </div>
        <div className="notification-activity-list">
          {logs.length === 0 ? (
            <div style={{ padding: "30px", textRendering: "optimizeLegibility", textAlign: "center", color: "#64748b" }}>No recent notifications. Click "Send Test Notification" to trigger one.</div>
          ) : (
            logs.map((item) => (
              <article className="notification-activity-row" key={item._id}>
                <Bell size={18} />
                <strong>{item.title}<small>{item.message}</small></strong>
                <span>{formatLogDate(item.createdAt)}</span>
                <b className={item.type === "TEST_ALERT" ? "resolved" : "critical"}>{item.type.replace("_", " ")}</b>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ScanPreferencesSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [prefs, setPrefs] = useState({
    scanDepth: 3,
    concurrencyLimit: 2,
    timeout: 15,
    followRedirects: true,
    scanSchedule: "weekly",
    includeSubdomains: true,
    portScanEnabled: true,
    technologyFingerprinting: true,
  });

  useEffect(() => {
    async function loadPrefs() {
      try {
        const data = await settingsApi.getScanPreferences();
        if (data) {
          setPrefs(data);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadPrefs();
  }, []);

  const triggerToast = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 4000);
  };

  const updatePref = (field, value) => {
    setPrefs((current) => ({ ...current, [field]: value }));
  };

  const togglePref = (field) => {
    setPrefs((current) => ({ ...current, [field]: !current[field] }));
  };

  const savePreferences = async (event) => {
    event.preventDefault();
    try {
      await settingsApi.updateScanPreferences(prefs);
      triggerToast("Scan preferences saved successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const resetPreferences = async () => {
    try {
      const defaults = {
        scanDepth: 3,
        concurrencyLimit: 2,
        timeout: 15,
        followRedirects: true,
        scanSchedule: "weekly",
        includeSubdomains: true,
        portScanEnabled: true,
        technologyFingerprinting: true,
      };
      setPrefs(defaults);
      await settingsApi.updateScanPreferences(defaults);
      triggerToast("Scan preferences reset to defaults.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textRendering: "optimizeLegibility", textAlign: "center", color: "#94a3b8" }}>Loading scan preferences...</div>;
  }

  return (
    <div className="scan-preferences-layout">
      {error && <div className="settings-error-banner" style={{ background: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid #ef4444", padding: "12px", borderRadius: "6px", color: "#fca5a5", marginBottom: "20px" }}>{error}</div>}
      {message && <div className="settings-message">{message}</div>}

      <div className="scan-pref-stats-grid">
        {[
          ["Crawl Depth", `${prefs.scanDepth} levels`, "Domain link crawling depth", ShieldCheck, "green"],
          ["Concurrency", `${prefs.concurrencyLimit} checks`, "Parallel vulnerability scanning checks", Activity, "blue"],
          ["Schedule", prefs.scanSchedule.toUpperCase(), "Scan schedule frequency trigger", BarChart3, "purple"],
          ["SLA Timeout", `${prefs.timeout} min`, "Maximum scan execution timeout limit", Clock3, "orange"],
        ].map(([label, value, detail, Icon, tone]) => (
          <article className="api-overview-card" key={label}>
            <span className={`api-card-icon ${tone}`}>
              <Icon size={27} />
            </span>
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
              <em>{detail}</em>
            </span>
          </article>
        ))}
      </div>

      <div className="scan-pref-content-grid">
        <section className="settings-panel scan-pref-main-panel">
          <div className="settings-panel-title">
            <h3>Default Scan Configuration</h3>
            <p>Set the scan behavior used when a new domain scan is started from dashboard, domains, or monitoring workflows.</p>
          </div>

          <form className="scan-pref-form" onSubmit={savePreferences}>
            <label>
              <span>Crawl Depth</span>
              <input type="range" min="1" max="6" value={prefs.scanDepth} onChange={(event) => updatePref("scanDepth", Number(event.target.value))} />
              <b>{prefs.scanDepth} levels</b>
            </label>
            <label>
              <span>Concurrency</span>
              <input type="range" min="2" max="16" value={prefs.concurrencyLimit} onChange={(event) => updatePref("concurrencyLimit", Number(event.target.value))} />
              <b>{prefs.concurrencyLimit} checks</b>
            </label>
            <label>
              <span>Request Timeout (minutes)</span>
              <input type="number" min="10" max="120" value={prefs.timeout} onChange={(event) => updatePref("timeout", Number(event.target.value))} />
            </label>
            <label>
              <span>Schedule</span>
              <select value={prefs.scanSchedule} onChange={(event) => updatePref("scanSchedule", event.target.value)}>
                <option value="manual">Manual</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <div className="scan-pref-actions">
              <button type="button" onClick={resetPreferences}>Reset Defaults</button>
              <button type="submit">Save Preferences</button>
            </div>
          </form>
        </section>

        <aside className="scan-pref-side-column">
          <section className="settings-panel scan-pref-toggles-panel">
            <h3>Scan Behavior</h3>
            <div className="scan-pref-toggle-list">
              {[
                ["followRedirects", "Follow redirects", "Instruct crawlers to follow HTTP redirects automatically."],
                ["includeSubdomains", "Include subdomains", "Auto-discover and crawl subdomains of specified targets."],
                ["portScanEnabled", "Port scan enabled", "Scan for active, exposed ports beyond standard web ports."],
                ["technologyFingerprinting", "Technology fingerprinting", "Detect versions of frameworks and server technologies."],
              ].map(([key, title, desc]) => (
                <button type="button" key={key} onClick={() => togglePref(key)}>
                  <span>{title}<small>{desc}</small></span>
                  <i className={prefs[key] ? "active" : ""}>{prefs[key] ? "On" : "Off"}</i>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="settings-panel scan-pref-summary-panel">
        <div className="settings-panel-title">
          <h3>Recommended Policy</h3>
          <p>SecureScan will use these preferences to keep scans useful while reducing noisy or risky requests.</p>
        </div>
        <div className="scan-pref-policy-grid">
          <article><ShieldCheck size={18} /><strong>OWASP baseline</strong><span>Injection, XSS, auth, headers, SSL, and exposure checks.</span></article>
          <article><Clock3 size={18} /><strong>Quiet window</strong><span>Scheduled scans run during low traffic periods to reduce production impact.</span></article>
          <article><Wrench size={18} /><strong>Fingerprinting</strong><span>{prefs.technologyFingerprinting ? "Enabled" : "Disabled"} for technologies and CVE cross-referencing.</span></article>
        </div>
      </section>
    </div>
  );
}

function SecuritySettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSecret, setMfaSecret] = useState("");
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);

  const loadData = async () => {
    try {
      const [sessionsData, eventsData, profileData] = await Promise.all([
        securityApi.getSessions(),
        activityLogApi.getLogs({ limit: 5, type: 'Security' }),
        userApi.getProfile()
      ]);
      setSessions(sessionsData || []);
      setEvents(eventsData.logs || []);
      if (profileData && profileData.security) {
        setMfaEnabled(profileData.security.mfaEnabled);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 4000);
  };

  const updatePassword = (field, value) => {
    setPassword((current) => ({ ...current, [field]: value }));
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setError("");

    if (!password.current || !password.next || !password.confirm) {
      setError("Please fill in all password fields.");
      return;
    }

    if (password.next !== password.confirm) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      await securityApi.changePassword({ oldPassword: password.current, newPassword: password.next });
      setPassword({ current: "", next: "", confirm: "" });
      triggerToast("Password updated successfully.");
      
      const eventsData = await activityLogApi.getLogs({ limit: 5, type: 'Security' });
      setEvents(eventsData.logs || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleMFA = async () => {
    try {
      setError("");
      if (mfaEnabled) {
        await securityApi.disable2FA();
        setMfaEnabled(false);
        setMfaSecret("");
        triggerToast("Two-factor authentication disabled.");
      } else {
        const res = await securityApi.enable2FA();
        setMfaEnabled(true);
        if (res.mfaSecret) {
          setMfaSecret(res.mfaSecret);
        }
        triggerToast("Two-factor authentication enabled successfully.");
      }
      const eventsData = await activityLogApi.getLogs({ limit: 5, type: 'Security' });
      setEvents(eventsData.logs || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRevoke = async (id) => {
    try {
      await securityApi.revokeSession(id);
      triggerToast(id === "all" ? "All other device sessions terminated." : "Session terminated successfully.");
      const [sessionsData, eventsData] = await Promise.all([
        securityApi.getSessions(),
        activityLogApi.getLogs({ limit: 5, type: 'Security' })
      ]);
      setSessions(sessionsData || []);
      setEvents(eventsData.logs || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const formatSessionTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return <div style={{ padding: "40px", textRendering: "optimizeLegibility", textAlign: "center", color: "#94a3b8" }}>Loading security preferences...</div>;
  }

  return (
    <div className="security-settings-layout">
      {error && <div className="settings-error-banner" style={{ background: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid #ef4444", padding: "12px", borderRadius: "6px", color: "#fca5a5", marginBottom: "20px" }}>{error}</div>}
      {message && <div className="settings-message">{message}</div>}

      <div className="security-stats-grid">
        {[
          ["2FA Protection", mfaEnabled ? "ACTIVE" : "DISABLED", "Account verification", Smartphone, mfaEnabled ? "green" : "orange"],
          ["Active Devices", sessions.length, "Connected sessions", Monitor, "blue"],
          ["Audit Actions", events.length, "Security logs recorded", ShieldAlert, "purple"],
          ["Timeout Policy", "60 mins", "Default active window", Clock3, "orange"],
        ].map(([label, value, detail, Icon, tone]) => (
          <article className="api-overview-card" key={label}>
            <span className={`api-card-icon ${tone}`}>
              <Icon size={27} />
            </span>
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
              <em>{detail}</em>
            </span>
          </article>
        ))}
      </div>

      <div className="security-content-grid">
        <section className="settings-panel security-password-panel">
          <div className="settings-panel-title">
            <h3>Password & Authentication</h3>
            <p>Manage account credentials and authentication policy for SecureScan access.</p>
          </div>
          <form className="security-password-form" onSubmit={savePassword}>
            <label>
              <span>Current Password</span>
              <input type="password" value={password.current} onChange={(event) => updatePassword("current", event.target.value)} />
            </label>
            <label>
              <span>New Password</span>
              <input type="password" value={password.next} onChange={(event) => updatePassword("next", event.target.value)} />
            </label>
            <label>
              <span>Confirm Password</span>
              <input type="password" value={password.confirm} onChange={(event) => updatePassword("confirm", event.target.value)} />
            </label>
            <div className="security-password-actions">
              <button type="button" onClick={() => setPassword({ current: "", next: "", confirm: "" })}>Clear</button>
              <button type="submit">Update Password</button>
            </div>
          </form>

          <div className="security-policy-grid">
            <button type="button" onClick={toggleMFA}>
              <span>Multi-factor authentication (2FA)<small>Require an authenticator app code for every sign-in attempt.</small></span>
              <i className={mfaEnabled ? "active" : ""}>{mfaEnabled ? "On" : "Off"}</i>
            </button>
          </div>

          {mfaEnabled && mfaSecret && (
            <div style={{ background: "rgba(59, 130, 246, 0.1)", borderLeft: "4px solid #3b82f6", padding: "12px", borderRadius: "6px", color: "#93c5fd", marginTop: "20px" }}>
              <strong>MFA Setup Secret:</strong> <code style={{ letterSpacing: "1px", color: "#fff" }}>{mfaSecret}</code>
              <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Add this secret key to Google Authenticator or Authy to generate login tokens.</p>
            </div>
          )}
        </section>

        <aside className="security-side-column">
          <section className="settings-panel security-session-policy-panel">
            <h3>Session Management</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 15px 0" }}>Revoke all other active logins on windows, browsers, or mobile devices instantly.</p>
            <button type="button" onClick={() => handleRevoke("all")} style={{ background: "#ef4444", color: "#fff", padding: "10px", borderRadius: "6px", width: "100%", fontWeight: "bold", border: "none", cursor: "pointer" }}>
              Logout Other Devices
            </button>
          </section>
        </aside>
      </div>

      <div className="security-bottom-grid">
        <section className="settings-panel security-sessions-panel">
          <div className="settings-panel-title">
            <h3>Active Sessions</h3>
            <p>Review signed-in devices and revoke access when needed.</p>
          </div>
          <div className="security-session-list">
            {sessions.map((item) => (
              <article className="security-session-row" key={item.id}>
                <Monitor size={18} />
                <strong>{item.device}<small>{item.location} ({item.ipAddress})</small></strong>
                <span>{item.isCurrent ? "Current session" : formatSessionTime(item.lastActivity)}</span>
                <b className={item.isCurrent ? "active" : "expired"}>{item.isCurrent ? "Active" : "Expired"}</b>
                <button type="button" onClick={() => handleRevoke(item.id)} disabled={item.isCurrent}>
                  Revoke
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="settings-panel security-events-panel">
          <div className="settings-panel-title">
            <h3>Security Events</h3>
            <p>Recent authentication and access control activity.</p>
          </div>
          <div className="security-event-list">
            {events.length === 0 ? (
              <div style={{ padding: "30px", textRendering: "optimizeLegibility", textAlign: "center", color: "#64748b" }}>No recent security events.</div>
            ) : (
              events.map((event) => (
                <article className="security-event-row" key={event.id}>
                  <Lock size={17} />
                  <strong>{event.title}<small>{event.actor}</small></strong>
                  <span>{formatSessionTime(event.time)}</span>
                  <b className={event.status === "Success" ? "resolved" : "critical"}>{event.status}</b>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function IntegrationsSettings() {
  const [message, setMessage] = useState("");
  const [connections, setConnections] = useState({
    slack: true,
    github: true,
    jira: false,
    webhook: true,
  });
  const [syncRules, setSyncRules] = useState({
    criticalOnly: true,
    autoCreateTickets: true,
    attachReports: true,
    closeOnRetest: false,
  });
  const [webhooks, setWebhooks] = useState([
    "https://hooks.example.com/securescan",
    "https://alerts.example.com/monitoring",
  ]);
  const [webhookUrl, setWebhookUrl] = useState("");

  const connectedCount = Object.values(connections).filter(Boolean).length;

  function toggleConnection(key, name) {
    setConnections((current) => ({ ...current, [key]: !current[key] }));
    setMessage(`${name} ${connections[key] ? "disconnected" : "connected"}.`);
  }

  function toggleRule(key) {
    setSyncRules((current) => ({ ...current, [key]: !current[key] }));
  }

  function addWebhook(event) {
    event.preventDefault();
    const value = webhookUrl.trim();

    if (!value) {
      setMessage("Webhook URL required.");
      return;
    }

    if (!value.startsWith("https://")) {
      setMessage("Webhook URL must start with https://");
      return;
    }

    if (webhooks.includes(value)) {
      setMessage("Webhook already exists.");
      return;
    }

    setWebhooks((current) => [...current, value]);
    setWebhookUrl("");
    setMessage("Webhook endpoint added.");
  }

  return (
    <div className="integrations-settings-layout">
      {message && <div className="settings-message">{message}</div>}

      <div className="integrations-stats-grid">
        {[
          ["Connected Apps", connectedCount, "Active integrations", Webhook, "green"],
          ["Events Synced", "2,418", "This month", Activity, "blue"],
          ["Ticket Rules", Object.values(syncRules).filter(Boolean).length, "Enabled automations", Wrench, "purple"],
          ["Webhooks", webhooks.length, "Custom endpoints", Code2, "orange"],
        ].map(([label, value, detail, Icon, tone]) => (
          <article className="api-overview-card" key={label}>
            <span className={`api-card-icon ${tone}`}>
              <Icon size={27} />
            </span>
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
              <em>{detail}</em>
            </span>
          </article>
        ))}
      </div>

      <div className="integrations-content-grid">
        <section className="settings-panel integrations-catalog-panel">
          <div className="settings-panel-title">
            <h3>Connected Integrations</h3>
            <p>Connect SecureScan with chat, issue tracking, repositories, and custom automation endpoints.</p>
          </div>
          <div className="integration-card-grid">
            {integrationCatalog.map((item) => {
              const Icon = item.icon;
              const connected = connections[item.key];

              return (
                <article className={connected ? "integration-card connected" : "integration-card"} key={item.key}>
                  <span><Icon size={22} /></span>
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.desc}</p>
                    <small>{connected ? item.target : item.status}</small>
                  </div>
                  <button type="button" onClick={() => toggleConnection(item.key, item.name)}>
                    {connected ? "Disconnect" : "Connect"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="integrations-side-column">
          <section className="settings-panel integration-rules-panel">
            <h3>Automation Rules</h3>
            <div className="integration-rule-list">
              {[
                ["criticalOnly", "Critical alerts only", "Send high priority findings to external tools."],
                ["autoCreateTickets", "Auto-create tickets", "Open tasks for new vulnerabilities."],
                ["attachReports", "Attach reports", "Include generated report links in sync payloads."],
                ["closeOnRetest", "Close after retest", "Resolve synced tickets after clean retest."],
              ].map(([key, title, desc]) => (
                <button type="button" key={key} onClick={() => toggleRule(key)}>
                  <span>{title}<small>{desc}</small></span>
                  <i className={syncRules[key] ? "active" : ""}>{syncRules[key] ? "On" : "Off"}</i>
                </button>
              ))}
            </div>
          </section>

          <section className="settings-panel integration-test-panel">
            <h3>Test Delivery</h3>
            <p>Send a sample scan.completed event to connected services.</p>
            <button type="button" onClick={() => setMessage("Test event sent to connected integrations.")}>
              Send Test Event
            </button>
          </section>
        </aside>
      </div>

      <div className="integrations-bottom-grid">
        <section className="settings-panel integration-webhook-panel">
          <div className="settings-panel-title">
            <h3>Webhook Endpoints</h3>
            <p>Custom endpoints receive JSON events for scans, vulnerabilities, reports, and monitors.</p>
          </div>
          <form onSubmit={addWebhook}>
            <input placeholder="https://hooks.example.com/securescan" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
            <button type="submit">Add Webhook</button>
          </form>
          <div className="integration-webhook-list">
            {webhooks.map((url) => (
              <article key={url}>
                <Code2 size={17} />
                <strong>{url}</strong>
                <b>Active</b>
                <button type="button" onClick={() => setWebhooks((current) => current.filter((item) => item !== url))}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="settings-panel integration-activity-panel">
          <div className="settings-panel-title">
            <h3>Integration Activity</h3>
            <p>Recent sync actions from connected apps.</p>
          </div>
          <div className="integration-activity-list">
            {integrationActivity.map(([title, detail, time, status]) => (
              <article className="integration-activity-row" key={`${title}-${time}`}>
                <Webhook size={17} />
                <strong>{title}<small>{detail}</small></strong>
                <span>{time}</span>
                <b className={status === "Retry" ? "retry" : ""}>{status}</b>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ActivityLogSettings() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(auditEvents[0]);
  const [message, setMessage] = useState("");

  const filteredEvents = auditEvents.filter((event) => {
    const matchesQuery = `${event.title} ${event.actor} ${event.target} ${event.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === "All" || event.type === type;
    const matchesStatus = status === "All" || event.status === status;

    return matchesQuery && matchesType && matchesStatus;
  });

  const criticalCount = auditEvents.filter((event) => event.severity === "Critical").length;
  const retryCount = auditEvents.filter((event) => event.status === "Retry").length;

  function exportActivity() {
    const rows = filteredEvents.map((event) => `${event.id},${event.type},${event.title},${event.actor},${event.target},${event.time},${event.status}`);
    const blob = new Blob([["ID,Type,Title,Actor,Target,Time,Status", ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "securescan-activity-log.csv";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Activity log exported.");
  }

  return (
    <div className="activity-log-layout">
      {message && <div className="settings-message">{message}</div>}

      <div className="activity-log-stats-grid">
        {[
          ["Audit Events", auditEvents.length, "Recent workspace actions", Activity, "green"],
          ["Critical Items", criticalCount, "Need review", ShieldCheck, "orange"],
          ["Retries", retryCount, "Integration sync", Webhook, "purple"],
          ["Last Export", "Today", "CSV available", Download, "blue"],
        ].map(([label, value, detail, Icon, tone]) => (
          <article className="api-overview-card" key={label}>
            <span className={`api-card-icon ${tone}`}>
              <Icon size={27} />
            </span>
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
              <em>{detail}</em>
            </span>
          </article>
        ))}
      </div>

      <div className="activity-log-content-grid">
        <section className="settings-panel activity-log-list-panel">
          <div className="settings-panel-title activity-log-title-row">
            <div>
              <h3>Workspace Activity</h3>
              <p>Track scans, security events, team changes, report generation, and integration syncs.</p>
            </div>
            <button type="button" onClick={exportActivity}>
              <Download size={15} /> Export CSV
            </button>
          </div>

          <div className="activity-log-filters">
            <input placeholder="Search activity..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option>All</option>
              <option>Scan</option>
              <option>Security</option>
              <option>Vulnerability</option>
              <option>Report</option>
              <option>Integration</option>
              <option>Team</option>
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>All</option>
              <option>Success</option>
              <option>Review</option>
              <option>Retry</option>
            </select>
          </div>

          <div className="activity-event-list">
            {filteredEvents.map((event) => (
              <button
                className={selectedEvent.id === event.id ? "activity-event-row active" : "activity-event-row"}
                type="button"
                key={event.id}
                onClick={() => setSelectedEvent(event)}
              >
                <span className={`activity-type-badge ${event.type.toLowerCase()}`}>{event.type}</span>
                <strong>{event.title}<small>{event.actor} on {event.target}</small></strong>
                <em>{event.time}</em>
                <b className={event.status.toLowerCase()}>{event.status}</b>
              </button>
            ))}
          </div>
        </section>

        <aside className="activity-log-side-column">
          <section className="settings-panel activity-detail-panel">
            <h3>Event Details</h3>
            <div className="activity-detail-card">
              <span className={`activity-type-badge ${selectedEvent.type.toLowerCase()}`}>{selectedEvent.type}</span>
              <h4>{selectedEvent.title}</h4>
              <p>{selectedEvent.actor} performed this action on {selectedEvent.target}.</p>
              <dl>
                <div><dt>Event ID</dt><dd>{selectedEvent.id}</dd></div>
                <div><dt>Time</dt><dd>{selectedEvent.time}</dd></div>
                <div><dt>Status</dt><dd>{selectedEvent.status}</dd></div>
                <div><dt>Severity</dt><dd>{selectedEvent.severity}</dd></div>
              </dl>
              <button type="button" onClick={() => setMessage(`${selectedEvent.id} copied to review queue.`)}>
                Add to Review
              </button>
            </div>
          </section>

          <section className="settings-panel activity-retention-panel">
            <h3>Audit Retention</h3>
            <p>Enterprise workspaces keep searchable activity for 180 days, including security, billing, and integration records.</p>
            <div>
              <span>Retention</span><strong>180 days</strong>
              <span>Export format</span><strong>CSV</strong>
              <span>Timezone</span><strong>Asia/Kolkata</strong>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ApiAccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [keys, setKeys] = useState([]);
  const [stats, setStats] = useState({
    totalKeys: 0,
    totalRequests: 0,
    successRate: "99.8%",
    avgResponseTime: "245ms",
  });
  
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyDesc, setKeyDesc] = useState("");
  const [generatedKey, setGeneratedKey] = useState(null);

  const loadData = async () => {
    try {
      const res = await apiAccessApi.getApiAccess();
      setKeys(res.keys || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    if (!keyName) {
      setError("Please provide a name for the API key.");
      return;
    }
    try {
      const res = await apiAccessApi.generateApiKey({ name: keyName, desc: keyDesc });
      setGeneratedKey(res.key);
      setKeyName("");
      setKeyDesc("");
      setShowGenerateModal(false);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRegenerate = async (id) => {
    setError("");
    if (!window.confirm("Are you sure you want to regenerate this key? Any tools using the old key will break immediately.")) {
      return;
    }
    try {
      const res = await apiAccessApi.regenerateApiKey(id);
      setGeneratedKey(res.key);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRevoke = async (id) => {
    setError("");
    if (!window.confirm("Are you sure you want to revoke this key?")) {
      return;
    }
    try {
      await apiAccessApi.revokeApiKey(id);
      triggerToast("API key revoked successfully.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const formatKeyDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return <div style={{ padding: "40px", textRendering: "optimizeLegibility", textAlign: "center", color: "#94a3b8" }}>Loading API configurations...</div>;
  }

  const overviewStats = [
    { label: "Total API Keys", value: stats.totalKeys, detail: "Active keys", icon: Wrench, tone: "green" },
    { label: "Total Requests", value: stats.totalRequests.toLocaleString(), detail: "This month", icon: CreditCard, tone: "blue" },
    { label: "Success Rate", value: stats.successRate, detail: "This month", icon: Activity, tone: "purple" },
    { label: "Avg. Response Time", value: stats.avgResponseTime, detail: "This month", icon: Clock3, tone: "orange" },
  ];

  return (
    <div className="api-access-layout">
      {error && <div className="settings-error-banner" style={{ background: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid #ef4444", padding: "12px", borderRadius: "6px", color: "#fca5a5", marginBottom: "20px" }}>{error}</div>}
      {message && <div className="settings-message">{message}</div>}

      {generatedKey && (
        <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid #10b981", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
          <h3 style={{ color: "#34d399", marginTop: 0 }}>API Key Generated Successfully!</h3>
          <p style={{ color: "#a7f3d0", fontSize: "14px", margin: "5px 0 15px 0" }}>
            Make sure to copy your API key now. You will not be able to see this key again!
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "15px 0" }}>
            <code style={{ background: "#1e293b", padding: "10px 15px", borderRadius: "6px", color: "#fff", flex: 1, fontSize: "14px", overflowX: "auto", border: "1px solid #334155" }}>
              {generatedKey.key}
            </code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedKey.key);
                triggerToast("API Key copied to clipboard.");
              }} 
              style={{ background: "#10b981", color: "#fff", padding: "10px 15px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}
            >
              Copy Key
            </button>
          </div>
          <button 
            onClick={() => setGeneratedKey(null)} 
            style={{ background: "transparent", color: "#94a3b8", border: "1px solid #475569", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" }}
          >
            I have saved the key securely
          </button>
        </div>
      )}

      {showGenerateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form onSubmit={handleGenerate} style={{ background: "#0f172a", border: "1px solid #334155", padding: "25px", borderRadius: "10px", width: "400px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ color: "#fff", margin: 0 }}>Create API Key</h3>
            <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: "#94a3b8" }}>
              <span>Key Name</span>
              <input type="text" placeholder="e.g. Production Scanner" value={keyName} onChange={(e) => setKeyName(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #334155", background: "#1e293b", color: "#fff" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: "#94a3b8" }}>
              <span>Description</span>
              <input type="text" placeholder="e.g. CI/CD integration key" value={keyDesc} onChange={(e) => setKeyDesc(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #334155", background: "#1e293b", color: "#fff" }} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button type="button" onClick={() => setShowGenerateModal(false)} style={{ background: "transparent", color: "#94a3b8", border: "1px solid #334155", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
              <button type="submit" style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Generate</button>
            </div>
          </form>
        </div>
      )}

      <div className="api-main-column">
        <section className="settings-panel api-overview">
          <div className="settings-panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>API Overview</h3>
              <p>Integrate SecureScan into your workflows, CI/CD pipelines, and custom tools using our RESTful API.</p>
            </div>
            <button type="button" onClick={() => setShowGenerateModal(true)} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              Create API Key
            </button>
          </div>
          <div className="api-overview-grid">
            {overviewStats.map((item) => (
              <InfoCard item={item} key={item.label} />
            ))}
          </div>
        </section>

        <section className="settings-panel api-keys-panel">
          <h3>Your API Keys</h3>
          <div className="api-table-wrap">
            <table className="api-keys-table">
              <thead>
                <tr>
                  <th>Key Name</th>
                  <th>Key</th>
                  <th>Created At</th>
                  <th>Last Used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "30px", textRendering: "optimizeLegibility", textAlign: "center", color: "#64748b" }}>No active API keys found. Click "Create API Key" to generate one.</td>
                  </tr>
                ) : (
                  keys.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="api-key-name">
                          <strong>{item.name}</strong>
                          <small>{item.desc || "No description provided"}</small>
                        </div>
                      </td>
                      <td>
                        <div className="api-key-value">
                          <span className="masked-key">{item.key}</span>
                        </div>
                      </td>
                      <td>
                        <div className="api-date-cell">
                          <span>{formatKeyDate(item.createdAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="api-date-cell">
                          <span>{item.lastUsedAt ? formatKeyDate(item.lastUsedAt) : "Never used"}</span>
                        </div>
                      </td>
                      <td>
                        <b className={`api-status ${item.status === 'active' ? 'active' : 'revoked'}`} style={{ color: item.status === 'active' ? '#10b981' : '#ef4444' }}>
                          {item.status.toUpperCase()}
                        </b>
                      </td>
                      <td>
                        {item.status === 'active' && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button type="button" onClick={() => handleRegenerate(item.id)} style={{ background: "transparent", border: "1px solid #475569", color: "#94a3b8", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>
                              Regenerate
                            </button>
                            <button type="button" onClick={() => handleRevoke(item.id)} style={{ background: "transparent", border: "1px solid #ef4444", color: "#fca5a5", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>
                              Revoke
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="api-note">
            <Info size={16} /> API keys are required to authenticate your requests. Keep your keys secure and never share them publicly.
          </p>
        </section>

        <section className="settings-panel api-endpoints-panel">
          <div className="api-section-row">
            <div>
              <h3>API Endpoints</h3>
              <p>Core endpoints available in the SecureScan API.</p>
            </div>
            <a href="#docs">
              View Full Documentation <ExternalLink size={15} />
            </a>
          </div>

          <div className="endpoint-list">
            {endpoints.map(([method, path, desc, tone]) => (
              <div className="endpoint-row" key={`${method}-${path}`}>
                <span className={`endpoint-method ${tone}`}>{method}</span>
                <code>{path}</code>
                <p>{desc}</p>
                <span className="endpoint-auth">
                  <Lock size={14} /> Auth Required
                </span>
                <ChevronDown size={16} />
              </div>
            ))}
          </div>

          <button className="api-wide-button" type="button">
            View All Endpoints <ArrowRight size={16} />
          </button>
        </section>
      </div>

      <aside className="api-side-column">
        <section className="settings-panel usage-panel">
          <div className="usage-head">
            <h3>API Usage <span>(This Month)</span></h3>
            <button type="button">
              June 2026 <ChevronDown size={14} />
            </button>
          </div>
          <div className="usage-content">
            <div className="usage-ring">
              <strong>{stats.totalRequests.toLocaleString()}</strong>
              <span>Total Requests</span>
            </div>
            <div className="usage-legend">
              <p><i className="success" /> Successful <span>{(stats.totalRequests * 0.998).toLocaleString(undefined, { maximumFractionDigits: 0 })} (99.8%)</span></p>
              <p><i className="failed" /> Failed <span>{(stats.totalRequests * 0.002).toLocaleString(undefined, { maximumFractionDigits: 0 })} (0.2%)</span></p>
              <p><i className="limited" /> Rate Limited <span>0 (0.00%)</span></p>
            </div>
          </div>
          <button className="api-wide-button usage-button" type="button">
            <BarChart3 size={15} /> View Usage Analytics
          </button>
        </section>

        <section className="settings-panel quick-panel">
          <h3>Quick Start</h3>
          <p>Get started with SecureScan API in minutes.</p>
          <div className="quick-links">
            {quickLinks.map(([title, desc, Icon]) => (
              <a href="#quick" key={title}>
                <span><Icon size={19} /></span>
                <strong>{title}<small>{desc}</small></strong>
                <ExternalLink size={16} />
              </a>
            ))}
          </div>
          <button className="api-wide-button" type="button">
            View All Resources <ArrowRight size={16} />
          </button>
        </section>

        <section className="settings-panel limits-panel">
          <h3>Rate Limits</h3>
          <p>Your current rate limit usage</p>
          <div className="limit-row">
            <span>Requests per minute</span><b>0 / 120</b>
            <i><em style={{ width: "0%" }} /></i>
          </div>
          <div className="limit-row purple">
            <span>Requests per hour</span><b>{stats.totalRequests > 5000 ? 5000 : stats.totalRequests} / 5,000</b>
            <i><em style={{ width: `${Math.min(100, (stats.totalRequests / 5000) * 100)}%` }} /></i>
          </div>
          <p className="api-note">
            <Info size={16} /> Rate limits are applied per API key.
          </p>
        </section>
      </aside>
    </div>
  );
}

export default function SettingsPage() {
  const { section } = useParams();
  const activeSection = section || "profile";

  if (!section) {
    return <Navigate to="/dashboard/settings/profile" replace />;
  }

  return (
    <section className="settings-page">
      {activeSection === "api-access" ? (
        <ApiAccessPage />
      ) : activeSection === "profile" ? (
        <ProfileSettings />
      ) : activeSection === "team" ? (
        <TeamSettings />
      ) : activeSection === "plan-billing" ? (
        <PlanBillingSettings />
      ) : activeSection === "notifications" ? (
        <NotificationSettings />
      ) : activeSection === "scan-preferences" ? (
        <ScanPreferencesSettings />
      ) : activeSection === "security" ? (
        <SecuritySettings />
      ) : activeSection === "integrations" ? (
        <IntegrationsSettings />
      ) : activeSection === "activity-log" ? (
        <ActivityLogSettings />
      ) : (
        <SimpleSettingsSection section={activeSection} />
      )}
    </section>
  );
}
