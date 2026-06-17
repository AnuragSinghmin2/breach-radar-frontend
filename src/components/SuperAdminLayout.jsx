import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resolveAvatarUrl } from "../utils/profile";
import BrandLogo from "./BrandLogo";
import Footer from "./Footer";
import {
  Activity,
  Users,
  Globe,
  Scan,
  ShieldAlert,
  FileText,
  Layers,
  DollarSign,
  MessageSquare,
  History,
  HeartPulse,
  Settings,
  Menu,
  Moon,
  Sun,
  Bell
} from "lucide-react";
import "./Sidebar.css";
import "./Header.css";
import "../App.css";

export default function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 760);
  const [theme, setTheme] = useState("dark");
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const avatarUrl = resolveAvatarUrl(user?.profile?.avatar);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  // Determine title and subtitle based on route path
  let title = "Super Admin Dashboard";
  let subtitle = "System metrics, aggregates, and admin utilities";

  if (location.pathname.startsWith("/super-admin/users")) {
    title = "Users Management";
    subtitle = "Manage platform users, roles, statuses, and plans";
  } else if (location.pathname.startsWith("/super-admin/domains")) {
    title = "Global Domains";
    subtitle = "Monitor all domain targets across all workspaces";
  } else if (location.pathname.startsWith("/super-admin/scans")) {
    title = "Global Scan Queue";
    subtitle = "Inspect and manage scanning tasks in the system";
  } else if (location.pathname.startsWith("/super-admin/vulnerabilities")) {
    title = "Vulnerabilities Ledger";
    subtitle = "Oversee all vulnerabilities discovered globally";
  } else if (location.pathname.startsWith("/super-admin/reports")) {
    title = "Global Reports";
    subtitle = "Audit generated reports across all accounts";
  } else if (location.pathname.startsWith("/super-admin/subscriptions")) {
    title = "SaaS Plans Management";
    subtitle = "Create, edit, and delete subscription tiers";
  } else if (location.pathname.startsWith("/super-admin/payments")) {
    title = "Payments & Revenue Ledger";
    subtitle = "Analyze transactions, issue refunds, and track ARR";
  } else if (location.pathname.startsWith("/super-admin/tickets")) {
    title = "Support Ticket desk";
    subtitle = "Resolve platform customer requests and incidents";
  } else if (location.pathname.startsWith("/super-admin/audit-logs")) {
    title = "System Audit Logs";
    subtitle = "Security-sensitive activities logging for compliance";
  } else if (location.pathname.startsWith("/super-admin/system-health")) {
    title = "System Health status";
    subtitle = "Monitor state of API, Database, Redis, and workers";
  } else if (location.pathname.startsWith("/super-admin/settings")) {
    title = "Super Admin Settings";
    subtitle = "Manage administrative profiles and security parameters";
  }

  return (
    <div className="app-wrapper">
      <div className="app-container">
        
        {/* SUPER ADMIN SIDEBAR */}
        <div className={`sidebar ${sidebarOpen ? "show" : "hide"}`}>
          <div className="logo">
            <div>
              <BrandLogo className="sidebar-brand-logo" iconSize={30} />
              <p>SUPER ADMIN PANEL</p>
            </div>
          </div>

          <div className="menu">
            <NavLink
              to="/super-admin"
              end
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <Activity size={18} /> Dashboard
            </NavLink>

            <NavLink
              to="/super-admin/users"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <Users size={18} /> Users
            </NavLink>

            <NavLink
              to="/super-admin/domains"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <Globe size={18} /> Domains
            </NavLink>

            <NavLink
              to="/super-admin/scans"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <Scan size={18} /> Scans
            </NavLink>

            <NavLink
              to="/super-admin/vulnerabilities"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <ShieldAlert size={18} /> Vulnerabilities
            </NavLink>

            <NavLink
              to="/super-admin/reports"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <FileText size={18} /> Reports
            </NavLink>

            <NavLink
              to="/super-admin/subscriptions"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <Layers size={18} /> Subscriptions
            </NavLink>

            <NavLink
              to="/super-admin/payments"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <DollarSign size={18} /> Payments
            </NavLink>

            <NavLink
              to="/super-admin/tickets"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <MessageSquare size={18} /> Support Tickets
            </NavLink>

            <NavLink
              to="/super-admin/audit-logs"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <History size={18} /> Audit Logs
            </NavLink>

            <NavLink
              to="/super-admin/system-health"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <HeartPulse size={18} /> System Health
            </NavLink>

            <NavLink
              to="/super-admin/settings"
              className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
            >
              <Settings size={18} /> Settings
            </NavLink>
          </div>

          <div className="plan-card" style={{ background: "rgba(0, 214, 143, 0.05)", border: "1px solid rgba(0, 214, 143, 0.2)" }}>
            <p className="plan-title">Access Clearance</p>
            <div className="plan-header" style={{ marginTop: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", color: "#00d68f" }}>Super Admin</h3>
              <span className="plan-badge" style={{ background: "#00d68f", color: "#000" }}>ROOT</span>
            </div>
            <p className="plan-date" style={{ fontSize: "11px", marginTop: "4px" }}>Full System Control</p>
          </div>

          <div className="user-profile">
            <img src={avatarUrl || "https://i.pravatar.cc/40"} alt="user" />
            <div className="user-info">
              <p className="user-name">{user?.profile?.name || "Super Admin"}</p>
              <span className="user-email">{user?.email}</span>
            </div>
            <button className="sidebar-logout" type="button" onClick={handleLogout}>
              Log out Admin
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="main-content">
          
          {/* HEADER */}
          <div className="header">
            <div className="header-left">
              <Menu size={20} className="icon" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: "pointer" }} />
              <div className="header-title">
                <h2>{title}</h2>
                <p>{subtitle}</p>
              </div>
            </div>

            <div className="header-right">
              <button
                className="icon-btn"
                type="button"
                aria-label="Toggle theme"
                title="Toggle theme"
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              >
                {theme === "dark" ? <Moon className="icon" /> : <Sun className="icon" />}
              </button>

              <div className="header-notification">
                <button className="icon-btn" type="button" title="Notifications">
                  <Bell className="icon" />
                </button>
              </div>

            </div>
          </div>

          {/* RENDER PAGES */}
          <div className="content-area" style={{ padding: "24px", overflowY: "auto" }}>
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
