import "./StatsCards.css";
import { ShieldAlert, ShieldPlus, Shield, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";

function padCount(value) {
  return String(value).padStart(2, "0");
}

export default function StatsCards() {
  const navigate = useNavigate();
  const { stats, loading } = useDashboard();

  const cards = [
    {
      label: "Critical",
      value: padCount(stats.criticalCount),
      detail: "Open findings",
      tone: "critical",
      icon: ShieldAlert,
    },
    {
      label: "High",
      value: padCount(stats.highCount),
      detail: "Open findings",
      tone: "high",
      icon: ShieldAlert,
    },
    {
      label: "Medium",
      value: padCount(stats.mediumCount),
      detail: "Open findings",
      tone: "medium",
      icon: ShieldPlus,
      positive: true,
    },
    {
      label: "Low",
      value: padCount(stats.lowCount),
      detail: "Open findings",
      tone: "low",
      icon: ShieldPlus,
      positive: true,
    },
    {
      label: "Total Scans",
      value: String(stats.totalScans),
      detail: "All time",
      tone: "scans",
      icon: Shield,
      neutral: true,
    },
  ];

  return (
    <div className="dashboard-stats">
      <button
        className="dashboard-score-card"
        type="button"
        onClick={() => navigate("/dashboard/reports")}
      >
        <div className="dashboard-score-copy">
          <p>Security Score</p>
          <strong>{loading ? "..." : stats.securityScoreLabel || "Not Scanned"}</strong>
          <small>Workspace average from scanned domains</small>
        </div>
        <div
          className="dashboard-score-ring"
          aria-label={`Security score ${stats.securityScore || 0} out of 100`}
        >
          <div>
            <strong>{loading ? "—" : stats.securityScore ?? 0}</strong>
            <span>/100</span>
          </div>
        </div>
      </button>

      {cards.map((item) => {
        const Icon = item.label === "Total Scans" ? ScanLine : item.icon;
        const target =
          item.label === "Total Scans"
            ? "/dashboard/scans"
            : `/dashboard/vulnerabilities?severity=${item.label.toLowerCase()}`;

        return (
          <button
            className="dashboard-stat-card"
            key={item.label}
            type="button"
            onClick={() => navigate(target)}
          >
            <span className={`dashboard-stat-icon ${item.tone}`}>
              <Icon size={28} />
            </span>
            <div>
              <p>{item.label}</p>
              <strong>{loading ? "—" : item.value}</strong>
              <small className={item.positive ? "positive" : item.neutral ? "neutral" : ""}>
                {item.detail}
              </small>
            </div>
          </button>
        );
      })}
    </div>
  );
}
