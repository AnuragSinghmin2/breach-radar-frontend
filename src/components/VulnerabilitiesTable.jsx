import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { getErrorMessage, scanApi, vulnerabilityApi } from "../services/api";
import {
  createDomainSecurityReportPdf,
  getDomainReportFilename,
} from "../utils/domainReportPdf";
import { formatScanTime, severityTone } from "../utils/format";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe2,
  Loader2,
  MoreVertical,
  Search,
  X,
} from "lucide-react";
import "./table.css";

const ITEMS_PER_PAGE = 6;
const SCORE_RING_SIZE = 64;
const SCORE_RING_STROKE = 6;
const SCAN_POLL_INTERVAL_MS = 2500;
const SCAN_POLL_ATTEMPTS = 60;


function mapVulnerability(item) {
  return {
    id: item._id,
    name: item.name || "Untitled finding",
    desc: item.desc || "",
    severity: item.severity || "Medium",
    domain: item.domainId?.domain || "N/A",
    status: item.status || "Open",
    detectedAt: item.detectedAt || "",
    detected: formatScanTime(item.detectedAt),
    tone: item.tone || severityTone(item.severity),
    cwe: item.cwe || "-",
    cve: item.cve || item.cves || "-",
    path: item.path || "-",
    affectedUrl: item.affectedUrl || item.url || item.path || "-",
    impact: item.impact || "No impact details available.",
    fix: item.fix || "No remediation guidance available.",
    technicalDetails: item.technicalDetails || item.evidence || item.findings || item.responseHeaders || "",
    source: item.source || item.scannerSource || item.scanner || "Scanner",
    cvss: item.cvssScore || item.cvss || "",
    references: item.references || [],
    category: item.category || "",
    subCategory: item.subCategory || "",
  };
}

const severityOrder = ["Critical", "High", "Medium", "Low"];
const statusOptions = ["All Status", "Open", "In Progress", "Resolved"];

function Badge({ tone, children }) {
  return (
    <span className={`vuln-severity-badge-pill ${tone}`}>
      <i className="vuln-pill-dot" />
      {children}
    </span>
  );
}

function statusTone(status) {
  if (status === "Resolved") return "resolved";
  if (status === "In Progress") return "progress";
  return "open";
}

function unwrapVulnerabilityResponse(data) {
  return data?.vulnerability || data?.data || data;
}

function textValue(...values) {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  if (Array.isArray(value)) return value.filter(Boolean).join("\n");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return value || "-";
}

function formatReferences(value) {
  const refs = Array.isArray(value) ? value : value ? [value] : [];
  return refs
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      return item.url || item.href || item.title || item.name || "";
    })
    .filter(Boolean);
}

function scoreFromVulnerabilities(severityCounts) {
  const penalty =
    (severityCounts.Critical || 0) * 18 +
    (severityCounts.High || 0) * 10 +
    (severityCounts.Medium || 0) * 5 +
    (severityCounts.Low || 0) * 2;

  return Math.max(0, Math.min(100, 100 - penalty));
}

function scoreValue(value) {
  return Math.round(Math.max(0, Math.min(100, Number(value) || 0)));
}

function CircularSecurityScore({ value }) {
  const score = scoreValue(value);
  const radius = (SCORE_RING_SIZE - SCORE_RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="vuln-score-ring" aria-label={`Security score ${score} out of 100`}>
      <svg width={SCORE_RING_SIZE} height={SCORE_RING_SIZE} viewBox={`0 0 ${SCORE_RING_SIZE} ${SCORE_RING_SIZE}`}>
        <circle
          className="vuln-score-ring-track"
          cx={SCORE_RING_SIZE / 2}
          cy={SCORE_RING_SIZE / 2}
          r={radius}
          strokeWidth={SCORE_RING_STROKE}
        />
        <circle
          className="vuln-score-ring-progress"
          cx={SCORE_RING_SIZE / 2}
          cy={SCORE_RING_SIZE / 2}
          r={radius}
          strokeWidth={SCORE_RING_STROKE}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span>
        <strong>{score}</strong>
        <small>/100</small>
      </span>
    </div>
  );
}

function DomainMetric({ tone = "total", value, label }) {
  return (
    <div className={`vuln-domain-metric ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function VulnerabilitiesTable() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { domains, vulnerabilities: contextVulnerabilities, loading: contextLoading, refreshDomains, refreshStats } =
    useDashboard();
  const selectedDomainParam = searchParams.get("domain") || "";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDomain, setExpandedDomain] = useState("");
  const [refreshingDomain, setRefreshingDomain] = useState("");
  const [downloadingDomain, setDownloadingDomain] = useState("");
  const hasFetched = useRef(false);

  const loadVulnerabilities = useCallback(async () => {
    try {
      const data = await vulnerabilityApi.getVulnerabilities();
      const mapped = data.map(mapVulnerability);
      setItems(mapped);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load vulnerabilities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contextVulnerabilities.length > 0) {
      const mapped = contextVulnerabilities.map(mapVulnerability);
      queueMicrotask(() => {
        setItems(mapped);
        setLoading(false);
        hasFetched.current = true;
      });
      return;
    }

    if (!contextLoading && !hasFetched.current) {
      hasFetched.current = true;
      loadVulnerabilities();
    }
  }, [contextLoading, contextVulnerabilities, loadVulnerabilities]);

  useEffect(() => {
    const param = searchParams.get("severity");
    if (!param) return;
    const normalized = param[0].toUpperCase() + param.slice(1).toLowerCase();
    if (severityOrder.includes(normalized)) {
      queueMicrotask(() => setSeverityFilter(normalized));
    }
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(cleanQuery) ||
        item.desc.toLowerCase().includes(cleanQuery) ||
        item.domain.toLowerCase().includes(cleanQuery) ||
        item.cwe.toLowerCase().includes(cleanQuery);
      const matchesDomain =
        !selectedDomainParam || item.domain.toLowerCase() === selectedDomainParam.toLowerCase();
      const matchesSeverity = severityFilter === "All" || item.severity === severityFilter;
      const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;

      return matchesDomain && matchesQuery && matchesSeverity && matchesStatus;
    });
  }, [items, query, selectedDomainParam, severityFilter, statusFilter]);

  const domainScoreMap = useMemo(
    () =>
      domains.reduce((acc, item) => {
        acc[item.domain?.toLowerCase()] = item.score;
        return acc;
      }, {}),
    [domains]
  );

  const domainGroups = useMemo(() => {
    const groups = filteredItems.reduce((acc, item) => {
      if (!acc[item.domain]) {
        acc[item.domain] = {
          domain: item.domain,
          items: [],
          severityCounts: { Critical: 0, High: 0, Medium: 0, Low: 0 },
          openCount: 0,
          resolvedCount: 0,
          lastDetectedAt: "",
          lastDetected: "N/A",
          score: 0,
        };
      }

      const group = acc[item.domain];
      group.items.push(item);
      group.severityCounts[item.severity] = (group.severityCounts[item.severity] || 0) + 1;
      if (item.status === "Open") group.openCount += 1;
      if (item.status === "Resolved") group.resolvedCount += 1;

      const currentTime = item.detectedAt ? new Date(item.detectedAt).getTime() : 0;
      const lastTime = group.lastDetectedAt ? new Date(group.lastDetectedAt).getTime() : 0;
      if (currentTime > lastTime) {
        group.lastDetectedAt = item.detectedAt;
        group.lastDetected = item.detected;
      }

      return acc;
    }, {});

    return Object.values(groups)
      .map((group) => ({
        ...group,
        score:
          domainScoreMap[group.domain.toLowerCase()] ??
          scoreFromVulnerabilities(group.severityCounts),
      }))
      .sort((a, b) => {
        const aTime = a.lastDetectedAt ? new Date(a.lastDetectedAt).getTime() : 0;
        const bTime = b.lastDetectedAt ? new Date(b.lastDetectedAt).getTime() : 0;
        return bTime - aTime || a.domain.localeCompare(b.domain);
      });
  }, [domainScoreMap, filteredItems]);

  const totalItems = domainGroups.length;
  const totalVulnerabilityItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedGroups = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return domainGroups.slice(start, start + ITEMS_PER_PAGE);
  }, [domainGroups, safeCurrentPage]);

  useEffect(() => {
    queueMicrotask(() => setCurrentPage(1));
  }, [query, selectedDomainParam, severityFilter, statusFilter]);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalItems);

  useEffect(() => {
    if (!activeMenu) return;
    function handleClickOutside(event) {
      if (!event.target.closest(".vuln-actions-cell") && !event.target.closest(".vuln-domain-actions")) {
        setActiveMenu("");
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeMenu]);

  useEffect(() => {
    if (!selected) return;
    function handleEscape(event) {
      if (event.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selected]);

  function cycleStatus() {
    const next = (statusOptions.indexOf(statusFilter) + 1) % statusOptions.length;
    setStatusFilter(statusOptions[next]);
  }

  function toggleDomain(domain) {
    setExpandedDomain((current) => (current === domain ? "" : domain));
  }

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  async function waitForScanCompletion(scanId) {
    for (let attempt = 0; attempt < SCAN_POLL_ATTEMPTS; attempt += 1) {
      await delay(SCAN_POLL_INTERVAL_MS);
      const latest = await scanApi.getScanStatus(scanId);
      if (latest.status === "Completed") return latest;
      if (latest.status === "Failed") {
        throw new Error(latest.errorDetail || "Domain refresh scan failed.");
      }
    }
    throw new Error("Domain refresh is still running. Please try again shortly.");
  }

  async function refreshDomain(group) {
    if (refreshingDomain || downloadingDomain) return;

    setRefreshingDomain(group.domain);
    setActiveMenu("");
    setMessage(`Refreshing ${group.domain}...`);

    try {
      const { scan } = await scanApi.startScan({ domain: group.domain, scanType: "Full Scan" });
      await waitForScanCompletion(scan._id);
      const domainVulnerabilities = await vulnerabilityApi.getVulnerabilities({ domain: group.domain });
      const mappedDomainItems = domainVulnerabilities.map(mapVulnerability);

      setItems((current) => [
        ...current.filter((item) => item.domain.toLowerCase() !== group.domain.toLowerCase()),
        ...mappedDomainItems,
      ]);
      await Promise.all([refreshDomains(), refreshStats()]);
      setMessage(`${group.domain} refreshed successfully.`);
    } catch (error) {
      setMessage(getErrorMessage(error, `Failed to refresh ${group.domain}.`));
    } finally {
      setRefreshingDomain("");
    }
  }

  function downloadDomainReport(group) {
    if (refreshingDomain || downloadingDomain) return;

    setDownloadingDomain(group.domain);
    setActiveMenu("");

    try {
      const domainVulnerabilities = items.filter(
        (item) => item.domain.toLowerCase() === group.domain.toLowerCase()
      );
      const blob = createDomainSecurityReportPdf({
        domain: { domain: group.domain, score: group.score },
        vulnerabilities: domainVulnerabilities,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getDomainReportFilename(group.domain);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`Security report download started for ${group.domain}.`);
    } catch (error) {
      setMessage(error.message || `Failed to generate report for ${group.domain}.`);
    } finally {
      setDownloadingDomain("");
    }
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

  const openCount = items.filter((item) => item.status === "Open").length;
  const progressCount = items.filter((item) => item.status === "In Progress").length;
  const resolvedCount = items.filter((item) => item.status === "Resolved").length;

  return (
    <section className="vuln-page">
      {loading && <div className="vuln-message">Loading vulnerabilities...</div>}
      {message && <div className="vuln-message">{message}</div>}

      <div className="vuln-layout-grid">
        <div className="vuln-left-column">
          <section className="vuln-panel vuln-table-panel">
            <div className="vuln-table-top">
              <div className="vuln-table-top-header">
                <h3>{selectedDomainParam ? `${selectedDomainParam} Vulnerabilities` : "All Vulnerabilities"}</h3>
                <div className="vuln-table-top-actions">
                  <label className="vuln-search-wrapper">
                    <Search size={16} />
                    <input
                      className="vuln-search-input"
                      placeholder="Search vulnerabilities..."
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </label>
                  <button className="vuln-status-select-btn" type="button" onClick={cycleStatus}>
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
            </div>

            <div className="vuln-domain-group-list">
              {paginatedGroups.map((group) => {
                const isExpanded = expandedDomain === group.domain;
                const detailId = `vuln-domain-${group.domain.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
                const metrics = [
                  { value: group.items.length, label: "Total" },
                  { tone: "critical", value: group.severityCounts.Critical || 0, label: "Critical" },
                  { tone: "high", value: group.severityCounts.High || 0, label: "High" },
                  { tone: "medium", value: group.severityCounts.Medium || 0, label: "Medium" },
                  { tone: "low", value: group.severityCounts.Low || 0, label: "Low" },
                  { tone: "open", value: group.openCount, label: "Open" },
                  { tone: "resolved", value: group.resolvedCount, label: "Resolved" },
                ];

                return (
                  <article className="vuln-domain-card" key={group.domain}>
                    <div
                      className="vuln-domain-card-row"
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-controls={detailId}
                      onClick={() => toggleDomain(group.domain)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleDomain(group.domain);
                        }
                      }}
                    >
                      <span className="vuln-expand-icon">
                        <ChevronDown size={18} />
                      </span>

                      <span className="vuln-domain-card-asset">
                        <span className="vuln-domain-icon">
                          <Globe2 size={22} />
                        </span>
                        <span>
                          <strong>{group.domain}</strong>
                          <small>
                            Last detected:
                            <b>{group.lastDetected}</b>
                          </small>
                        </span>
                      </span>

                      <div className="vuln-domain-card-metrics">
                        <div className="vuln-domain-score-metric">
                          <CircularSecurityScore value={group.score} />
                          <span>Security Score</span>
                        </div>
                        {metrics.map((metric) => (
                          <DomainMetric
                            key={metric.label}
                            tone={metric.tone}
                            value={metric.value}
                            label={metric.label}
                          />
                        ))}
                      </div>
                      <div className="vuln-domain-actions">
                        <button
                          className="vuln-domain-menu-btn"
                          type="button"
                          aria-label={`More actions for ${group.domain}`}
                          aria-expanded={activeMenu === `domain:${group.domain}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveMenu(activeMenu === `domain:${group.domain}` ? "" : `domain:${group.domain}`);
                          }}
                        >
                          {(refreshingDomain === group.domain || downloadingDomain === group.domain) ? (
                            <Loader2 size={16} className="vuln-menu-spin" />
                          ) : (
                            <MoreVertical size={16} />
                          )}
                        </button>
                        {activeMenu === `domain:${group.domain}` && (
                          <div className="vuln-domain-menu" onClick={(event) => event.stopPropagation()}>
                            <button
                              type="button"
                              disabled={Boolean(refreshingDomain || downloadingDomain)}
                              onClick={() => refreshDomain(group)}
                            >
                              {refreshingDomain === group.domain && <Loader2 size={13} className="vuln-menu-spin" />}
                              Refresh
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(refreshingDomain || downloadingDomain)}
                              onClick={() => downloadDomainReport(group)}
                            >
                              {downloadingDomain === group.domain && <Loader2 size={13} className="vuln-menu-spin" />}
                              Download Report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`vuln-domain-accordion ${isExpanded ? "open" : ""}`}
                      id={detailId}
                    >
                      <div className="vuln-domain-detail-list">
                        <div className="vuln-domain-detail-head">
                          <span>Vulnerability</span>
                          <span>Severity</span>
                          <span>Status</span>
                          <span>Detected At</span>
                          <span>Actions</span>
                        </div>
                        {group.items.map((item) => (
                          <div className="vuln-domain-detail-item" key={item.id}>
                            <button className="vuln-name-cell" type="button" onClick={() => setSelected(item)}>
                              <span>
                                <strong className="vuln-name-title">{item.name}</strong>
                                <small className="vuln-desc-subtitle">{item.desc}</small>
                              </span>
                            </button>

                            <button className="vuln-plain-btn" type="button" onClick={() => setSeverityFilter(item.severity)}>
                              <Badge tone={item.tone}>{item.severity}</Badge>
                            </button>

                            <button className="vuln-plain-btn" type="button" onClick={() => setStatusFilter(item.status)}>
                              <span className={`vuln-status-badge-pill ${statusTone(item.status)}`}>{item.status}</span>
                            </button>

                            <span className="vuln-detected-date">{item.detected}</span>

                            <div className="vuln-actions-cell">
                              <button className="vuln-action-icon-btn" type="button" aria-label={`View ${item.name}`} onClick={() => setSelected(item)}>
                                <Eye size={16} />
                              </button>
                              <button
                                className="vuln-action-icon-btn"
                                type="button"
                                aria-label={`More actions for ${item.name}`}
                                onClick={() => setActiveMenu(activeMenu === item.id ? "" : item.id)}
                              >
                                <MoreVertical size={16} />
                              </button>
                              {activeMenu === item.id && (
                                <div className="vuln-row-menu">
                                  <button type="button" onClick={() => updateStatus(item, "In Progress")}>Start Fix</button>
                                  <button type="button" onClick={() => updateStatus(item, "Resolved")}>Mark Resolved</button>
                                  <button type="button" onClick={() => navigate(`/dashboard/remediation?issue=${encodeURIComponent(item.name)}`)}>Remediation</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}

              {domainGroups.length === 0 && (
                <div className="vuln-empty-cell">No scan data available</div>
              )}
            </div>

            <div className="vuln-pagination">
              <p>
                Showing {startItem} to {endItem} of {totalItems} domains ({totalVulnerabilityItems} vulnerabilities)
              </p>

              <div>
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                </button>

                <button className="active" type="button" aria-current="page">
                  {safeCurrentPage}
                </button>

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>

          {selected && (
            <div
              className="vuln-detail-overlay"
              role="presentation"
              onClick={(event) => {
                if (event.target === event.currentTarget) setSelected(null);
              }}
            >
              <section className="vuln-detail-panel" role="dialog" aria-modal="true">
                <button className="vuln-detail-close" type="button" aria-label="Close details" onClick={() => setSelected(null)}>
                  <X size={16} />
                </button>
                <div>
                  <Badge tone={selected.tone}>{selected.severity}</Badge>
                  <h3>{selected.name}</h3>
                  {(selected.category || selected.subCategory) && (
                    <p className="vuln-detail-category">
                      {[selected.category, selected.subCategory].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p>{selected.desc}</p>
                </div>
                <div className="vuln-detail-grid">
                  <span><b>Asset</b>{selected.domain}</span>
                  <span><b>Path</b>{selected.path}</span>
                  <span><b>CWE</b>{selected.cwe}</span>
                  <span><b>Status</b>{selected.status}</span>
                  {selected.cvss !== "" && <span><b>CVSS Score</b>{selected.cvss}</span>}
                </div>
                <div className="vuln-detail-copy">
                  <strong>Impact</strong>
                  <p>{selected.impact}</p>
                  <strong>Recommended fix</strong>
                  <p>{selected.fix}</p>
                  {selected.technicalDetails && (
                    <>
                      <strong>Evidence</strong>
                      <p className="vuln-detail-evidence">{selected.technicalDetails}</p>
                    </>
                  )}
                  {selected.references.length > 0 && (
                    <>
                      <strong>References</strong>
                      <ul className="vuln-detail-references">
                        {selected.references.map((ref) => (
                          <li key={ref}>
                            <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                <div className="vuln-detail-actions">
                  <button type="button" onClick={() => updateStatus(selected, "In Progress")}>Start Fix</button>
                  <button type="button" onClick={() => navigate(`/dashboard/remediation?issue=${encodeURIComponent(selected.name)}`)}>Open Remediation</button>
                  <button type="button" onClick={() => updateStatus(selected, "Resolved")}>Mark Resolved</button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}