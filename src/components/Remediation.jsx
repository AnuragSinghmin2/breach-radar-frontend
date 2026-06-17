import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { vulnerabilityApi } from "../services/api";
import { severityTone } from "../utils/format";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  Code2,
  FileCheck,
  Filter,
  Globe,
  Link2,
  MoreVertical,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  Target,
  Users,
  Wrench,
  X,
} from "lucide-react";
import "./Remediation.css";

const recommendedActions = [
  "Use parameterized queries",
  "Validate user input",
  "Implement input allowlisting",
  "Use ORM or query builder",
  "Enable WAF rules",
];

const resources = [
  ["Remediation Guide", "Best practices and guidelines", BookOpen],
  ["Secure Code Examples", "View secure code examples", Code2],
  ["OWASP Top 10", "Learn about OWASP Top 10", ShieldCheck],
];

const severityMeta = {
  Critical: { priority: "High", eta: "2-4 hours", effort: "High", icon: ShieldX },
  High: { priority: "High", eta: "1-2 hours", effort: "Medium", icon: Code2 },
  Medium: { priority: "Medium", eta: "1 hour", effort: "Medium", icon: ShieldCheck },
  Low: { priority: "Low", eta: "30-60 min", effort: "Low", icon: Globe },
};

function mapVulnerabilityToIssue(item) {
  const meta = severityMeta[item.severity] || severityMeta.Low;
  return {
    id: item._id,
    title: item.name || "Untitled vulnerability",
    text: item.desc || "No description available",
    code: item.cwe || "CWE-N/A",
    severity: item.severity || "Low",
    asset: item.domainId?.domain || "",
    path: item.path || "/",
    status: item.status || "Open",
    priority: meta.priority,
    icon: item.name?.toLowerCase().includes("idor") ? Link2 : meta.icon,
    tone: item.tone || severityTone(item.severity),
    eta: meta.eta,
    effort: meta.effort,
    impact: item.impact || "Impact details are not available for this finding.",
    fix: item.fix || "Follow secure coding guidance and verify the remediation with a new scan.",
  };
}

function Pill({ tone, children }) {
  return <span className={`rem-pill ${tone}`}>{children}</span>;
}

function IssueIcon({ issue }) {
  const Icon = issue.icon;
  return (
    <span className={`rem-issue-icon ${issue.tone}`}>
      <Icon size={25} />
    </span>
  );
}

function StatusSelect({ status, onClick }) {
  const tone = status === "Resolved" ? "resolved" : status === "In Progress" ? "progress" : "open";
  return (
    <button className={`rem-status-select ${tone}`} type="button" onClick={onClick}>
      {status} <ChevronDown size={14} />
    </button>
  );
}

export default function Remediation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vulnerabilities: contextVulnerabilities, loading: contextLoading, refreshDomains, refreshStats } =
    useDashboard();
  const initialIssue = searchParams.get("issue");
  const [selectedId, setSelectedId] = useState("");
  const [tab, setTab] = useState("All Issues");
  const [severityFilter, setSeverityFilter] = useState("All Severity");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [activeMenu, setActiveMenu] = useState("");
  const [completedActions, setCompletedActions] = useState(["Use parameterized queries"]);

  const contextIssues = useMemo(
    () => contextVulnerabilities.map(mapVulnerabilityToIssue),
    [contextVulnerabilities]
  );
  const issues = contextIssues;
  const selected = useMemo(
    () => {
      if (selectedId === "__closed__") return null;

      return (
        issues.find((issue) => issue.id === selectedId) ||
        issues.find((issue) => issue.title === initialIssue) ||
        issues[0] ||
        null
      );
    },
    [initialIssue, issues, selectedId]
  );
  const loading = contextLoading;

  const stats = useMemo(() => {
    const total = issues.length;
    const progress = issues.filter((issue) => issue.status === "In Progress").length;
    const resolved = issues.filter((issue) => issue.status === "Resolved").length;
    const fixable = issues.filter((issue) => issue.status !== "Resolved").length;
    const riskReduction = total ? Math.round((resolved / total) * 100) : 0;

    return [
      { label: "Total Vulnerabilities", value: total, detail: "from current scan data", tone: "critical", icon: ShieldX, trend: "up", filter: "All Issues" },
      { label: "Fixable", value: fixable, detail: `${total ? Math.round((fixable / total) * 100) : 0}% of total`, tone: "fixable", icon: Wrench, filter: "Fixable" },
      { label: "In Progress", value: progress, detail: `${total ? Math.round((progress / total) * 100) : 0}% of total`, tone: "progress", icon: Target, filter: "In Progress" },
      { label: "Resolved", value: resolved, detail: `${riskReduction}% of total`, tone: "resolved", icon: CheckCircle, filter: "Resolved" },
      { label: "Risk Reduction", value: `${riskReduction}%`, detail: "based on resolved findings", tone: "risk", icon: Shield, filter: "Resolved" },
    ];
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return issues.filter((issue) => {
      const matchesTab =
        tab === "All Issues" ||
        (tab === "Fixable" && issue.status !== "Resolved") ||
        issue.status === tab;
      const matchesSeverity = severityFilter === "All Severity" || issue.severity === severityFilter;
      const matchesQuery =
        issue.title.toLowerCase().includes(cleanQuery) ||
        issue.asset.toLowerCase().includes(cleanQuery) ||
        issue.code.toLowerCase().includes(cleanQuery) ||
        issue.text.toLowerCase().includes(cleanQuery);
      return matchesTab && matchesSeverity && matchesQuery;
    });
  }, [issues, query, severityFilter, tab]);

  async function updateStatus(target, status) {
    try {
      await vulnerabilityApi.updateVulnerabilityStatus(target.id, status);
      setActiveMenu("");
      setMessage(`${target.title} marked as ${status}.`);
      await Promise.all([refreshDomains(), refreshStats()]);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update vulnerability status.");
    }
  }

  function cycleSeverity() {
    const options = ["All Severity", "Critical", "High", "Medium", "Low"];
    setSeverityFilter(options[(options.indexOf(severityFilter) + 1) % options.length]);
  }

  function toggleRecommended(action) {
    setCompletedActions((current) =>
      current.includes(action) ? current.filter((item) => item !== action) : [...current, action]
    );
  }

  function exportPlan() {
    if (!selected) return;

    const text = [
      "SecureScan Remediation Plan",
      `Selected Issue: ${selected.title}`,
      `Asset: ${selected.asset}${selected.path}`,
      `Status: ${selected.status}`,
      `Priority: ${selected.priority}`,
      "",
      "Recommended Actions:",
      ...recommendedActions.map((action) => `- ${action}`),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "remediation-plan.txt";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Remediation plan exported.");
  }

  return (
    <section className="rem-page">
      <div className="rem-stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <button className="rem-stat-card" type="button" key={item.label} onClick={() => setTab(item.filter)}>
              <span className={`rem-stat-icon ${item.tone}`}>
                <Icon size={31} />
              </span>
              <div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <small className={item.trend === "up" ? "bad" : "good"}>
                  {item.trend === "up" ? <ArrowUp size={13} /> : item.label === "Risk Reduction" ? <ArrowUp size={13} /> : null}
                  {item.detail}
                </small>
              </div>
            </button>
          );
        })}
      </div>

      {message && <div className="rem-message">{message}</div>}
      {loading && <div className="rem-message">Loading remediation data...</div>}

      <div className="rem-layout-grid">
        <div className="rem-main-column">
          <section className="rem-panel rem-issues-panel">
            <div className="rem-issues-toolbar">
              <div className="rem-tabs">
                {["All Issues", "Fixable", "In Progress", "Resolved", "Ignored"].map((item) => (
                  <button className={tab === item ? "active" : ""} key={item} type="button" onClick={() => setTab(item)}>
                    {item}
                  </button>
                ))}
              </div>

              <div className="rem-controls">
                <button type="button" onClick={cycleSeverity}>
                  <Filter size={15} /> {severityFilter} <ChevronDown size={14} />
                </button>
                <label>
                  <Search size={16} />
                  <input placeholder="Search vulnerabilities..." value={query} onChange={(event) => setQuery(event.target.value)} />
                </label>
              </div>
            </div>

            <div className="rem-table-wrap">
              <div className="rem-issue-table">
                <div className="rem-issue-row rem-head">
                  <span>Vulnerability</span><span>Severity</span><span>Affected Asset</span><span>Status</span><span>Fix Priority</span><span>Actions</span>
                </div>

                {filteredIssues.map((issue) => (
                  <div className="rem-issue-row" key={issue.id}>
                    <button className="rem-vuln-cell" type="button" onClick={() => setSelectedId(issue.id)}>
                      <IssueIcon issue={issue} />
                      <strong>{issue.title}<small>{issue.text} <em>{issue.code}</em></small></strong>
                    </button>
                    <button className="rem-plain-btn" type="button" onClick={() => setSeverityFilter(issue.severity)}>
                      <Pill tone={issue.severity.toLowerCase()}>{issue.severity}</Pill>
                    </button>
                    <button className="rem-asset-cell" type="button" onClick={() => navigate(`/dashboard/domains?domain=${issue.asset}`)}>
                      <Globe size={18} />
                      <strong>{issue.asset}<small>{issue.path}</small></strong>
                    </button>
                    <StatusSelect status={issue.status} onClick={() => updateStatus(issue, issue.status === "Open" ? "In Progress" : issue.status === "In Progress" ? "Resolved" : "Open")} />
                    <span className={`rem-priority ${issue.priority.toLowerCase()}`}>
                      {issue.priority === "High" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {issue.priority}
                    </span>
                    <div className="rem-actions">
                      <button type="button" onClick={() => setSelectedId(issue.id)}>View Details</button>
                      <button aria-label="More actions" type="button" onClick={() => setActiveMenu(activeMenu === issue.id ? "" : issue.id)}>
                        <MoreVertical size={16} />
                      </button>
                      {activeMenu === issue.id && (
                        <div className="rem-row-menu">
                          <button type="button" onClick={() => updateStatus(issue, "In Progress")}>Start Fix</button>
                          <button type="button" onClick={() => updateStatus(issue, "Resolved")}>Mark Resolved</button>
                          <button type="button" onClick={() => navigate(`/dashboard/vulnerabilities?domain=${issue.asset}`)}>Open Finding</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredIssues.length === 0 && <div className="rem-empty">No remediation items match your filters.</div>}
              </div>
            </div>

            <div className="rem-pagination">
              <p>Showing {filteredIssues.length ? 1 : 0} to {filteredIssues.length} of {issues.length} vulnerabilities</p>
              <div>
                <button type="button" disabled><ChevronLeft size={16} /></button>
                <button className="active" type="button">1</button>
                <button type="button" disabled><ChevronRight size={16} /></button>
              </div>
            </div>
          </section>

          {selected && (
            <section className="rem-panel rem-detail-panel">
              <div className="rem-detail-head">
                <div className="rem-detail-title">
                  <Pill tone={selected.severity.toLowerCase()}>{selected.severity}</Pill>
                  <h3>{selected.title}</h3>
                  <span>{selected.code}</span>
                  <p>{selected.text} affects {selected.asset}{selected.path}.</p>
                </div>
                <div className="rem-detail-actions">
                  <button type="button" onClick={() => updateStatus(selected, "In Progress")}>Mark as In Progress</button>
                  <button type="button" onClick={() => updateStatus(selected, "Resolved")}>Mark as Resolved</button>
                  <button aria-label="Export plan" type="button" onClick={exportPlan}><ChevronsUp size={16} /></button>
                  <button aria-label="Close" type="button" onClick={() => setSelectedId("__closed__")}><X size={16} /></button>
                </div>
              </div>

              <div className="rem-detail-tabs">
                {["Details", "Impact", "Solution", "References", "Activity"].map((item) => (
                  <button className={item === "Solution" ? "active" : ""} key={item} type="button" onClick={() => setMessage(`${item} content selected for ${selected.title}.`)}>
                    {item}
                  </button>
                ))}
              </div>

              <div className="rem-solution-grid">
                <div>
                  <h4>How to Fix</h4>
                  <p>{selected.fix}</p>
                  <pre>{`// Vulnerable Code
$sql = "SELECT * FROM users WHERE username = '" . $_POST['username'] . "'";

// Secure Code
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
$stmt->bindParam(':username', $_POST['username']);
$stmt->execute();`}</pre>
                </div>

                <div className="rem-recommended">
                  <h4>Recommended Actions</h4>
                  {recommendedActions.map((action) => (
                    <button className={completedActions.includes(action) ? "done" : ""} type="button" key={action} onClick={() => toggleRecommended(action)}>
                      <CheckCircle size={16} /> {action}
                    </button>
                  ))}
                  <div className="rem-meta-row">
                    <span>Effort <b>{selected.effort}</b></span>
                    <span>ETA <b>{selected.eta}</b></span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="rem-side-column">
          <section className="rem-panel rem-summary-panel">
            <h3>Remediation Summary</h3>
            <div className="rem-summary-body">
              <div className="rem-risk-donut">
                <strong>{issues.length}</strong>
                <span>Total</span>
              </div>
              <div className="rem-legend">
                {["Critical", "High", "Medium", "Low"].map((severity) => {
                  const count = issues.filter((issue) => issue.severity === severity).length;
                  const percent = issues.length ? ((count / issues.length) * 100).toFixed(1) : "0.0";
                  return (
                    <button type="button" key={severity} onClick={() => setSeverityFilter(severity)}>
                      <i className={severity.toLowerCase()} /> {severity} <span>{count} ({percent}%)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rem-risk-bar">
              <p>Top Risk Reduction <strong>{stats[4].value}</strong></p>
              <span><i style={{ width: stats[4].value }} /></span>
            </div>
          </section>

          <section className="rem-panel rem-list-panel">
            <h3>Quick Actions</h3>
            {[
              ["Create Remediation Plan", "Generate a plan to fix vulnerabilities", FileCheck, exportPlan],
              ["Assign to Team", "Assign selected vulnerability to team", Users, () => setMessage(`${selected?.title || "Issue"} assigned to AppSec team.`)],
              ["Track Progress", "Monitor remediation progress", Target, () => setTab("In Progress")],
            ].map(([title, text, Icon, action]) => (
              <button type="button" key={title} onClick={action}>
                <span><Icon size={21} /></span>
                <strong>{title}<small>{text}</small></strong>
                <ChevronRight size={20} />
              </button>
            ))}
          </section>

          <section className="rem-panel rem-list-panel rem-resource-panel">
            <h3>Remediation Resources</h3>
            {resources.map(([title, text, Icon]) => (
              <button type="button" key={title} onClick={() => setMessage(`${title} opened.`)}>
                <span><Icon size={20} /></span>
                <strong>{title}<small>{text}</small></strong>
              </button>
            ))}
            <button className="rem-resource-cta" type="button" onClick={() => setMessage("All remediation resources selected.")}>
              View All Resources <ArrowRight size={15} />
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}
