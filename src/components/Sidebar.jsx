import "./Sidebar.css";
import {
  Activity,
  ChevronDown,
  FileText,
  Globe,
  HelpCircle,
  Home,
  Mail,
  Scan,
  Settings,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";
import { billingApi, getErrorMessage } from "../services/api";
import { getInitials, resolveAvatarUrl } from "../utils/profile";

const settingsLinks = [
  ["Profile", "/dashboard/settings/profile"],
  ["Team", "/dashboard/settings/team"],
  ["Plan & Billing", "/dashboard/settings/plan-billing"],
  ["Notifications", "/dashboard/settings/notifications"],
  ["Scan Preferences", "/dashboard/settings/scan-preferences"],
  ["Security", "/dashboard/settings/security"],
  ["API Access", "/dashboard/settings/api-access"],
  ["Integrations", "/dashboard/settings/integrations"],
  ["Activity Log", "/dashboard/settings/activity-log"],
];

const PLAN_NAMES_WITH_UPGRADE = new Set(["Starter", "Professional", "Business"]);

const statusMeta = {
  ACTIVE: { label: "ACTIVE", className: "active" },
  CANCELLED: { label: "CANCELLED", className: "cancelled" },
  EXPIRED: { label: "EXPIRED", className: "expired" },
  PAST_DUE: { label: "PAST_DUE", className: "past-due" },
};

function formatPlanDate(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatBillingCycle(value) {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getUsageMetric(usage, key) {
  return usage.find((item) => item.key === key) || { key, label: key, used: 0, limit: "-", rawLimit: 0 };
}

function formatUsageValue(metric) {
  return `${Number(metric.used || 0).toLocaleString()}/${metric.limit}`;
}

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const avatarUrl = resolveAvatarUrl(user?.profile?.avatar);
  const initials = getInitials(user?.profile?.name, user?.email);
  const isSettingsRoute = location.pathname.startsWith("/dashboard/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute);
  const [planData, setPlanData] = useState(null);
  const [planUsage, setPlanUsage] = useState([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState("");

  const loadPlanSummary = useCallback(async () => {
    if (!user) {
      setPlanData(null);
      setPlanUsage([]);
      setPlanLoading(false);
      setPlanError("");
      return;
    }

    setPlanLoading(true);
    setPlanError("");
    try {
      const [currentPlanData, usageData] = await Promise.all([
        billingApi.getCurrentPlan(),
        billingApi.getUsage(),
      ]);

      const organizationPlan = currentPlanData.organization?.subscriptionPlan;
      const subscriptionPlan = currentPlanData.subscription?.planName || currentPlanData.subscription?.currentPlan;
      if (organizationPlan && subscriptionPlan && organizationPlan !== subscriptionPlan) {
        console.warn(
          `[Billing Summary] Plan mismatch: Organization.subscriptionPlan=${organizationPlan}, Subscription.planName=${subscriptionPlan}`
        );
      }

      setPlanData(currentPlanData);
      setPlanUsage(usageData.usage || []);
    } catch (error) {
      setPlanError(getErrorMessage(error, "Unable to load subscription information"));
    } finally {
      setPlanLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPlanSummary();
  }, [loadPlanSummary]);

  useEffect(() => {
    window.addEventListener("billing:refresh", loadPlanSummary);
    return () => window.removeEventListener("billing:refresh", loadPlanSummary);
  }, [loadPlanSummary]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const subscription = planData?.subscription || {};
  const planName = subscription.planName || subscription.currentPlan || planData?.currentPlan || "-";
  const statusKey = String(subscription.status || "").replace(/-/g, "_").toUpperCase();
  const badge = statusMeta[statusKey] || { label: statusKey || "-", className: "unknown" };
  const usageRows = [
    getUsageMetric(planUsage, "domains"),
    getUsageMetric(planUsage, "scans"),
    getUsageMetric(planUsage, "seats"),
  ];

  return (
    <div className={`sidebar ${isOpen ? "show" : "hide"}`}>
      <div className="logo">
        <div>
          <BrandLogo className="sidebar-brand-logo" iconSize={30} />
          <p>Security Platform</p>
        </div>
      </div>

      <div className="menu">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <Home size={18} /> Dashboard
        </NavLink>

        <NavLink
          to="/dashboard/domains"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <Globe size={18} /> Domains
        </NavLink>

        <NavLink
          to="/dashboard/scans"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <Scan size={18} /> Scans
        </NavLink>

        <NavLink
          to="/dashboard/vulnerabilities"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <ShieldAlert size={18} /> Vulnerabilities
        </NavLink>
        <NavLink
          to="/dashboard/reports"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <FileText size={18} /> Reports
        </NavLink>
        <NavLink
          to="/dashboard/monitoring"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <Activity size={18} /> Monitoring
        </NavLink>
        <NavLink
          to="/dashboard/remediation"
          className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
        >
          <Wrench size={18} /> Remediation
        </NavLink>

        <button
          type="button"
          onClick={() => setSettingsOpen((open) => !open)}
          className={
            isSettingsRoute
              ? "menu-item settings-parent active"
              : "menu-item settings-parent"
          }
        >
          <span>
            <Settings size={18} /> Settings
          </span>
          <ChevronDown size={16} />
        </button>

        {settingsOpen && (
          <div className="settings-submenu">
            {settingsLinks.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  isActive ? "settings-subitem active" : "settings-subitem"
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="plan-card">
        <p className="plan-title">Your Plan</p>
        {planLoading ? (
          <p className="plan-date">Loading subscription...</p>
        ) : planError ? (
          <div className="plan-error">
            <p>Unable to load subscription information</p>
            <button type="button" onClick={loadPlanSummary}>Retry</button>
          </div>
        ) : (
          <>
            <div className="plan-header">
              <h3>{planName}</h3>
              <span className={`plan-badge ${badge.className}`}>{badge.label}</span>
            </div>

            <div className="plan-details">
              <span><b>Billing Cycle</b>{formatBillingCycle(subscription.billingCycle)}</span>
              <span><b>Next Billing Date</b>{formatPlanDate(subscription.nextBillingDate)}</span>
            </div>

            <p className="plan-date">Valid until {formatPlanDate(subscription.nextBillingDate)}</p>

            <div className="plan-stats compact">
              {usageRows.map((item) => (
                <span className="plan-usage-pill" key={item.key}>
                  <b>{item.label}</b>{formatUsageValue(item)}
                </span>
              ))}
            </div>

            {PLAN_NAMES_WITH_UPGRADE.has(planName) ? (
              <button className="upgrade-btn" type="button" onClick={() => navigate("/dashboard/settings/plan-billing")}>
                Upgrade Plan
              </button>
            ) : (
              <button className="support-btn" type="button" disabled>
                Highest Plan Active
              </button>
            )}
          </>
        )}
      </div>

      <div className="help-card">
        <h4>Need Help?</h4>
        <p>
          <FileText size={14} /> Documentation
        </p>
        <p>
          <HelpCircle size={14} /> Support
        </p>
        <p>
          <Mail size={14} /> Contact Us
        </p>
      </div>

      <div className="user-profile">
        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span className="sidebar-user-initials">{initials}</span>}
        <div className="user-info">
          <p className="user-name">{user?.profile?.name || user?.email || ""}</p>
          <span className="user-email">{user?.email || ""}</span>
        </div>
        <button className="sidebar-logout" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
