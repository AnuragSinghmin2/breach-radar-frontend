import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { reportApi } from "../services/api";
import { mapApiReport } from "../utils/reportMapper";
import {
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Filter,
  MoreVertical,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Zap,
  X,
} from "lucide-react";
import "./Reports.css";

const included = [
  "Vulnerability Details",
  "Risk Analysis",
  "Remediation Steps",
  "Scan Summary",
  "OWASP Top 10",
  "Executive Summary",
];

const statusFilters = ["All", "Completed", "In Progress", "Failed"];

function Badge({ tone, children }) {
  return <span className={`reports-badge ${tone}`}>{children}</span>;
}

function Score({ value }) {
  if (!value) {
    return (
      <div className="reports-score muted">
        <strong>-</strong>
        <span>/100</span>
      </div>
    );
  }

  return (
    <div className={`reports-score ${value >= 70 ? "good" : value >= 55 ? "warn" : "bad"}`}>
      <strong>{value}</strong>
      <span>/100</span>
    </div>
  );
}

function statusTone(status) {
  if (status === "Completed") return "green";
  if (status === "In Progress") return "blue";
  return "red";
}

function reportText(report) {
  const counts = report.vulns
    ? `Critical: ${report.vulns[0]}, High: ${report.vulns[1]}, Medium: ${report.vulns[2]}, Low: ${report.vulns[3]}`
    : "Findings are not available yet.";

  return [
    "SecureScan Security Report",
    `Report ID: ${report.id}`,
    `Domain: ${report.domain}`,
    `Scan Type: ${report.scanType}`,
    `Status: ${report.status}`,
    `Security Score: ${report.score || "-"}/100`,
    `Generated: ${report.generated.replaceAll("\n", " ")}`,
    `Findings: ${counts}`,
    "",
    "Included sections:",
    ...included.map((item) => `- ${item}`),
  ].join("\n");
}

export default function Reports() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reports, domains, loading, refreshReports } = useDashboard();
  const initialDomain = searchParams.get("domain") || "";
  const [query, setQuery] = useState(initialDomain);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [activeMenu, setActiveMenu] = useState("");
  const [message, setMessage] = useState("");
  const [builderOpen, setBuilderOpen] = useState(window.location.hash === "#new-report");
  const [draft, setDraft] = useState({
    domain: initialDomain || domains[0]?.domain || "",
    scanType: "Full Scan",
    template: "Executive",
    owner: "Security Team",
    sections: included,
  });

  useEffect(() => {
    if (reports.length > 0) {
      const match =
        reports.find((report) => report.domain === initialDomain) || reports[0];
      setSelected(match);
    } else {
      setSelected(null);
    }
  }, [initialDomain, reports]);

  useEffect(() => {
    if (!draft.domain && domains[0]?.domain) {
      setDraft((current) => ({ ...current, domain: domains[0].domain }));
    }
  }, [domains, draft.domain]);

  useEffect(() => {
    function handleHashChange() {
      if (window.location.hash === "#new-report") {
        setBuilderOpen(true);
      }
    }

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const filteredReports = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesQuery =
        report.title.toLowerCase().includes(cleanQuery) ||
        report.id.toLowerCase().includes(cleanQuery) ||
        report.domain.toLowerCase().includes(cleanQuery) ||
        report.scanType.toLowerCase().includes(cleanQuery);
      const matchesStatus = statusFilter === "All" || report.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, reports, statusFilter]);

  const stats = useMemo(() => {
    const completed = reports.filter((report) => report.status === "Completed").length;
    const progress = reports.filter((report) => report.status === "In Progress").length;
    const failed = reports.filter((report) => report.status === "Failed").length;

    return [
      {
        label: "Total Reports",
        value: reports.length,
        detail: "from scan history",
        tone: "green",
        icon: FileText,
        filter: "All",
      },
      {
        label: "Completed",
        value: completed,
        detail: `${reports.length ? Math.round((completed / reports.length) * 100) : 0}% completed`,
        tone: "blue",
        icon: Check,
        filter: "Completed",
      },
      {
        label: "In Progress",
        value: progress,
        detail: "currently generating",
        tone: "orange",
        icon: Clock3,
        filter: "In Progress",
      },
      {
        label: "Failed",
        value: failed,
        detail: "need attention",
        tone: "red",
        icon: X,
        filter: "Failed",
      },
    ];
  }, [reports]);

  function cycleStatus() {
    const next = (statusFilters.indexOf(statusFilter) + 1) % statusFilters.length;
    setStatusFilter(statusFilters[next]);
  }

  function downloadReport(report = selected) {
    if (!report) return;
    const blob = new Blob([reportText(report)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id.replace("#", "")}-${report.domain}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage(`${report.id} downloaded.`);
  }

  function shareReport(report = selected) {
    if (!report) return;
    setMessage(`Share link copied for ${report.id}: securescan.local/reports/${report.id.replace("#", "")}`);
  }

  function toggleSection(section) {
    setDraft((current) => {
      const hasSection = current.sections.includes(section);
      const sections = hasSection
        ? current.sections.filter((item) => item !== section)
        : [...current.sections, section];

      return { ...current, sections };
    });
  }

  const generateReport = useCallback(
    async (event) => {
      event?.preventDefault();

      try {
        const data = await reportApi.generateReport({
          domain: draft.domain,
          scanType: draft.scanType,
          template: draft.template,
          owner: draft.owner,
          sections: draft.sections,
        });

        await refreshReports();
        const report = mapApiReport(data.report);
        setSelected(report);
        setStatusFilter("Completed");
        setQuery("");
        setBuilderOpen(false);
        setMessage(`${report.id} generated for ${draft.domain}.`);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to generate report.");
      }
    },
    [draft, refreshReports]
  );

  const summaryVulns = selected?.vulns || [0, 0, 0, 0];
  const totalFindings = summaryVulns.reduce((sum, value) => sum + value, 0);
  const domainOptions = domains.length
    ? domains.map((item) => item.domain)
    : [...new Set(reports.map((report) => report.domain))];

  return (
    <section className="reports-page">
      <div className="reports-stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="reports-stat-card"
              type="button"
              key={item.label}
              onClick={() => setStatusFilter(item.filter)}
            >
              <span className={`reports-stat-icon ${item.tone}`}>
                <Icon size={29} />
              </span>
              <div>
                <p>{item.label}</p>
                <strong>{loading ? "—" : item.value}</strong>
                <small>{item.detail}</small>
              </div>
            </button>
          );
        })}
      </div>

      {loading && <div className="reports-message">Loading reports...</div>}
      {message && <div className="reports-message">{message}</div>}

      <div className="reports-layout-grid">
        <section className="reports-panel reports-table-panel">
          <div className="reports-table-top">
            <h3>All Reports</h3>
            <div className="reports-controls">
              <label>
                <Search size={16} />
                <input
                  placeholder="Search reports..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <button type="button" onClick={cycleStatus}>
                <Filter size={16} /> {statusFilter}
              </button>
            </div>
          </div>

          <div className="reports-table-wrap">
            <div className="reports-table">
              <div className="reports-row reports-head">
                <span>Report</span>
                <span>Domain</span>
                <span>Scan Type</span>
                <span>Status</span>
                <span>Vulnerabilities</span>
                <span>Score</span>
                <span>Generated At</span>
                <span>Actions</span>
              </div>

              {filteredReports.map((report) => (
                <div className="reports-row" key={report.id}>
                  <button className="reports-name-cell" type="button" onClick={() => setSelected(report)}>
                    <span className="reports-pdf-icon">PDF</span>
                    <strong>
                      {report.title}
                      <small>{report.id}</small>
                    </strong>
                  </button>
                  <button
                    className="reports-domain-btn"
                    type="button"
                    onClick={() => navigate(`/dashboard/domains?domain=${report.domain}`)}
                  >
                    {report.domain}
                  </button>
                  <span className={`reports-scan-type ${report.type}`}>
                    {report.type === "quick" ? <Zap size={15} /> : <Shield size={15} />}
                    {report.scanType}
                  </span>
                  <button
                    className="reports-plain-btn"
                    type="button"
                    onClick={() => setStatusFilter(report.status)}
                  >
                    <Badge tone={statusTone(report.status)}>{report.status}</Badge>
                  </button>
                  <div className="reports-vuln-counts">
                    {report.vulns ? (
                      ["critical", "high", "medium", "low"].map((tone, index) => (
                        <button
                          className={tone}
                          type="button"
                          key={tone}
                          onClick={() =>
                            navigate(`/dashboard/vulnerabilities?domain=${report.domain}&severity=${tone}`)
                          }
                        >
                          <b>{report.vulns[index]}</b>
                          <small>{tone[0].toUpperCase() + tone.slice(1)}</small>
                        </button>
                      ))
                    ) : (
                      <span className="empty">-</span>
                    )}
                  </div>
                  <Score value={report.score} />
                  <span className="reports-generated">
                    {report.generated.split("\n").map((line) => (
                      <small key={line}>{line}</small>
                    ))}
                  </span>
                  <div className="reports-actions">
                    <button
                      type="button"
                      aria-label={`Download ${report.id}`}
                      onClick={() => downloadReport(report)}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={`More actions for ${report.id}`}
                      onClick={() => setActiveMenu(activeMenu === report.id ? "" : report.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu === report.id && (
                      <div className="reports-row-menu">
                        <button type="button" onClick={() => setSelected(report)}>
                          Preview
                        </button>
                        <button type="button" onClick={() => shareReport(report)}>
                          Share
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/scans?domain=${report.domain}`)}
                        >
                          Re-run Scan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="reports-empty">
                  {loading ? "Loading reports..." : "No reports match your filters."}
                </div>
              )}
            </div>
          </div>

          <div className="reports-pagination">
            <p>
              Showing {filteredReports.length ? 1 : 0} to {filteredReports.length} of{" "}
              {reports.length} reports
            </p>
            <div>
              <button type="button" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="active" type="button">
                1
              </button>
              <button type="button" disabled>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <aside className="reports-side-column">
          <section className="reports-panel reports-preview-panel" id="new-report">
            <div className="reports-preview-head">
              <h3>Report Preview</h3>
              <button type="button" onClick={() => setBuilderOpen((open) => !open)}>
                <FileText size={15} /> Generate
              </button>
            </div>
            {builderOpen && (
              <form className="reports-builder" onSubmit={generateReport}>
                <label>
                  <span>Domain</span>
                  <select
                    value={draft.domain}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, domain: event.target.value }))
                    }
                  >
                    {domainOptions.map((domain) => (
                      <option value={domain} key={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Scan Type</span>
                  <select
                    value={draft.scanType}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, scanType: event.target.value }))
                    }
                  >
                    <option>Full Scan</option>
                    <option>Quick Scan</option>
                    <option>Custom Scan</option>
                  </select>
                </label>
                <label>
                  <span>Template</span>
                  <select
                    value={draft.template}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, template: event.target.value }))
                    }
                  >
                    <option>Executive</option>
                    <option>Technical</option>
                    <option>Compliance</option>
                  </select>
                </label>
                <label>
                  <span>Owner</span>
                  <input
                    value={draft.owner}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, owner: event.target.value }))
                    }
                  />
                </label>
                <div className="reports-builder-sections">
                  {included.map((section) => (
                    <button
                      className={draft.sections.includes(section) ? "active" : ""}
                      type="button"
                      key={section}
                      onClick={() => toggleSection(section)}
                    >
                      <Check size={14} /> {section}
                    </button>
                  ))}
                </div>
                <button className="reports-primary-action" type="submit">
                  <FileText size={16} /> Generate Report
                </button>
              </form>
            )}
            {selected && (
              <>
                <div className="reports-preview-body">
                  <div className="reports-cover">
                    <ShieldCheck size={21} />
                    <b>SecureScan</b>
                    <strong>{selected.title}</strong>
                    <small>
                      {selected.domain}
                      <br />
                      {selected.generated.split("\n").slice(0, 2).join(", ")}
                    </small>
                  </div>
                  <div className="reports-meta">
                    <p>
                      <span>Report ID</span>
                      <b>{selected.id}</b>
                    </p>
                    <p>
                      <span>Domain</span>
                      <b>{selected.domain}</b>
                    </p>
                    <p>
                      <span>Scan Type</span>
                      <b>{selected.scanType}</b>
                    </p>
                    <p>
                      <span>Status</span>
                      <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
                    </p>
                    <p>
                      <span>Owner</span>
                      <b>{selected.owner}</b>
                    </p>
                    <p>
                      <span>File Size</span>
                      <b>{selected.generated.split("\n")[2]}</b>
                    </p>
                  </div>
                </div>
                <button
                  className="reports-primary-action"
                  type="button"
                  onClick={() => downloadReport(selected)}
                >
                  <Download size={16} /> Download PDF
                </button>
                <button
                  className="reports-secondary-action"
                  type="button"
                  onClick={() => shareReport(selected)}
                >
                  <Send size={16} /> Share Report
                </button>
                <button
                  className="reports-secondary-action"
                  type="button"
                  onClick={() => navigate(`/dashboard/scans?domain=${selected.domain}`)}
                >
                  <CalendarClock size={16} /> Open Scan
                </button>
              </>
            )}
          </section>

          <section className="reports-panel">
            <h3>Report Summary</h3>
            <div className="reports-summary">
              <div className="reports-donut">
                <strong>{totalFindings}</strong>
                <span>Total</span>
              </div>
              <div className="reports-legend">
                {["critical", "high", "medium", "low"].map((tone, index) => {
                  const value = summaryVulns[index];
                  const percent = totalFindings
                    ? ((value / totalFindings) * 100).toFixed(1)
                    : "0.0";

                  return (
                    <button
                      type="button"
                      key={tone}
                      onClick={() =>
                        navigate(`/dashboard/vulnerabilities?domain=${selected?.domain || ""}&severity=${tone}`)
                      }
                    >
                      <i className={tone} /> {tone[0].toUpperCase() + tone.slice(1)}{" "}
                      <span>
                        {value} ({percent}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="reports-panel reports-security-panel">
            <h3>Security Score</h3>
            <div className="reports-security-body">
              <Score value={selected?.score} />
              <div className="reports-score-copy">
                <strong>{selected?.score ? "From latest scan" : "Pending"}</strong>
                <small>{selected?.score ? "based on domain score" : "waiting for scan output"}</small>
              </div>
            </div>
          </section>

          <section className="reports-panel reports-included-panel">
            <h3>Included in this report</h3>
            <div>
              {included.map((item) => (
                <button type="button" key={item} onClick={() => setMessage(`${item} section selected.`)}>
                  <Check size={15} /> {item}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
