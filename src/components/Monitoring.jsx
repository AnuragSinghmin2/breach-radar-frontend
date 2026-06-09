import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Filter,
  Gauge,
  Globe,
  MoreVertical,
  Search,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { monitoringApi } from "../services/api";
import { useDashboard } from "../context/DashboardContext";
import { formatScanTime, timeAgo } from "../utils/format";
import "./Monitoring.css";

function SeverityPill({ tone, children }) {
  return <span className={`monitor-pill ${tone}`}>{children}</span>;
}

function mapAlertTone(severity) {
  const value = String(severity || "").toLowerCase();
  if (value === "critical") return "critical";
  if (value === "high") return "high";
  if (value === "medium") return "medium";
  return "low";
}

function mapDomainStatus(domain) {
  if (domain.status === "Needs Attention") return "Down";
  if (domain.status === "Inactive") return "Down";
  return "Up";
}

export default function Monitoring() {
  const navigate = useNavigate();
  const { scans } = useDashboard();
  const [overview, setOverview] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sslData, setSslData] = useState({ expiringSoon: [], all: [] });
  const [domainData, setDomainData] = useState({ expiringSoon: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("Last 7 Days");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [activeMenu, setActiveMenu] = useState("");

  const loadMonitoring = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, alertsRes, sslRes, domainsRes] = await Promise.all([
        monitoringApi.getMonitoringOverview(),
        monitoringApi.getMonitoringAlerts({ status: "Active", limit: 100 }),
        monitoringApi.getSslMonitoring(),
        monitoringApi.getDomainExpiryMonitoring(),
      ]);

      setOverview(overviewRes);
      setAlerts(alertsRes);
      setSslData(sslRes);
      setDomainData(domainsRes);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonitoring();
  }, [loadMonitoring]);

  const monitors = useMemo(() => {
    return (overview?.monitoredDomains || []).map((domain) => ({
      id: domain.id,
      domain: domain.domain,
      url: `https://${domain.domain}`,
      type: "HTTP(s)",
      status: mapDomainStatus(domain),
      uptime: domain.scoreLabel || "Not scanned",
      response: domain.score != null ? `${domain.score}/100` : "—",
      checked: domain.lastScanAt ? formatScanTime(domain.lastScanAt) : "Not scanned",
      sslDaysRemaining: domain.sslDaysRemaining,
      domainDaysRemaining: domain.domainDaysRemaining,
    }));
  }, [overview]);

  const activeAlerts = useMemo(
    () =>
      alerts
        .filter((alert) => alert.status === "Active")
        .map((alert) => ({
          id: alert.id,
          severity: alert.severity,
          monitor: alert.domain || "Workspace",
          message: alert.message,
          started: formatScanTime(alert.createdAt),
          duration: timeAgo(alert.createdAt),
          tone: mapAlertTone(alert.severity),
          status: alert.status,
        })),
    [alerts]
  );

  const recentAlerts = useMemo(
    () =>
      alerts.slice(0, 5).map((alert) => [
        alert.title,
        alert.message,
        formatScanTime(alert.createdAt).split(", ").pop() || "—",
        mapAlertTone(alert.severity),
      ]),
    [alerts]
  );

  const responseData = useMemo(() => {
    const sourceScans = [...(scans || [])]
      .filter((scan) => scan.createdAt)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-12);

    if (!sourceScans.length) {
      return [{ time: "No scans", ms: 0 }];
    }

    return sourceScans.map((scan, index) => ({
      time: index % 3 === 0 ? formatScanTime(scan.createdAt).split(", ").pop() : "",
      ms: scan.riskScore ?? scan.summary?.riskScore ?? 50,
    }));
  }, [scans]);

  const avgResponse = responseData.length
    ? Math.round(responseData.reduce((sum, item) => sum + item.ms, 0) / responseData.length)
    : 0;
  const maxResponse = Math.max(...responseData.map((item) => item.ms), 0);
  const minResponse = Math.min(...responseData.map((item) => item.ms), 0);
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "Critical").length;
  const onlineCount = monitors.filter((monitor) => monitor.status === "Up").length;
  const summary = overview?.summary || {};

  const statCards = [
    {
      label: "Verified Domains",
      value: loading ? "..." : summary.verifiedDomains ?? 0,
      detail: "Auto-monitored assets",
      tone: "green",
      icon: Activity,
      filter: "All",
    },
    {
      label: "Healthy Domains",
      value: loading ? "..." : onlineCount,
      detail: monitors.length ? `${Math.round((onlineCount / monitors.length) * 100)}% healthy` : "0%",
      tone: "blue",
      icon: CheckCircle,
      neutral: true,
      filter: "Up",
    },
    {
      label: "Active Alerts",
      value: loading ? "..." : summary.activeAlerts ?? 0,
      detail: `${summary.criticalAlerts ?? 0} critical`,
      tone: "orange",
      icon: Clock,
      filter: "Alerts",
    },
    {
      label: "SSL / Domain Risks",
      value: loading ? "..." : (summary.sslExpiringSoon ?? 0) + (summary.domainsExpiringSoon ?? 0),
      detail: "Expiring within 30 days",
      tone: "red",
      icon: AlertTriangle,
      filter: "Critical",
    },
    {
      label: "Avg Risk Score",
      value: loading ? "..." : `${avgResponse}`,
      detail: "From recent scan activity",
      tone: "purple",
      icon: Gauge,
      neutral: true,
      good: avgResponse < 35,
      filter: "All",
    },
  ];

  const filteredMonitors = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return monitors.filter((monitor) => {
      const matchesQuery =
        monitor.domain.toLowerCase().includes(cleanQuery) ||
        monitor.url.toLowerCase().includes(cleanQuery) ||
        monitor.type.toLowerCase().includes(cleanQuery);
      const matchesStatus = statusFilter === "All" || monitor.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [monitors, query, statusFilter]);

  async function acknowledgeAlert(alert) {
    try {
      await monitoringApi.acknowledgeAlert(alert.id);
      setMessage(`${alert.monitor} alert acknowledged.`);
      await loadMonitoring();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to acknowledge alert.");
    } finally {
      setActiveMenu("");
    }
  }

  function cycleRange() {
    const ranges = ["Last 24 Hours", "Last 7 Days", "Last 30 Days"];
    setRange(ranges[(ranges.indexOf(range) + 1) % ranges.length]);
  }

  const systemStatus = overview?.status || "operational";

  return (
    <section className="monitor-page">
      <div className="monitor-stats-grid">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="monitor-stat-card"
              key={item.label}
              type="button"
              onClick={() => {
                if (item.filter === "Critical") setQuery("");
                if (item.filter === "Alerts") setStatusFilter("All");
                if (item.filter === "Up") setStatusFilter("Up");
                if (item.filter === "All") setStatusFilter("All");
              }}
            >
              <span className={`monitor-stat-icon ${item.tone}`}>
                <Icon size={30} />
              </span>
              <div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <small className={item.good ? "good" : item.neutral ? "neutral" : "positive"}>
                  {item.detail}
                </small>
              </div>
            </button>
          );
        })}
      </div>

      {message && <div className="monitor-message">{message}</div>}

      <section className="monitor-panel monitor-add-panel" id="add-monitor">
        <div>
          <h3>Automated Monitoring</h3>
          <p>
            Verified domains are scanned daily. SSL certificates and domain registrations are checked
            every 24 hours with email alerts to the workspace owner.
          </p>
        </div>
        <button type="button" onClick={() => navigate("/domains")}>
          Manage Domains
        </button>
      </section>

      <div className="monitor-top-grid">
        <section className="monitor-panel monitor-response-panel">
          <div className="monitor-panel-head">
            <h3>
              Scan Risk Trend
              <span className="monitor-info">i</span>
            </h3>
            <div className="monitor-chart-actions">
              <button type="button" onClick={cycleRange}>
                {range}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === "Down" ? "All" : "Down")}
              >
                <Filter size={14} /> {statusFilter === "Down" ? "Show All" : "Down Only"}
              </button>
            </div>
          </div>

          <div className="monitor-chart-wrap">
            <div className="monitor-avg">Avg. risk {avgResponse}</div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseData} margin={{ top: 18, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="responseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d68f" stopOpacity={0.42} />
                    <stop offset="96%" stopColor="#00d68f" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(44, 68, 94, 0.55)" vertical={false} />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#aeb8c7", fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value) => `${value}`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#aeb8c7", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(0, 214, 143, 0.35)" }}
                  contentStyle={{
                    background: "#071220",
                    border: "1px solid rgba(42, 69, 96, 0.9)",
                    borderRadius: 6,
                    color: "#f8fafc",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ms"
                  stroke="#00d68f"
                  strokeWidth={3}
                  fill="url(#responseFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#00d68f", stroke: "#072014" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="monitor-chart-summary">
            <p>
              <span>SSL expiring</span>
              <strong>{summary.sslExpiringSoon ?? 0}</strong>
            </p>
            <p>
              <span>Domains expiring</span>
              <strong className="warn">{summary.domainsExpiringSoon ?? 0}</strong>
            </p>
            <p>
              <span>Max risk score</span>
              <strong className="bad">{maxResponse}</strong>
            </p>
            <p>
              <span>Min risk score</span>
              <strong>{minResponse}</strong>
            </p>
          </div>
        </section>

        <section className="monitor-panel monitor-status-panel">
          <div className="monitor-panel-head">
            <h3>Monitoring Status</h3>
            <button type="button" onClick={loadMonitoring}>
              Refresh <ArrowRight size={14} />
            </button>
          </div>

          <div className="monitor-status-body">
            <div className={`monitor-status-donut ${criticalAlerts ? "warning" : ""}`}>
              <strong>
                {systemStatus === "critical"
                  ? "Critical"
                  : systemStatus === "attention"
                    ? "Attention"
                    : "Operational"}
              </strong>
              <span>
                {criticalAlerts
                  ? `${criticalAlerts} Critical`
                  : `${summary.activeAlerts ?? 0} active alerts`}
              </span>
            </div>
            <div className="monitor-status-list">
              {[
                ["Daily Scans", summary.lastDailyScanAt ? "Scheduled" : "Pending"],
                ["SSL Monitoring", `${sslData.expiringSoon?.length ?? 0} at risk`],
                ["Domain Expiry", `${domainData.expiringSoon?.length ?? 0} at risk`],
                ["Email Alerts", summary.emailConfigured ? "Configured" : "Not configured"],
                ["Verified Domains", `${summary.verifiedDomains ?? 0} monitored`],
              ].map(([item, status]) => (
                <button key={item} type="button" onClick={() => setMessage(`${item}: ${status}`)}>
                  <CheckCircle size={17} />
                  <span>{item}</span>
                  <strong>{status}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="monitor-success-strip">
            <CheckCircle size={18} />
            {criticalAlerts
              ? "Some monitored assets need attention"
              : "Breach Radar monitoring is active for verified domains"}
          </div>
        </section>
      </div>

      <div className="monitor-bottom-grid">
        <section className="monitor-panel monitor-alert-table-panel">
          <div className="monitor-panel-head">
            <h3>
              Active Alerts
              <span className="monitor-count">{activeAlerts.length}</span>
            </h3>
          </div>

          <div className="monitor-table-wrap">
            <div className="monitor-alert-table">
              <div className="monitor-alert-row head">
                <span>Severity</span>
                <span>Monitor</span>
                <span>Message</span>
                <span>Started At</span>
                <span>Duration</span>
                <span>Actions</span>
              </div>
              {loading && !activeAlerts.length ? (
                <div className="monitor-alert-row">
                  <span>Loading monitoring alerts...</span>
                </div>
              ) : null}
              {!loading && !activeAlerts.length ? (
                <div className="monitor-alert-row">
                  <span>No active alerts. Monitoring is healthy.</span>
                </div>
              ) : null}
              {activeAlerts.map((alert) => (
                <div className="monitor-alert-row" key={alert.id}>
                  <SeverityPill tone={alert.tone}>{alert.severity}</SeverityPill>
                  <strong>{alert.monitor}</strong>
                  <span>{alert.message}</span>
                  <span>{alert.started}</span>
                  <span>{alert.duration}</span>
                  <div className="monitor-row-actions">
                    <button
                      type="button"
                      onClick={() => navigate(`/reports?domain=${alert.monitor}`)}
                    >
                      Investigate
                    </button>
                    <button
                      aria-label="More actions"
                      type="button"
                      onClick={() => setActiveMenu(activeMenu === alert.id ? "" : alert.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu === alert.id && (
                      <div className="monitor-row-menu">
                        <button type="button" onClick={() => acknowledgeAlert(alert)}>
                          Acknowledge
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/domains?domain=${alert.monitor}`)}
                        >
                          Open Domain
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="monitor-panel monitor-recent-panel">
          <div className="monitor-panel-head">
            <h3>Recent Alerts</h3>
            <button type="button" onClick={loadMonitoring}>
              Refresh
            </button>
          </div>
          <div className="monitor-recent-list">
            {recentAlerts.map(([title, text, time, tone]) => (
              <button
                className="monitor-recent-item"
                type="button"
                key={`${title}-${time}`}
                onClick={() => setQuery(String(title).split(" ")[0])}
              >
                <i className={tone} />
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
                <time>{time}</time>
              </button>
            ))}
          </div>
        </section>

        <section className="monitor-panel monitor-uptime-panel">
          <div className="monitor-table-top">
            <h3>Monitored Domains</h3>
            <div className="monitor-controls">
              <label>
                <Search size={16} />
                <input
                  placeholder="Search monitors..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === "All" ? "Down" : "All")}
              >
                <Filter size={14} /> {statusFilter === "All" ? "Down Only" : "All"}
              </button>
            </div>
          </div>

          <div className="monitor-table-wrap">
            <div className="monitor-uptime-table">
              <div className="monitor-uptime-row head">
                <span>Monitor</span>
                <span>Type</span>
                <span>Status</span>
                <span>Security</span>
                <span>SSL / Domain</span>
                <span>Last Scanned</span>
                <span>Actions</span>
              </div>
              {filteredMonitors.map((monitor) => (
                <div className="monitor-uptime-row" key={monitor.domain}>
                  <button
                    className="monitor-domain-cell"
                    type="button"
                    onClick={() => navigate(`/domains?domain=${monitor.domain}`)}
                  >
                    <span>
                      <Globe size={17} />
                    </span>
                    <strong>
                      {monitor.domain}
                      <small>{monitor.url}</small>
                    </strong>
                  </button>
                  <span>{monitor.type}</span>
                  <SeverityPill tone={monitor.status === "Down" ? "critical" : "up"}>
                    {monitor.status}
                  </SeverityPill>
                  <span>{monitor.response}</span>
                  <strong>
                    SSL {monitor.sslDaysRemaining ?? "—"}d / Domain {monitor.domainDaysRemaining ?? "—"}d
                  </strong>
                  <span>{monitor.checked}</span>
                  <div className="monitor-icon-actions">
                    <button
                      aria-label="Open scans"
                      type="button"
                      onClick={() => navigate(`/scans?domain=${monitor.domain}`)}
                    >
                      <Activity size={15} />
                    </button>
                    <button
                      aria-label="Open report"
                      type="button"
                      onClick={() => navigate(`/reports?domain=${monitor.domain}`)}
                    >
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="monitor-panel monitor-domains-panel">
          <div className="monitor-panel-head">
            <h3>SSL Certificates Expiring Soon</h3>
            <button type="button" onClick={() => navigate("/monitoring")}>
              View All
            </button>
          </div>
          <div className="monitor-domain-list">
            {(sslData.expiringSoon || []).slice(0, 6).map((item) => (
              <button
                className="monitor-domain-item"
                type="button"
                key={item.id || item.domain}
                onClick={() => setQuery(item.domain)}
              >
                <Globe size={16} />
                <strong>{item.domain}</strong>
                <span className={item.risk === "critical" ? "down" : "up"}>{item.risk}</span>
                <em>{item.sslDaysRemaining ?? "—"} days</em>
              </button>
            ))}
            {!sslData.expiringSoon?.length ? (
              <p className="monitor-empty-copy">No SSL certificates expiring within 30 days.</p>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
}
