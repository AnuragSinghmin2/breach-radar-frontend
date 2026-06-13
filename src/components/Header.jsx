import { useEffect, useState } from "react";
import "./Header.css";
import { Bell, Download, FileText, Menu, Moon, Plus, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Header({ toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");
  const currentPath = location.pathname.replace(/^\/dashboard/, "") || "/dashboard";

  let title = "Dashboard";
  let subtitle = "Overview of your security posture";
  let actionText = "Add Domain";
  let ActionIcon = Plus;
  let actionType = "add-domain";

  if (currentPath === "/domains") {
    title = "Domains";
    subtitle = "Manage and monitor your domains in one place";
    actionType = "domains-add";
  }

  if (currentPath === "/scans") {
    title = "Scans";
    subtitle = "Scan your domains and detect security vulnerabilities";
    actionText = "New Scan";
    actionType = "new-scan";
  }

  if (currentPath === "/vulnerabilities") {
    title = "Vulnerabilities";
    subtitle = "Track, prioritize and fix security vulnerabilities";
    actionText = "Export Report";
    ActionIcon = Download;
    actionType = "export";
  }

  if (currentPath === "/reports") {
    title = "Reports";
    subtitle = "View and download your security scan reports";
    actionText = "Generate Report";
    ActionIcon = FileText;
    actionType = "new-report";
  }

  if (currentPath === "/monitoring") {
    title = "Monitoring";
    subtitle = "Real-time monitoring of your assets and security health";
    actionText = "Add Monitor";
    ActionIcon = Plus;
    actionType = "add-monitor";
  }

  if (currentPath === "/remediation") {
    title = "Remediation";
    subtitle = "Fix vulnerabilities and improve your security posture";
    actionText = "Export Report";
    ActionIcon = Download;
    actionType = "export";
  }

  if (currentPath.startsWith("/settings")) {
    title = "Settings";
    subtitle = "Manage account, team, security, and API preferences";
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function downloadReport() {
    const csv = [
      ["Domain", "Critical", "High", "Medium", "Low", "Score"],
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "securescan-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleAction() {
    if (actionType === "export") {
      downloadReport();
      return;
    }

    if (actionType === "new-scan") {
      navigate("/dashboard/scans#new-scan");
      return;
    }

    if (actionType === "new-report") {
      navigate("/dashboard/reports#new-report");
      return;
    }

    if (actionType === "add-monitor") {
      navigate("/dashboard/monitoring#add-monitor");
      return;
    }

    if (actionType === "domains-add") {
      const element = document.getElementById("add-domain");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        const input = element.querySelector("input");
        if (input) input.focus();
      } else {
        navigate("/dashboard/domains#add-domain");
      }
      return;
    }

    if (actionType === "add-domain") {
      navigate("/dashboard/domains#add-domain");
      return;
    }

    navigate("/dashboard/domains#add-domain");
  }

  const ThemeIcon = theme === "dark" ? Moon : Sun;

  return (
    <div className="header">
      <div className="header-left">
        <Menu size={20} className="icon" onClick={toggleSidebar} />

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
          <ThemeIcon className="icon" />
        </button>

        <div className="header-notification">
          <button
            className="icon-btn"
            type="button"
            aria-label="Show notifications"
            title="Notifications"
          >
            <Bell className="icon" />
          </button>
        </div>

        <button className="add-btn" type="button" onClick={handleAction}>
          <ActionIcon size={16} /> {actionText}
        </button>

        <button
          className="user-avatar"
          type="button"
          aria-label="Open profile settings"
          onClick={() => navigate("/dashboard/settings/profile")}
        >
          <img src="https://i.pravatar.cc/40" alt="user" />
        </button>
      </div>
    </div>
  );
}
