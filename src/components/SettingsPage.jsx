import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
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
  UserPlus,
  UserRound,
  UsersRound,
  Webhook,
  Wrench,
} from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { useState } from "react";
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

const profileDefaults = {
  name: "Rahul Sharma",
  email: "rahul@example.com",
  role: "Security Administrator",
  company: "SecureScan Enterprise",
  phone: "+91 98765 43210",
  timezone: "Asia/Kolkata",
  bio: "Manages application security scans, remediation workflows, and monitoring alerts.",
};

const initialTeamMembers = [
  { name: "Rahul Sharma", email: "rahul@example.com", role: "Owner", status: "Active", access: "Full access", lastActive: "Today, 11:20 AM", avatar: "RS" },
  { name: "Ananya Verma", email: "ananya@example.com", role: "Admin", status: "Active", access: "Manage scans and reports", lastActive: "Today, 10:05 AM", avatar: "AV" },
  { name: "Karan Mehta", email: "karan@example.com", role: "Analyst", status: "Active", access: "View findings and remediation", lastActive: "Yesterday, 06:40 PM", avatar: "KM" },
  { name: "Neha Singh", email: "neha@example.com", role: "Viewer", status: "Pending", access: "Read-only access", lastActive: "Invitation sent", avatar: "NS" },
];

const billingPlans = [
  {
    name: "Starter",
    monthly: 49,
    yearly: 470,
    desc: "Small teams validating core domains.",
    limits: ["10 domains", "100 scans/month", "Basic reports", "Email support"],
  },
  {
    name: "Growth",
    monthly: 149,
    yearly: 1430,
    desc: "Security teams running regular scans.",
    limits: ["50 domains", "1,000 scans/month", "Remediation workflow", "Slack alerts"],
  },
  {
    name: "Enterprise",
    monthly: 399,
    yearly: 3830,
    desc: "Advanced monitoring, compliance, and team governance.",
    limits: ["Unlimited domains", "10,000 scans/month", "Priority support", "Custom reports"],
  },
];

const billingUsage = [
  { label: "Domains", used: 42, limit: 50, tone: "green" },
  { label: "Scans", used: 728, limit: 1000, tone: "blue" },
  { label: "Reports", used: 18, limit: 50, tone: "purple" },
  { label: "API Requests", used: 128645, limit: 250000, tone: "orange" },
];

const invoiceHistory = [
  { id: "INV-2024-0521", date: "21 May 2024", amount: "$399.00", status: "Paid" },
  { id: "INV-2024-0421", date: "21 Apr 2024", amount: "$399.00", status: "Paid" },
  { id: "INV-2024-0321", date: "21 Mar 2024", amount: "$399.00", status: "Paid" },
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

function ProfileSettings() {
  const [profile, setProfile] = useState(profileDefaults);
  const [preferences, setPreferences] = useState({
    scanAlerts: true,
    vulnerabilityDigest: true,
    reportReady: true,
    monitoringIncidents: true,
  });
  const [message, setMessage] = useState("");

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function togglePreference(field) {
    setPreferences((current) => ({ ...current, [field]: !current[field] }));
  }

  function saveProfile(event) {
    event.preventDefault();
    setMessage("Profile settings saved.");
  }

  return (
    <div className="profile-settings-layout">
      {message && <div className="settings-message">{message}</div>}

      <section className="settings-panel profile-hero-panel">
        <div className="profile-avatar-wrap">
          <img src="https://i.pravatar.cc/120" alt="Rahul Sharma" />
          <button type="button" onClick={() => setMessage("Avatar upload ready.")}>
            Change Avatar
          </button>
        </div>
        <div className="profile-hero-copy">
          <span className="profile-status">Enterprise Admin</span>
          <h3>{profile.name}</h3>
          <p>{profile.bio}</p>
          <div className="profile-meta-row">
            <span><ShieldCheck size={15} /> MFA Enabled</span>
            <span><Activity size={15} /> Last active today</span>
            <span><Clock3 size={15} /> {profile.timezone}</span>
          </div>
        </div>
      </section>

      <div className="profile-content-grid">
        <section className="settings-panel profile-form-panel">
          <div className="settings-panel-title">
            <h3>Profile Details</h3>
            <p>Keep your account information aligned with security ownership and alert routing.</p>
          </div>

          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              <span>Full Name</span>
              <input value={profile.name} onChange={(event) => updateProfile("name", event.target.value)} />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={profile.email} onChange={(event) => updateProfile("email", event.target.value)} />
            </label>
            <label>
              <span>Role</span>
              <select value={profile.role} onChange={(event) => updateProfile("role", event.target.value)}>
                <option>Security Administrator</option>
                <option>Security Analyst</option>
                <option>DevOps Lead</option>
                <option>Compliance Manager</option>
              </select>
            </label>
            <label>
              <span>Company</span>
              <input value={profile.company} onChange={(event) => updateProfile("company", event.target.value)} />
            </label>
            <label>
              <span>Phone</span>
              <input value={profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} />
            </label>
            <label>
              <span>Timezone</span>
              <select value={profile.timezone} onChange={(event) => updateProfile("timezone", event.target.value)}>
                <option>Asia/Kolkata</option>
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </label>
            <label className="profile-wide-field">
              <span>Bio</span>
              <textarea value={profile.bio} onChange={(event) => updateProfile("bio", event.target.value)} />
            </label>
            <div className="profile-actions">
              <button type="button" onClick={() => setProfile(profileDefaults)}>Reset</button>
              <button type="submit">Save Changes</button>
            </div>
          </form>
        </section>

        <aside className="profile-side-column">
          <section className="settings-panel profile-card-panel">
            <h3>Account Security</h3>
            <div className="profile-security-list">
              <p><Lock size={16} /> Password updated <strong>12 days ago</strong></p>
              <p><Smartphone size={16} /> Two-factor auth <strong>Enabled</strong></p>
              <p><ShieldCheck size={16} /> Session policy <strong>Strict</strong></p>
            </div>
            <button className="profile-wide-button" type="button" onClick={() => setMessage("Security settings selected.")}>
              Manage Security <ArrowRight size={15} />
            </button>
          </section>

          <section className="settings-panel profile-card-panel">
            <h3>Alert Preferences</h3>
            <div className="profile-toggle-list">
              {[
                ["scanAlerts", "Scan alerts"],
                ["vulnerabilityDigest", "Vulnerability digest"],
                ["reportReady", "Report ready"],
                ["monitoringIncidents", "Monitoring incidents"],
              ].map(([key, label]) => (
                <button type="button" key={key} onClick={() => togglePreference(key)}>
                  <span>{label}</span>
                  <i className={preferences[key] ? "active" : ""}>{preferences[key] ? "On" : "Off"}</i>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TeamSettings() {
  const [members, setMembers] = useState(initialTeamMembers);
  const [invite, setInvite] = useState({ email: "", role: "Analyst" });
  const [message, setMessage] = useState("");

  const activeCount = members.filter((member) => member.status === "Active").length;
  const pendingCount = members.filter((member) => member.status === "Pending").length;

  function inviteMember(event) {
    event.preventDefault();
    const email = invite.email.trim().toLowerCase();

    if (!email) {
      setMessage("Email required to send invitation.");
      return;
    }

    if (members.some((member) => member.email === email)) {
      setMessage(`${email} is already in the team list.`);
      return;
    }

    const name = email.split("@")[0].replace(/[._-]/g, " ");
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    setMembers((current) => [
      ...current,
      {
        name: name.replace(/\b\w/g, (letter) => letter.toUpperCase()),
        email,
        role: invite.role,
        status: "Pending",
        access: invite.role === "Viewer" ? "Read-only access" : "Standard workspace access",
        lastActive: "Invitation sent",
        avatar: initials || "TM",
      },
    ]);
    setInvite({ email: "", role: "Analyst" });
    setMessage(`Invitation sent to ${email}.`);
  }

  function updateRole(email, role) {
    setMembers((current) =>
      current.map((member) =>
        member.email === email
          ? {
              ...member,
              role,
              access: role === "Owner" ? "Full access" : role === "Viewer" ? "Read-only access" : "Manage scans and reports",
            }
          : member
      )
    );
    setMessage(`Role updated to ${role}.`);
  }

  function removeMember(email) {
    setMembers((current) => current.filter((member) => member.email !== email));
    setMessage(`${email} removed from team.`);
  }

  return (
    <div className="team-settings-layout">
      {message && <div className="settings-message">{message}</div>}

      <div className="team-stats-grid">
        {[
          ["Members", members.length, "Total seats used", UsersRound, "green"],
          ["Active", activeCount, "Currently active", ShieldCheck, "blue"],
          ["Pending", pendingCount, "Invitations sent", Clock3, "orange"],
          ["Admins", members.filter((member) => ["Owner", "Admin"].includes(member.role)).length, "Privileged users", Crown, "purple"],
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

          <div className="team-member-list">
            {members.map((member) => (
              <article className="team-member-row" key={member.email}>
                <span className="team-avatar">{member.avatar}</span>
                <div className="team-member-copy">
                  <strong>{member.name}</strong>
                  <small>{member.email}</small>
                </div>
                <select value={member.role} onChange={(event) => updateRole(member.email, event.target.value)}>
                  <option>Owner</option>
                  <option>Admin</option>
                  <option>Analyst</option>
                  <option>Viewer</option>
                </select>
                <span className={member.status === "Pending" ? "team-status pending" : "team-status active"}>{member.status}</span>
                <div className="team-access">
                  <strong>{member.access}</strong>
                  <small>{member.lastActive}</small>
                </div>
                <button type="button" onClick={() => removeMember(member.email)} disabled={member.role === "Owner"}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        </section>

        <aside className="team-side-column">
          <section className="settings-panel team-invite-panel">
            <h3>Invite Member</h3>
            <p>Add teammates and assign security access before they join.</p>
            <form onSubmit={inviteMember}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  placeholder="member@example.com"
                  value={invite.email}
                  onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                <span>Role</span>
                <select value={invite.role} onChange={(event) => setInvite((current) => ({ ...current, role: event.target.value }))}>
                  <option>Admin</option>
                  <option>Analyst</option>
                  <option>Viewer</option>
                </select>
              </label>
              <button type="submit">
                <UserPlus size={16} /> Send Invite
              </button>
            </form>
          </section>

          <section className="settings-panel team-permissions-panel">
            <h3>Role Permissions</h3>
            <div>
              <article>
                <Crown size={16} />
                <strong>Owner</strong>
                <span>Full workspace control, billing, team management, scans, reports, and API access.</span>
              </article>
              <article>
                <ShieldCheck size={16} />
                <strong>Admin</strong>
                <span>Manage domains, scans, vulnerabilities, remediation tasks, and monitoring rules.</span>
              </article>
              <article>
                <Activity size={16} />
                <strong>Analyst</strong>
                <span>Review findings, generate reports, monitor alerts, and update remediation status.</span>
              </article>
              <article>
                <Eye size={16} />
                <strong>Viewer</strong>
                <span>Read-only access to dashboards, reports, findings, and activity history.</span>
              </article>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PlanBillingSettings() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currentPlan, setCurrentPlan] = useState("Enterprise");
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState({
    cardName: "Rahul Sharma",
    last4: "4242",
    contact: "billing@example.com",
  });

  const activePlan = billingPlans.find((plan) => plan.name === currentPlan) || billingPlans[2];

  function selectPlan(planName) {
    setCurrentPlan(planName);
    setMessage(`${planName} plan selected for the workspace.`);
  }

  function updatePayment(field, value) {
    setPayment((current) => ({ ...current, [field]: value }));
  }

  function saveBilling(event) {
    event.preventDefault();
    setMessage("Billing details saved.");
  }

  function downloadInvoice(invoice) {
    const invoiceText = [
      "SecureScan Invoice",
      `Invoice: ${invoice.id}`,
      `Date: ${invoice.date}`,
      `Amount: ${invoice.amount}`,
      `Status: ${invoice.status}`,
      `Plan: ${currentPlan}`,
    ].join("\n");
    const blob = new Blob([invoiceText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${invoice.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage(`${invoice.id} downloaded.`);
  }

  return (
    <div className="billing-settings-layout">
      {message && <div className="settings-message">{message}</div>}

      <section className="settings-panel billing-hero-panel">
        <div>
          <span className="profile-status">Active Subscription</span>
          <h3>{currentPlan} Plan</h3>
          <p>{activePlan.desc}</p>
          <div className="profile-meta-row">
            <span><CreditCard size={15} /> Visa ending {payment.last4}</span>
            <span><Clock3 size={15} /> Renews 21 Jun 2024</span>
            <span><ShieldCheck size={15} /> Compliance reports included</span>
          </div>
        </div>
        <div className="billing-price-card">
          <small>{billingCycle === "monthly" ? "Monthly billing" : "Annual billing"}</small>
          <strong>${activePlan[billingCycle]}</strong>
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
            <p>Track domain, scan, report, and API consumption against your current limits.</p>
          </div>
          <div className="billing-usage-list">
            {billingUsage.map((item) => {
              const percent = Math.min(Math.round((item.used / item.limit) * 100), 100);

              return (
                <div className={`billing-usage-row ${item.tone}`} key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.used.toLocaleString()} / {item.limit.toLocaleString()}</span>
                  </div>
                  <i><em style={{ width: `${percent}%` }} /></i>
                  <small>{percent}% used</small>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="billing-side-column">
          <section className="settings-panel billing-card-panel">
            <h3>Payment Method</h3>
            <form onSubmit={saveBilling}>
              <label>
                <span>Cardholder</span>
                <input value={payment.cardName} onChange={(event) => updatePayment("cardName", event.target.value)} />
              </label>
              <label>
                <span>Card ending</span>
                <input maxLength="4" value={payment.last4} onChange={(event) => updatePayment("last4", event.target.value.replace(/\D/g, ""))} />
              </label>
              <label>
                <span>Billing email</span>
                <input type="email" value={payment.contact} onChange={(event) => updatePayment("contact", event.target.value)} />
              </label>
              <button type="submit">
                <CreditCard size={16} /> Save Billing
              </button>
            </form>
          </section>

          <section className="settings-panel billing-card-panel">
            <h3>Billing Controls</h3>
            <div className="billing-control-list">
              <button type="button" onClick={() => setMessage("Usage alert set at 85%.")}>Set usage alert</button>
              <button type="button" onClick={() => setMessage("Tax details review opened.")}>Tax details</button>
              <button type="button" onClick={() => setMessage("Cancellation flow prepared.")}>Cancel plan</button>
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
          {billingPlans.map((plan) => (
            <article className={plan.name === currentPlan ? "billing-plan-card active" : "billing-plan-card"} key={plan.name}>
              <div className="billing-plan-head">
                <h4>{plan.name}</h4>
                {plan.name === currentPlan && <span>Current</span>}
              </div>
              <strong>${plan[billingCycle]}<small>/{billingCycle === "monthly" ? "mo" : "yr"}</small></strong>
              <p>{plan.desc}</p>
              <ul>
                {plan.limits.map((limit) => (
                  <li key={limit}><Check size={14} /> {limit}</li>
                ))}
              </ul>
              <button type="button" onClick={() => selectPlan(plan.name)}>
                {plan.name === currentPlan ? "Selected" : "Choose Plan"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="settings-panel billing-invoices-panel">
        <div className="settings-panel-title">
          <h3>Invoice History</h3>
          <p>Download paid invoices for finance and compliance records.</p>
        </div>
        <div className="billing-invoice-list">
          {invoiceHistory.map((invoice) => (
            <article className="billing-invoice-row" key={invoice.id}>
              <FileText size={18} />
              <strong>{invoice.id}<small>{invoice.date}</small></strong>
              <span>{invoice.amount}</span>
              <b>{invoice.status}</b>
              <button type="button" onClick={() => downloadInvoice(invoice)}>
                <Download size={15} /> Download
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function NotificationSettings() {
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    slack: true,
    dashboard: true,
  });
  const [events, setEvents] = useState({
    criticalVulnerabilities: true,
    scanCompleted: true,
    monitorDown: true,
    reportReady: true,
    remediationDue: false,
  });
  const [digest, setDigest] = useState({
    frequency: "Daily",
    time: "08:00",
    recipient: "security-team@example.com",
  });

  const enabledEvents = Object.values(events).filter(Boolean).length;
  const enabledChannels = Object.values(channels).filter(Boolean).length;

  function toggleChannel(key) {
    setChannels((current) => ({ ...current, [key]: !current[key] }));
  }

  function toggleEvent(key) {
    setEvents((current) => ({ ...current, [key]: !current[key] }));
  }

  function updateDigest(field, value) {
    setDigest((current) => ({ ...current, [field]: value }));
  }

  function saveDigest(event) {
    event.preventDefault();
    setMessage(`${digest.frequency} digest scheduled at ${digest.time}.`);
  }

  return (
    <div className="notification-settings-layout">
      {message && <div className="settings-message">{message}</div>}

      <div className="notification-stats-grid">
        {[
          ["Enabled Events", enabledEvents, "Active alert rules", Bell, "green"],
          ["Channels", enabledChannels, "Delivery paths", MessageSquare, "blue"],
          ["Digest", digest.frequency, `${digest.time} schedule`, Mail, "purple"],
          ["Escalation SLA", "15 min", "Critical alert window", Clock3, "orange"],
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
            <p>Choose which security events should trigger team alerts across scans, reports, monitoring, and remediation.</p>
          </div>

          <div className="notification-rule-list">
            {notificationEvents.map((item) => (
              <button className="notification-rule-row" type="button" key={item.key} onClick={() => toggleEvent(item.key)}>
                <span className={events[item.key] ? "notification-toggle active" : "notification-toggle"}>{events[item.key] ? "On" : "Off"}</span>
                <strong>{item.title}<small>{item.desc}</small></strong>
                <b>{item.channel}</b>
              </button>
            ))}
          </div>
        </section>

        <aside className="notification-side-column">
          <section className="settings-panel notification-channel-panel">
            <h3>Delivery Channels</h3>
            <div className="notification-channel-list">
              {[
                ["email", "Email", "Primary team inbox", Mail],
                ["slack", "Slack", "#security-alerts", MessageSquare],
                ["dashboard", "Dashboard", "In-app activity feed", Bell],
                ["sms", "SMS", "Critical-only escalation", Smartphone],
              ].map(([key, title, desc, Icon]) => (
                <button type="button" key={key} onClick={() => toggleChannel(key)}>
                  <Icon size={17} />
                  <span>{title}<small>{desc}</small></span>
                  <i className={channels[key] ? "active" : ""}>{channels[key] ? "On" : "Off"}</i>
                </button>
              ))}
            </div>
            <button className="notification-test-button" type="button" onClick={() => setMessage("Test notification sent to enabled channels.")}>
              Send Test Notification
            </button>
          </section>

          <section className="settings-panel notification-digest-panel">
            <h3>Digest Schedule</h3>
            <form onSubmit={saveDigest}>
              <label>
                <span>Frequency</span>
                <select value={digest.frequency} onChange={(event) => updateDigest("frequency", event.target.value)}>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </label>
              <label>
                <span>Send time</span>
                <input type="time" value={digest.time} onChange={(event) => updateDigest("time", event.target.value)} />
              </label>
              <label>
                <span>Recipient</span>
                <input type="email" value={digest.recipient} onChange={(event) => updateDigest("recipient", event.target.value)} />
              </label>
              <button type="submit">Save Digest</button>
            </form>
          </section>
        </aside>
      </div>

      <section className="settings-panel notification-activity-panel">
        <div className="settings-panel-title">
          <h3>Recent Notifications</h3>
          <p>Latest alerts delivered from SecureScan workflows.</p>
        </div>
        <div className="notification-activity-list">
          {notificationActivity.map(([title, target, time, status]) => (
            <article className="notification-activity-row" key={`${title}-${time}`}>
              <Bell size={18} />
              <strong>{title}<small>{target}</small></strong>
              <span>{time}</span>
              <b>{status}</b>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ScanPreferencesSettings() {
  const defaults = {
    profile: "Standard Scan",
    depth: 3,
    concurrency: 8,
    timeout: 30,
    schedule: "Weekly",
    window: "02:00",
    authScan: true,
    passiveMode: false,
    autoRetest: true,
    safeChecks: true,
  };
  const [prefs, setPrefs] = useState(defaults);
  const [exclusions, setExclusions] = useState(defaultExclusions);
  const [newExclusion, setNewExclusion] = useState("");
  const [message, setMessage] = useState("");

  function updatePref(field, value) {
    setPrefs((current) => ({ ...current, [field]: value }));
  }

  function togglePref(field) {
    setPrefs((current) => ({ ...current, [field]: !current[field] }));
  }

  function addExclusion(event) {
    event.preventDefault();
    const value = newExclusion.trim();

    if (!value) {
      setMessage("Add a path, pattern, or host to exclude.");
      return;
    }

    if (exclusions.includes(value)) {
      setMessage(`${value} is already excluded.`);
      return;
    }

    setExclusions((current) => [...current, value]);
    setNewExclusion("");
    setMessage(`${value} added to exclusions.`);
  }

  function savePreferences(event) {
    event.preventDefault();
    setMessage(`${prefs.profile} preferences saved.`);
  }

  function resetPreferences() {
    setPrefs(defaults);
    setExclusions(defaultExclusions);
    setMessage("Scan preferences reset to recommended defaults.");
  }

  return (
    <div className="scan-preferences-layout">
      {message && <div className="settings-message">{message}</div>}

      <div className="scan-pref-stats-grid">
        {[
          ["Default Profile", prefs.profile, "Applied to new scans", ShieldCheck, "green"],
          ["Crawl Depth", prefs.depth, "Levels per domain", Activity, "blue"],
          ["Concurrency", prefs.concurrency, "Parallel checks", BarChart3, "purple"],
          ["Schedule", prefs.schedule, `${prefs.window} window`, Clock3, "orange"],
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

          <div className="scan-profile-grid">
            {scanProfiles.map((profile) => (
              <button
                className={prefs.profile === profile.name ? `scan-profile-card active ${profile.tone}` : `scan-profile-card ${profile.tone}`}
                type="button"
                key={profile.name}
                onClick={() => updatePref("profile", profile.name)}
              >
                <strong>{profile.name}</strong>
                <span>{profile.time}</span>
                <small>{profile.coverage}</small>
              </button>
            ))}
          </div>

          <form className="scan-pref-form" onSubmit={savePreferences}>
            <label>
              <span>Crawl Depth</span>
              <input type="range" min="1" max="6" value={prefs.depth} onChange={(event) => updatePref("depth", Number(event.target.value))} />
              <b>{prefs.depth} levels</b>
            </label>
            <label>
              <span>Concurrency</span>
              <input type="range" min="2" max="16" value={prefs.concurrency} onChange={(event) => updatePref("concurrency", Number(event.target.value))} />
              <b>{prefs.concurrency} checks</b>
            </label>
            <label>
              <span>Request Timeout</span>
              <input type="number" min="10" max="120" value={prefs.timeout} onChange={(event) => updatePref("timeout", Number(event.target.value))} />
            </label>
            <label>
              <span>Schedule</span>
              <select value={prefs.schedule} onChange={(event) => updatePref("schedule", event.target.value)}>
                <option>Manual</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </label>
            <label>
              <span>Scan Window</span>
              <input type="time" value={prefs.window} onChange={(event) => updatePref("window", event.target.value)} />
            </label>
            <div className="scan-pref-actions">
              <button type="button" onClick={resetPreferences}>Reset</button>
              <button type="submit">Save Preferences</button>
            </div>
          </form>
        </section>

        <aside className="scan-pref-side-column">
          <section className="settings-panel scan-pref-toggles-panel">
            <h3>Scan Behavior</h3>
            <div className="scan-pref-toggle-list">
              {[
                ["authScan", "Authenticated scanning", "Use saved login context when available."],
                ["safeChecks", "Safe exploit checks", "Validate exposure without destructive payloads."],
                ["autoRetest", "Auto retest after remediation", "Queue follow-up scans after fixes."],
                ["passiveMode", "Passive mode", "Avoid active probes on sensitive domains."],
              ].map(([key, title, desc]) => (
                <button type="button" key={key} onClick={() => togglePref(key)}>
                  <span>{title}<small>{desc}</small></span>
                  <i className={prefs[key] ? "active" : ""}>{prefs[key] ? "On" : "Off"}</i>
                </button>
              ))}
            </div>
          </section>

          <section className="settings-panel scan-pref-exclusions-panel">
            <h3>Exclusions</h3>
            <p>Skip sensitive paths, files, hosts, or patterns during scans.</p>
            <form onSubmit={addExclusion}>
              <input placeholder="/private or *.pdf" value={newExclusion} onChange={(event) => setNewExclusion(event.target.value)} />
              <button type="submit">Add</button>
            </form>
            <div className="scan-pref-exclusion-list">
              {exclusions.map((item) => (
                <span key={item}>
                  {item}
                  <button type="button" onClick={() => setExclusions((current) => current.filter((entry) => entry !== item))}>
                    Remove
                  </button>
                </span>
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
          <article><Clock3 size={18} /><strong>Quiet window</strong><span>Scheduled scans run around {prefs.window} to reduce production impact.</span></article>
          <article><Wrench size={18} /><strong>Retest workflow</strong><span>{prefs.autoRetest ? "Enabled" : "Disabled"} for remediation verification.</span></article>
        </div>
      </section>
    </div>
  );
}

function SecuritySettings() {
  const [message, setMessage] = useState("");
  const [policy, setPolicy] = useState({
    mfa: true,
    sso: false,
    sessionTimeout: "30 minutes",
    passwordAge: "90 days",
    loginAlerts: true,
    apiKeyApproval: true,
  });
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [trustedIps, setTrustedIps] = useState(["103.21.244.0/24", "203.0.113.24"]);
  const [newIp, setNewIp] = useState("");

  function togglePolicy(field) {
    setPolicy((current) => ({ ...current, [field]: !current[field] }));
  }

  function updatePolicy(field, value) {
    setPolicy((current) => ({ ...current, [field]: value }));
  }

  function updatePassword(field, value) {
    setPassword((current) => ({ ...current, [field]: value }));
  }

  function savePassword(event) {
    event.preventDefault();

    if (!password.current || !password.next || !password.confirm) {
      setMessage("Fill all password fields before updating.");
      return;
    }

    if (password.next !== password.confirm) {
      setMessage("New password and confirmation do not match.");
      return;
    }

    setPassword({ current: "", next: "", confirm: "" });
    setMessage("Password updated successfully.");
  }

  function addTrustedIp(event) {
    event.preventDefault();
    const value = newIp.trim();

    if (!value) {
      setMessage("Add an IP address or CIDR range.");
      return;
    }

    if (trustedIps.includes(value)) {
      setMessage(`${value} is already trusted.`);
      return;
    }

    setTrustedIps((current) => [...current, value]);
    setNewIp("");
    setMessage(`${value} added to trusted network list.`);
  }

  return (
    <div className="security-settings-layout">
      {message && <div className="settings-message">{message}</div>}

      <div className="security-stats-grid">
        {[
          ["MFA", policy.mfa ? "Enabled" : "Off", "Account protection", Smartphone, "green"],
          ["Session Timeout", policy.sessionTimeout, "Idle logout", Clock3, "blue"],
          ["Password Policy", policy.passwordAge, "Rotation cycle", KeyRound, "purple"],
          ["Trusted Networks", trustedIps.length, "Allowed ranges", Monitor, "orange"],
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
            {[
              ["mfa", "Multi-factor authentication", "Require a second factor for every login."],
              ["sso", "Single sign-on", "Route workspace access through identity provider."],
              ["loginAlerts", "Login alerts", "Notify owners when new devices sign in."],
              ["apiKeyApproval", "API key approval", "Require owner approval before production keys activate."],
            ].map(([key, title, desc]) => (
              <button type="button" key={key} onClick={() => togglePolicy(key)}>
                <span>{title}<small>{desc}</small></span>
                <i className={policy[key] ? "active" : ""}>{policy[key] ? "On" : "Off"}</i>
              </button>
            ))}
          </div>
        </section>

        <aside className="security-side-column">
          <section className="settings-panel security-session-policy-panel">
            <h3>Session Policy</h3>
            <label>
              <span>Idle timeout</span>
              <select value={policy.sessionTimeout} onChange={(event) => updatePolicy("sessionTimeout", event.target.value)}>
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </label>
            <label>
              <span>Password rotation</span>
              <select value={policy.passwordAge} onChange={(event) => updatePolicy("passwordAge", event.target.value)}>
                <option>30 days</option>
                <option>60 days</option>
                <option>90 days</option>
                <option>Never</option>
              </select>
            </label>
            <button type="button" onClick={() => setMessage("Session policy saved.")}>Save Policy</button>
          </section>

          <section className="settings-panel security-trusted-panel">
            <h3>Trusted Networks</h3>
            <form onSubmit={addTrustedIp}>
              <input placeholder="192.168.1.0/24" value={newIp} onChange={(event) => setNewIp(event.target.value)} />
              <button type="submit">Add</button>
            </form>
            <div className="security-ip-list">
              {trustedIps.map((ip) => (
                <span key={ip}>
                  {ip}
                  <button type="button" onClick={() => setTrustedIps((current) => current.filter((item) => item !== ip))}>Remove</button>
                </span>
              ))}
            </div>
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
            {securitySessions.map(([device, location, time, status]) => (
              <article className="security-session-row" key={`${device}-${time}`}>
                <Monitor size={18} />
                <strong>{device}<small>{location}</small></strong>
                <span>{time}</span>
                <b className={status === "Expired" ? "expired" : ""}>{status}</b>
                <button type="button" onClick={() => setMessage(`${device} session revoked.`)} disabled={time === "Current session"}>
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
            {securityEvents.map(([event, actor, time, status]) => (
              <article className="security-event-row" key={`${event}-${time}`}>
                <Lock size={17} />
                <strong>{event}<small>{actor}</small></strong>
                <span>{time}</span>
                <b>{status}</b>
              </article>
            ))}
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
  return (
    <div className="api-access-layout">
      <div className="api-main-column">
        <section className="settings-panel api-overview">
          <div className="settings-panel-title">
            <h3>API Overview</h3>
            <p>Integrate SecureScan into your workflows, CI/CD pipelines, and custom tools using our RESTful API.</p>
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
                {apiKeys.map((item) => (
                  <tr key={item.name}>
                    <td>
                      <div className="api-key-name">
                        <strong>{item.name}</strong>
                        <small>{item.desc}</small>
                      </div>
                    </td>
                    <td>
                      <div className="api-key-value">
                        <span className="masked-key">{item.key}</span>
                        <span className="key-tools">
                          <button aria-label={`Reveal ${item.name}`} type="button">
                            <Eye size={19} />
                          </button>
                          <button aria-label={`Copy ${item.name}`} type="button">
                            <Copy size={19} />
                          </button>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="api-date-cell">
                        <span>{item.created[0]}</span>
                        <small>{item.created[1]}</small>
                      </div>
                    </td>
                    <td>
                      <div className="api-date-cell">
                        <span>{item.used[0]}</span>
                        <small>{item.used[1]}</small>
                      </div>
                    </td>
                    <td>
                      <b className="api-status">Active</b>
                    </td>
                    <td>
                      <button className="api-more" type="button">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
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
              May 2024 <ChevronDown size={14} />
            </button>
          </div>
          <div className="usage-content">
            <div className="usage-ring">
              <strong>128,645</strong>
              <span>Total Requests</span>
            </div>
            <div className="usage-legend">
              <p><i className="success" /> Successful <span>128,198 (99.65%)</span></p>
              <p><i className="failed" /> Failed <span>447 (0.35%)</span></p>
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
            <span>Requests per minute</span><b>60 / 120</b>
            <i><em style={{ width: "50%" }} /></i>
          </div>
          <div className="limit-row purple">
            <span>Requests per hour</span><b>1,250 / 5,000</b>
            <i><em style={{ width: "25%" }} /></i>
          </div>
          <div className="limit-row purple">
            <span>Requests per day</span><b>12,840 / 100,000</b>
            <i><em style={{ width: "13%" }} /></i>
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
    return <Navigate to="/settings/profile" replace />;
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
