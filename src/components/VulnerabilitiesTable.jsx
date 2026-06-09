import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { vulnerabilityApi } from "../services/api";
import { formatScanTime, severityTone } from "../utils/format";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe2,
  MoreVertical,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import "./table.css";

function mapVulnerability(item) {
  return {
    id: item._id,
    name: item.name,
    desc: item.desc,
    severity: item.severity,
    domain: item.domainId?.domain || "",
    status: item.status,
    detected: formatScanTime(item.detectedAt),
    tone: item.tone || severityTone(item.severity),
    cwe: item.cwe,
    path: item.path,
    impact: item.impact,
    fix: item.fix,
  };
}

const severityOrder = ["Critical", "High", "Medium", "Low"];
const statusOptions = ["All Status", "Open", "In Progress", "Resolved"];

function Badge({ tone, children }) {
  return <span className={`vuln-badge ${tone}`}>{children}</span>;
}

function statusTone(status) {
  if (status === "Resolved") return "resolved";
  if (status === "In Progress") return "progress";
  return "open";
}

export default function VulnerabilitiesTable() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vulnerabilities: contextVulnerabilities, loading: contextLoading, refreshDomains, refreshStats } =
    useDashboard();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState(
    searchParams.get("severity")
      ? searchParams.get("severity")[0].toUpperCase() + searchParams.get("severity").slice(1)
      : "All"
  );
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selected, setSelected] = useState(null);
  const [activeMenu, setActiveMenu] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadVulnerabilities = useCallback(async () => {
    try {
      const data = await vulnerabilityApi.getVulnerabilities();
      const mapped = data.map(mapVulnerability);
      setItems(mapped);
      setSelected((current) => current || mapped[0] || null);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load vulnerabilities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contextVulnerabilities.length > 0) {
      const mapped = contextVulnerabilities.map(mapVulnerability);
      setItems(mapped);
      setSelected((current) => current || mapped[0] || null);
      setLoading(false);
      return;
    }

    if (!contextLoading) {
      loadVulnerabilities();
    }
  }, [contextLoading, contextVulnerabilities, loadVulnerabilities]);

  const stats = useMemo(() => {
    const count = (severity) => items.filter((item) => item.severity === severity).length;

    return [
      { label: "Critical", value: count("Critical"), detail: "open findings", tone: "critical", icon: ShieldX },
      { label: "High", value: count("High"), detail: "open findings", tone: "high", icon: ShieldAlert },
      { label: "Medium", value: count("Medium"), detail: "open findings", tone: "medium", icon: Shield },
      { label: "Low", value: count("Low"), detail: "open findings", tone: "low", icon: ShieldCheck },
      { label: "Total", value: items.length, detail: "all severities", tone: "total", icon: Shield },
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(cleanQuery) ||
        item.desc.toLowerCase().includes(cleanQuery) ||
        item.domain.toLowerCase().includes(cleanQuery) ||
        item.cwe.toLowerCase().includes(cleanQuery);
      const matchesSeverity = severityFilter === "All" || item.severity === severityFilter;
      const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;

      return matchesQuery && matchesSeverity && matchesStatus;
    });
  }, [items, query, severityFilter, statusFilter]);

  const domainBars = useMemo(() => {
    const byDomain = items.reduce((acc, item) => {
      acc[item.domain] = (acc[item.domain] || 0) + 1;
      return acc;
    }, {});
    const max = Math.max(...Object.values(byDomain));

    return Object.entries(byDomain)
      .sort((a, b) => b[1] - a[1])
      .map(([domain, value]) => {
        const mostSevere = severityOrder.find((severity) =>
          items.some((item) => item.domain === domain && item.severity === severity)
        );
        return [domain, value, mostSevere?.toLowerCase() || "green", `${Math.max(20, (value / max) * 100)}%`];
      });
  }, [items]);

  function cycleStatus() {
    const next = (statusOptions.indexOf(statusFilter) + 1) % statusOptions.length;
    setStatusFilter(statusOptions[next]);
  }

  async function updateStatus(target, status) {
    try {
      await vulnerabilityApi.updateVulnerabilityStatus(target.id, status);
      setItems((current) =>
        current.map((item) => (item.id === target.id ? { ...item, status } : item))
      );
      setSelected((current) => (current?.id === target.id ? { ...current, status } : current));
      setActiveMenu("");
      setMessage(`${target.name} marked as ${status}.`);
      await Promise.all([refreshDomains(), refreshStats()]);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update vulnerability status.");
    }
  }

  function exportCsv() {
    const csv = [
      ["Vulnerability", "Domain", "Severity", "Status", "CWE", "Path"],
      ...filteredItems.map((item) => [item.name, item.domain, item.severity, item.status, item.cwe, item.path]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vulnerabilities.csv";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Filtered vulnerability report exported.");
  }

  const openCount = items.filter((item) => item.status === "Open").length;
  const progressCount = items.filter((item) => item.status === "In Progress").length;
  const resolvedCount = items.filter((item) => item.status === "Resolved").length;
  const riskScore = Math.min(100, stats[0].value * 18 + stats[1].value * 10 + stats[2].value * 5 + stats[3].value * 2);

  return (
    <section className="vuln-page">
      <div className="vuln-stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          const isDown = item.detail.startsWith("-");

          return (
            <button
              className="vuln-stat-card"
              type="button"
              key={item.label}
              onClick={() => setSeverityFilter(item.label === "Total" ? "All" : item.label)}
            >
              <span className={`vuln-stat-icon ${item.tone}`}>
                <Icon size={31} />
              </span>
              <div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <small className={isDown ? "down" : "up"}>{item.detail}</small>
              </div>
            </button>
          );
        })}
      </div>

      {loading && <div className="vuln-message">Loading vulnerabilities...</div>}
      {message && <div className="vuln-message">{message}</div>}

      <div className="vuln-layout-grid">
        <div className="vuln-left-column">
          <section className="vuln-panel vuln-table-panel">
            <div className="vuln-table-top">
              <h3>All Vulnerabilities</h3>
              <div className="vuln-controls">
                <label>
                  <Search size={16} />
                  <input
                    placeholder="Search vulnerabilities..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <button type="button" onClick={cycleStatus}>
                  {statusFilter} <ChevronDown size={15} />
                </button>
              </div>
            </div>

            <div className="vuln-tabs">
              {[
                ["All", items.length],
                ["Open", openCount],
                ["In Progress", progressCount],
                ["Resolved", resolvedCount],
              ].map(([status, count]) => (
                <button
                  className={(status === "All" ? statusFilter === "All Status" : statusFilter === status) ? "active" : ""}
                  type="button"
                  key={status}
                  onClick={() => setStatusFilter(status === "All" ? "All Status" : status)}
                >
                  {status} ({count})
                </button>
              ))}
            </div>

            <div className="vuln-table-wrap">
              <div className="vuln-table">
                <div className="vuln-row vuln-head">
                  <span>Vulnerability</span>
                  <span>Severity</span>
                  <span>Domain</span>
                  <span>Status</span>
                  <span>Detected At</span>
                  <span>Actions</span>
                </div>

                {filteredItems.map((item) => (
                  <div className="vuln-row" key={`${item.name}-${item.domain}`}>
                    <button className="vuln-name-cell" type="button" onClick={() => setSelected(item)}>
                      <span className={`vuln-bug-icon ${item.tone}`}>
                        <ShieldAlert size={21} />
                      </span>
                      <strong>{item.name}<small>{item.desc}</small></strong>
                    </button>
                    <button className="vuln-plain-btn" type="button" onClick={() => setSeverityFilter(item.severity)}>
                      <Badge tone={item.tone}>{item.severity}</Badge>
                    </button>
                    <button className="vuln-domain" type="button" onClick={() => navigate(`/domains?domain=${item.domain}`)}>
                      <Globe2 size={18} /> {item.domain}
                    </button>
                    <button className="vuln-plain-btn" type="button" onClick={() => setStatusFilter(item.status)}>
                      <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                    </button>
                    <span>{item.detected}</span>
                    <div className="vuln-actions">
                      <button type="button" aria-label={`View ${item.name}`} onClick={() => setSelected(item)}>
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`More actions for ${item.name}`}
                        onClick={() => setActiveMenu(activeMenu === `${item.name}-${item.domain}` ? "" : `${item.name}-${item.domain}`)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeMenu === `${item.name}-${item.domain}` && (
                        <div className="vuln-row-menu">
                          <button type="button" onClick={() => updateStatus(item, "In Progress")}>Start Fix</button>
                          <button type="button" onClick={() => updateStatus(item, "Resolved")}>Mark Resolved</button>
                          <button type="button" onClick={() => navigate(`/remediation?issue=${encodeURIComponent(item.name)}`)}>Remediation</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="vuln-empty">No vulnerabilities match the selected filters.</div>
                )}
              </div>
            </div>

            <div className="vuln-pagination">
              <p>Showing {filteredItems.length ? 1 : 0} to {filteredItems.length} of {items.length} vulnerabilities</p>
              <div>
                <button type="button" disabled><ChevronLeft size={16} /></button>
                <button className="active" type="button">1</button>
                <button type="button" disabled><ChevronRight size={16} /></button>
              </div>
            </div>
          </section>

          {selected && (
            <section className="vuln-detail-panel">
              <button className="vuln-detail-close" type="button" aria-label="Close details" onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
              <div>
                <Badge tone={selected.tone}>{selected.severity}</Badge>
                <h3>{selected.name}</h3>
                <p>{selected.desc}</p>
              </div>
              <div className="vuln-detail-grid">
                <span><b>Asset</b>{selected.domain}</span>
                <span><b>Path</b>{selected.path}</span>
                <span><b>CWE</b>{selected.cwe}</span>
                <span><b>Status</b>{selected.status}</span>
              </div>
              <div className="vuln-detail-copy">
                <strong>Impact</strong>
                <p>{selected.impact}</p>
                <strong>Recommended fix</strong>
                <p>{selected.fix}</p>
              </div>
              <div className="vuln-detail-actions">
                <button type="button" onClick={() => updateStatus(selected, "In Progress")}>Start Fix</button>
                <button type="button" onClick={() => navigate(`/remediation?issue=${encodeURIComponent(selected.name)}`)}>Open Remediation</button>
                <button type="button" onClick={() => updateStatus(selected, "Resolved")}>Mark Resolved</button>
              </div>
            </section>
          )}

          <section className="vuln-guide-panel">
            <span><ShieldCheck size={38} /></span>
            <div>
              <h3>Fix critical vulnerabilities first!</h3>
              <p>Addressing critical issues can prevent the highest-impact attack paths.</p>
            </div>
            <button type="button" onClick={() => navigate("/remediation")}>
              View Remediation Guide <ArrowRight size={16} />
            </button>
          </section>
        </div>

        <aside className="vuln-right-column">
          <section className="vuln-panel">
            <h3>Severity Distribution</h3>
            <div className="vuln-distribution">
              <div className="vuln-donut">
                <strong>{items.length}</strong>
                <span>Total</span>
              </div>
              <div className="vuln-legend">
                {severityOrder.map((severity) => {
                  const count = stats.find((item) => item.label === severity)?.value || 0;
                  const percent = items.length ? ((count / items.length) * 100).toFixed(1) : "0.0";

                  return (
                    <button type="button" key={severity} onClick={() => setSeverityFilter(severity)}>
                      <i className={severity.toLowerCase()} /> {severity} <span>{count} ({percent}%)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="vuln-panel">
            <div className="vuln-side-head">
              <h3>Top Vulnerable Domains</h3>
              <button type="button" onClick={() => navigate("/domains")}>View All</button>
            </div>
            <div className="vuln-domain-bars">
              {domainBars.map(([domain, value, tone, width]) => (
                <button className="vuln-domain-bar" type="button" key={domain} onClick={() => setQuery(domain)}>
                  <span>{domain}<b>{value}</b></span>
                  <i><em className={tone} style={{ width }} /></i>
                </button>
              ))}
            </div>
          </section>

          <section className="vuln-panel vuln-risk-panel">
            <h3>Risk Score</h3>
            <div className="vuln-gauge">
              <div className="vuln-gauge-arc" />
              <strong>{riskScore} <small>/100</small></strong>
            </div>
            <div className="vuln-risk-label">
              <ShieldAlert size={18} /> {riskScore >= 70 ? "High Risk" : "Moderate Risk"}
            </div>
            <p><ArrowDown size={14} /> Based on open findings <span>in this workspace</span></p>
            <button type="button" onClick={exportCsv}>Export Risk Details <ArrowRight size={16} /></button>
          </section>
        </aside>
      </div>
    </section>
  );
}
