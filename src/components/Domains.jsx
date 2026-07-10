import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { domainApi, scanApi } from "../services/api";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Filter,
  Globe2,
  Search,
  ShieldCheck,
  ShieldPlus,
  Target,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Pencil,
  PlayCircle,
  Trash2,
  X,
} from "lucide-react";
import "./Domains.css";

const severityLabels = [
  ["critical", "Critical"],
  ["high", "High"],
  ["medium", "Medium"],
  ["low", "Low"],
];

const statusOptions = ["All Status", "Active", "Needs Attention"];
const DOMAINS_PER_PAGE = 8;

function totalVulnerabilities(item) {
  return Object.values(item.vulnerabilities).reduce((sum, value) => sum + value, 0);
}

function ScoreRing({ value, tone }) {
  return (
    <div
      className={`domain-score-ring ${tone === "attention" ? "warning" : ""}`}
      style={{ "--score": value }}
      aria-label={`Security score ${value} out of 100`}
    >
      <strong>{value}</strong>
      <span>/100</span>
    </div>
  );
}

export default function Domains() {
  const navigate = useNavigate();
  const { domains, stats: dashboardStats, loading, refreshDomains, refreshScans, refreshStats } =
    useDashboard();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    function scrollToHash() {
      if (window.location.hash === "#add-domain") {
        const element = document.getElementById("add-domain");
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
            const input = element.querySelector("input");
            if (input) input.focus();
          }, 150);
        }
      }
    }

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  // Verification modal states
  const [verifyModalDomain, setVerifyModalDomain] = useState(null);
  const [verifyTab, setVerifyTab] = useState("dns"); // "dns" or "html"
  const [verificationInstructions, setVerificationInstructions] = useState(null);
  const [copiedField, setCopiedField] = useState(""); // "host", "value", "filename", "content"
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const stats = useMemo(() => {
    const active = domains.filter((item) => item.status === "Active").length;
    const vulnerabilities = domains.reduce((sum, item) => sum + totalVulnerabilities(item), 0);

    return [
      {
        label: "Total Domains",
        value: dashboardStats.totalDomains || domains.length,
        detail: "in workspace",
        icon: Globe2,
        tone: "blue",
        action: () => {
          setStatusFilter("All Status");
          setCriticalOnly(false);
        },
      },
      {
        label: "Active Domains",
        value: active,
        detail: domains.length
          ? `${Math.round((active / domains.length) * 100)}% of total domains`
          : "0% of total domains",
        icon: ShieldCheck,
        tone: "green",
        action: () => setStatusFilter("Active"),
      },
      {
        label: "Vulnerabilities Found",
        value: vulnerabilities,
        detail: "open findings",
        icon: ShieldPlus,
        tone: "red",
        action: () => setCriticalOnly(true),
      },
      {
        label: "Total Scans",
        value: dashboardStats.totalScans,
        detail: "all time",
        icon: Target,
        tone: "purple",
        action: () => navigate("/dashboard/scans"),
      },
    ];
  }, [dashboardStats.totalDomains, dashboardStats.totalScans, domains, navigate]);

  const filteredDomains = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return domains.filter((item) => {
      const matchesQuery = item.domain.toLowerCase().includes(cleanQuery);
      const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;
      const matchesCritical = !criticalOnly || item.vulnerabilities.critical > 0;

      return matchesQuery && matchesStatus && matchesCritical;
    });
  }, [criticalOnly, domains, query, statusFilter]);

  const totalDomains = filteredDomains.length;
  const totalPages = Math.max(1, Math.ceil(totalDomains / DOMAINS_PER_PAGE));
  const paginatedDomains = useMemo(() => {
    const start = (currentPage - 1) * DOMAINS_PER_PAGE;
    return filteredDomains.slice(start, start + DOMAINS_PER_PAGE);
  }, [currentPage, filteredDomains]);

  useEffect(() => {
    setCurrentPage(1);
    setActiveMenu("");
  }, [query, statusFilter, criticalOnly]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startDomain = totalDomains === 0 ? 0 : (currentPage - 1) * DOMAINS_PER_PAGE + 1;
  const endDomain = Math.min(currentPage * DOMAINS_PER_PAGE, totalDomains);

  function cycleStatusFilter() {
    const nextIndex = (statusOptions.indexOf(statusFilter) + 1) % statusOptions.length;
    setStatusFilter(statusOptions[nextIndex]);
  }

  async function scanDomain(domain) {
    try {
      await scanApi.startScan({ domain, scanType: "Full Scan" });
      setMessage(`Scan queued for ${domain}.`);
      await Promise.all([refreshScans(), refreshStats(), refreshDomains()]);
      navigate(`/dashboard/scans?domain=${encodeURIComponent(domain)}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to start scan.");
    }
  }

  async function addDomain(event) {
    event.preventDefault();
    const value = newDomain.trim().toLowerCase();

    if (!value) {
      setMessage("Domain name required.");
      return;
    }

    try {
      const added = await domainApi.addDomain({ domain: value });
      setNewDomain("");
      setMessage(`${value} added successfully. Please verify ownership to start scanning.`);
      await Promise.all([refreshDomains(), refreshStats()]);
      // Open verification modal automatically
      openVerification(added);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add domain.");
    }
  }

  async function editDomain(domainItem) {
    const value = window.prompt("Edit domain", domainItem.domain)?.trim().toLowerCase();

    if (!value || value === domainItem.domain) {
      setActiveMenu("");
      return;
    }

    try {
      await domainApi.updateDomain(domainItem._id, { domain: value, tag: domainItem.tag });
      await Promise.all([refreshDomains(), refreshStats()]);
      setActiveMenu("");
      setMessage(`${domainItem.domain} updated to ${value}.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update domain.");
    }
  }

  async function deleteDomain(domainItem) {
    if (!window.confirm(`Delete ${domainItem.domain}? This cannot be undone.`)) {
      setActiveMenu("");
      return;
    }

    try {
      await domainApi.deleteDomain(domainItem._id);
      await Promise.all([refreshDomains(), refreshStats()]);
      setActiveMenu("");
      setMessage(`${domainItem.domain} deleted.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete domain.");
    }
  }

  async function openVerification(domainItem) {
    setVerifyModalDomain(domainItem);
    setVerifyError("");
    setVerifyTab("dns");
    try {
      const instructions = await domainApi.getVerificationInstructions(domainItem._id);
      setVerificationInstructions(instructions);
    } catch {
      setVerifyError("Failed to fetch verification setup instructions.");
    }
  }

  function handleCopy(text, field) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  }

  async function performVerification(bypass = false) {
    if (!verifyModalDomain) return;
    setVerifying(true);
    setVerifyError("");
    try {
      if (verifyTab === "dns") {
        await domainApi.verifyDomainDns(verifyModalDomain._id, bypass);
      } else {
        await domainApi.verifyDomainHtml(verifyModalDomain._id, bypass);
      }
      setMessage(`Domain ${verifyModalDomain.domain} verified successfully!`);
      setVerifyModalDomain(null);
      await Promise.all([refreshDomains(), refreshStats()]);
    } catch (error) {
      setVerifyError(error.response?.data?.message || "Verification failed. Please check records and try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section className="domains-page">
      <div className="domain-stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <button className="domain-stat-card" type="button" onClick={item.action} key={item.label}>
              <div className={`domain-stat-icon ${item.tone}`}>
                <Icon size={30} strokeWidth={2.2} />
              </div>
              <div className="domain-stat-copy">
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <span>
                  {item.detail}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {loading && <div className="domains-message">Loading domains...</div>}
      {message && <div className="domains-message">{message}</div>}
       <section className="domains-upgrade" id="add-domain">
        <div className="upgrade-copy">
          <span className="upgrade-icon">
            <ShieldCheck size={34} />
          </span>
          <div>
            <h3>Add More Domains</h3>
            <p>Monitor more domains and enhance your security coverage.</p>
          </div>
        </div>
        <form className="domain-add-form" onSubmit={addDomain}>
          <input
            type="text"
            placeholder="newdomain.com"
            value={newDomain}
            onChange={(event) => setNewDomain(event.target.value)}
          />
          <button className="outline" type="button" onClick={() => navigate("/dashboard/settings/plan-billing")}>
            Upgrade Plan
          </button>
          <button className="primary" type="submit">
            Add Domain
          </button>
        </form>
      </section>

      <section className="domains-panel">
        <div className="domains-panel-header">
          <h3>All Domains</h3>
          <div className="domain-controls">
            <label className="domain-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search domains..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button className="domain-select" type="button" onClick={cycleStatusFilter}>
              {statusFilter}
              <ChevronDown size={14} />
            </button>
            <button
              className={`domain-filter ${criticalOnly ? "active" : ""}`}
              type="button"
              onClick={() => setCriticalOnly((enabled) => !enabled)}
            >
              <Filter size={16} />
              {criticalOnly ? "Critical Only" : "Filters"}
            </button>
          </div>
        </div>

        <div className="domains-table-wrap">
          <table className="domains-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Status</th>
                <th>Security Score</th>
                <th>Vulnerabilities</th>
                <th className="domain-actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDomains.map((item, index) => (
                <tr key={item.domain}>
                  <td>
                    <div className="domain-name-cell">
                      <button
                        className="domain-name-button"
                        type="button"
                        onClick={() => navigate(`/dashboard/reports?domain=${encodeURIComponent(item.domain)}`)}
                      >
                        <span className={`domain-row-icon ${item.iconTone}`}>
                          <Globe2 size={23} />
                        </span>
                        <span className="domain-name-copy">
                          <strong title={item.domain}>
                            <span>{item.domain}</span>
                            {item.tag && <em>{item.tag}</em>}
                          </strong>
                          <small>{item.added}</small>
                        </span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className={`domain-status ${item.status === "Needs Attention" ? "warning" : item.status === "Inactive" ? "inactive-row" : ""}`}>
                      <span>
                        <i className={item.verificationStatus !== "verified" ? "pending-dot" : ""} />
                        {item.verificationStatus !== "verified" ? "Pending Verification" : item.status}
                      </span>
                      <small>{item.statusDetail}</small>
                    </div>
                  </td>
                  <td>
                    <div className="domain-score-cell">
                      <ScoreRing value={item.score} tone={item.scoreTone} />
                      <span className={`score-label ${item.scoreTone}`}>
                        {item.scoreLabel}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="severity-list">
                      {severityLabels.map(([key, label]) => (
                        <button
                          className="severity-item"
                          type="button"
                          key={key}
                          onClick={() => navigate(`/dashboard/vulnerabilities?domain=${item.domain}&severity=${key}`)}
                        >
                          <b className={key}>{item.vulnerabilities[key]}</b>
                          <small>{label}</small>
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="domain-actions">
                      <button
                        className="domain-menu-trigger"
                        type="button"
                        aria-label={`More actions for ${item.domain}`}
                        aria-expanded={activeMenu === item.domain}
                        onClick={() =>
                          setActiveMenu((current) => (current === item.domain ? "" : item.domain))
                        }
                      >
                        <EllipsisVertical size={19} />
                      </button>
                      {activeMenu === item.domain && (
                        <div className={`domain-row-menu ${index >= paginatedDomains.length - 2 ? "open-up" : ""}`}>
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/domains?domain=${encodeURIComponent(item.domain)}`)}
                          >
                            <Globe2 size={15} />
                            <span>View Details</span>
                          </button>
                          <button type="button" onClick={() => scanDomain(item.domain)}>
                            <PlayCircle size={15} />
                            <span>Scan Now</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/reports?domain=${encodeURIComponent(item.domain)}`)}
                          >
                            <FileText size={15} />
                            <span>View Reports</span>
                          </button>
                          <button type="button" onClick={() => editDomain(item)}>
                            <Pencil size={15} />
                            <span>Edit Domain</span>
                          </button>
                          <button className="danger" type="button" onClick={() => deleteDomain(item)}>
                            <Trash2 size={15} />
                            <span>Delete Domain</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDomains.length === 0 && (
                <tr>
                  <td className="domains-empty" colSpan="5">
                    No scan data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="domains-pagination">
          <span>
            Showing {startDomain} to {endDomain} of {totalDomains} domains
          </span>
          <div>
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((page) => Math.max(1, page - 1));
                setActiveMenu("");
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button className="active" type="button">
              {currentPage}
            </button>
            <span>of {totalPages}</span>
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((page) => Math.min(totalPages, page + 1));
                setActiveMenu("");
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>


      {/* Premium Verification Modal */}
      {verifyModalDomain && (
        <div className="modal-overlay">
          <div className="verification-modal">
            <div className="modal-header">
              <h3>Verify Domain Ownership</h3>
              <button className="modal-close" onClick={() => setVerifyModalDomain(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                To prevent unauthorized scanning of public targets, please verify that you control <strong>{verifyModalDomain.domain}</strong>.
              </p>

              <div className="verify-tabs-nav">
                <button
                  className={`verify-tab-btn ${verifyTab === "dns" ? "active" : ""}`}
                  onClick={() => setVerifyTab("dns")}
                >
                  DNS TXT Record
                </button>
                <button
                  className={`verify-tab-btn ${verifyTab === "html" ? "active" : ""}`}
                  onClick={() => setVerifyTab("html")}
                >
                  HTML File Upload
                </button>
              </div>

              {verifyError && (
                <div className="modal-error-banner">
                  <AlertCircle size={18} />
                  <span>{verifyError}</span>
                </div>
              )}

              {verificationInstructions ? (
                verifyTab === "dns" ? (
                  <div className="verify-tab-content">
                    <div className="instruction-step">
                      <label>1. Record Type</label>
                      <div className="code-copy-box">
                        <code>TXT</code>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <label>2. Host / Name</label>
                      <div className="code-copy-box">
                        <code>{verificationInstructions.dns.host}</code>
                        <button
                          className={`copy-btn ${copiedField === "host" ? "copied" : ""}`}
                          onClick={() => handleCopy(verificationInstructions.dns.host, "host")}
                        >
                          {copiedField === "host" ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <label>3. TXT Value</label>
                      <div className="code-copy-box">
                        <code>{verificationInstructions.dns.value}</code>
                        <button
                          className={`copy-btn ${copiedField === "value" ? "copied" : ""}`}
                          onClick={() => handleCopy(verificationInstructions.dns.value, "value")}
                        >
                          {copiedField === "value" ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="instruction-note">
                      Note: DNS changes can take up to 24 hours to propagate, although they are usually active within a few minutes.
                    </div>
                  </div>
                ) : (
                  <div className="verify-tab-content">
                    <div className="instruction-step">
                      <label>1. File Name</label>
                      <div className="code-copy-box">
                        <code>{verificationInstructions.html.filename}</code>
                        <button
                          className={`copy-btn ${copiedField === "filename" ? "copied" : ""}`}
                          onClick={() => handleCopy(verificationInstructions.html.filename, "filename")}
                        >
                          {copiedField === "filename" ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <label>2. File Content</label>
                      <div className="code-copy-box">
                        <code>{verificationInstructions.html.content}</code>
                        <button
                          className={`copy-btn ${copiedField === "content" ? "copied" : ""}`}
                          onClick={() => handleCopy(verificationInstructions.html.content, "content")}
                        >
                          {copiedField === "content" ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <label>3. Target Paths</label>
                      <div className="code-copy-box">
                        <code>{verificationInstructions.html.paths.join(" or ")}</code>
                      </div>
                    </div>
                    <div className="instruction-note">
                      Upload the file to the root of your web server and verify that it resolves directly.
                    </div>
                  </div>
                )
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>Loading instructions...</div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="verify-bypass-btn"
                onClick={() => performVerification(true)}
                disabled={verifying}
              >
                Bypass Verification (Dev Mode)
              </button>
              <button
                className="verify-action-btn"
                onClick={() => performVerification(false)}
                disabled={verifying || !verificationInstructions}
              >
                {verifying ? "Verifying..." : "Verify Ownership"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
