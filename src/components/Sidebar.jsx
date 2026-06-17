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
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";
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

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const avatarUrl = resolveAvatarUrl(user?.profile?.avatar);
  const initials = getInitials(user?.profile?.name, user?.email);
  const isSettingsRoute = location.pathname.startsWith("/dashboard/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

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

        <div className="plan-header">
          <h3>Enterprise</h3>
          <span className="plan-badge">Active</span>
        </div>

        <p className="plan-date">Valid until 16 May 2025</p>

        <div className="plan-stats">
          <div className="row">
            <span>Domains</span>
            <span>5 / 10</span>
          </div>
          <div className="row">
            <span>Scans</span>
            <span>24 / 100</span>
          </div>
        </div>

        <button className="upgrade-btn">Upgrade Plan</button>
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
