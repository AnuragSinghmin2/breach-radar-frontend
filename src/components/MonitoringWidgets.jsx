import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, CalendarClock, Shield } from "lucide-react";
import { monitoringApi } from "../services/api";
import "./MonitoringWidgets.css";

function toneForStatus(status) {
  if (status === "critical") return "red";
  if (status === "attention") return "orange";
  return "green";
}

export default function MonitoringWidgets() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setError("");
      try {
        const [overviewData, alertData] = await Promise.all([
          monitoringApi.getMonitoringOverview(),
          monitoringApi.getMonitoringAlerts({ status: "Active", limit: 5 }),
        ]);

        if (!active) return;
        setOverview(overviewData);
        setAlerts(alertData);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || err.message || "Failed to load monitoring data");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const summary = overview?.summary || {};
  const statusLabel =
    overview?.status === "critical"
      ? "Critical Attention"
      : overview?.status === "attention"
        ? "Needs Attention"
        : "Operational";

  const cards = [
    {
      label: "SSL Expiring Soon",
      value: loading ? "..." : String(summary.sslExpiringSoon ?? 0),
      detail: "Within 30 days",
      tone: "orange",
      icon: Shield,
      onClick: () => navigate("/dashboard/monitoring"),
    },
    {
      label: "Domains Expiring Soon",
      value: loading ? "..." : String(summary.domainsExpiringSoon ?? 0),
      detail: "Registration renewal",
      tone: "purple",
      icon: CalendarClock,
      onClick: () => navigate("/dashboard/monitoring"),
    },
    {
      label: "Recent Alerts",
      value: loading ? "..." : String(summary.activeAlerts ?? 0),
      detail: `${summary.criticalAlerts ?? 0} critical`,
      tone: "red",
      icon: AlertTriangle,
      onClick: () => navigate("/dashboard/monitoring"),
    },
    {
      label: "Monitoring Status",
      value: loading ? "..." : statusLabel,
      detail: loading ? "" : `${summary.verifiedDomains ?? 0} verified domains`,
      tone: toneForStatus(overview?.status),
      icon: Activity,
      onClick: () => navigate("/dashboard/monitoring"),
    },
  ];

  return (
    <section className="monitoring-widgets">
      <div className="monitoring-widgets-head">
        <div>
          <h3>Breach Radar Monitoring</h3>
          <p>SSL, domain expiry, scheduled scans, and security alerts</p>
        </div>
        <button type="button" onClick={() => navigate("/dashboard/monitoring")}>
          Open Monitoring
        </button>
      </div>

      {error && <div className="monitoring-widgets-error">{error}</div>}

      <div className="monitoring-widgets-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              className="monitoring-widget-card"
              onClick={card.onClick}
            >
              <span className={`monitoring-widget-icon ${card.tone}`}>
                <Icon size={22} />
              </span>
              <div>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
                <small>{card.detail}</small>
              </div>
            </button>
          );
        })}
      </div>

      {!loading && alerts.length > 0 && (
        <div className="monitoring-widgets-alerts">
          {alerts.slice(0, 3).map((alert) => (
            <button
              key={alert.id}
              type="button"
              className={`monitoring-widget-alert ${alert.severity?.toLowerCase()}`}
              onClick={() => navigate("/dashboard/monitoring")}
            >
              <strong>{alert.domain || "Workspace"}</strong>
              <span>{alert.message}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
