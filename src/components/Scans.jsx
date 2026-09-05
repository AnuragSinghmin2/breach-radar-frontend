import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  History,
  Info,
  ListChecks,
  Loader2,
  Radar,
  Shield,
  ShieldCheck,
  Siren,
  Timer,
  X,
} from "lucide-react";
import { SCAN_TYPE_META, SCAN_STATUS, useScans } from "../modules/scan";
import "./Scans.css";

const steps = [
  ["Select Domain", "Choose a domain to scan"],
  ["Scan Type", "Choose scan type"],
  ["Configuration", "Configure scan options"],
  ["Review & Start", "Review and start scan"],
];

const checkLabels = {
  owasp: "OWASP Top 10",
  ssl: "SSL/TLS Checks",
  headers: "Security Headers",
  ports: "Port Exposure",
  malware: "Malware Signals",
  compliance: "Compliance Audits",
  businessLogic: "Business Logic Checks",
  apiSecurity: "API Security (BOLA)",
  cloudInfrastructure: "Exposed Admin Panels",
  fileUpload: "File Upload Checks",
};

const SCAN_HISTORY_PAGE_SIZE = 10;

function Badge({ children, tone }) {
  return <span className={`scans-badge ${tone}`}>{children}</span>;
}

function getVisiblePages(currentPage, totalPages) {
  const maxVisible = 5;
  const halfWindow = Math.floor(maxVisible / 2);
  const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - maxVisible + 1));
  const end = Math.min(totalPages, start + maxVisible - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function ScanStatusPanel({ scan, formatScanTime, onNewScan }) {
  if (!scan) return null;

  const isRunning =
    scan.status === SCAN_STATUS.QUEUED || scan.status === SCAN_STATUS.IN_PROGRESS;

  const [progress, setProgress] = useState(() => {
    if (scan.status === SCAN_STATUS.COMPLETED) return 100;
    if (typeof scan.progress === 'number' && scan.progress > 0) return scan.progress;
    return 12;
  });

  useEffect(() => {
    if (!isRunning) {
      if (scan.status === SCAN_STATUS.COMPLETED) setProgress(100);
      return;
    }

    if (typeof scan.progress === 'number' && scan.progress > 0) {
      setProgress(scan.progress);
    }

    const startTime = new Date(scan.startedAt || scan.createdAt || Date.now()).getTime();

    const timer = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      const isQuick = scan.scanType === "Quick Scan";
      const targetSec = isQuick ? 22 : 38;
      const ratio = Math.min(elapsedSec / targetSec, 1);
      // Smooth logarithmic curve from 12% up to 96%
      const calculated = Math.min(96, Math.floor(12 + 84 * Math.sqrt(ratio)));
      setProgress((prev) => Math.max(prev, calculated));
    }, 350);

    return () => clearInterval(timer);
  }, [isRunning, scan.status, scan.startedAt, scan.createdAt, scan.scanType, scan.progress]);

  const getPhaseDetails = (pct) => {
    if (pct < 25) {
      return "Initializing scanner containers, DNS resolution, and SSL handshake inspection...";
    }
    if (pct < 50) {
      return "Running OWASP Top 10 checks, SSL/TLS certificates, security headers, and port sweep...";
    }
    if (pct < 75) {
      return "Probing web logic, authentication policies, API security, and injection vectors...";
    }
    if (pct < 95) {
      return "Aggregating vulnerability findings, calculating CVSS risk score, and compiling evidence...";
    }
    return "Finalizing security audit report and preparing remediation workflow...";
  };

  return (
    <section className="scans-panel scans-status-panel">
      <div className="scans-section-head">
        <h3>Scan Status</h3>
        <Badge tone={isRunning ? "blue" : scan.status === SCAN_STATUS.COMPLETED ? "green" : "red"}>
          {isRunning && <Loader2 size={12} className="scans-spin" />}
          {scan.status}
        </Badge>
      </div>

      <div className="scans-status-grid">
        <div>
          <small>Domain</small>
          <strong>{scan.domain}</strong>
        </div>
        <div>
          <small>Scan Type</small>
          <strong>{scan.scanType}</strong>
        </div>
        <div>
          <small>Started</small>
          <strong>{formatScanTime(scan.startedAt || scan.createdAt)}</strong>
        </div>
        <div>
          <small>Risk Score</small>
          <strong>{scan.status === SCAN_STATUS.COMPLETED ? scan.riskScore : "—"}</strong>
        </div>
      </div>

      {isRunning && (
        <div className="scan-progress-container">
          <div className="scan-progress-header">
            <div className="scan-progress-label">
              <Radar className="scan-radar-spinning" size={16} />
              <span>Scan in progress...</span>
            </div>
            <span className="scan-progress-percentage">{progress}%</span>
          </div>
          <div className="scan-progress-bar-bg">
            <div
              className="scan-progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="scan-status-details">
            <Activity className="scan-details-icon" size={14} />
            <span>{getPhaseDetails(progress)}</span>
          </div>
        </div>
      )}

      {scan.status === SCAN_STATUS.COMPLETED && (
        <div className="scans-status-findings">
          <span className="critical">{scan.vulnerabilitiesCount.critical} Critical</span>
          <span className="high">{scan.vulnerabilitiesCount.high} High</span>
          <span className="medium">{scan.vulnerabilitiesCount.medium} Medium</span>
          <span className="low">{scan.vulnerabilitiesCount.low} Low</span>
        </div>
      )}

      {scan.errorDetail && <p className="scans-status-error">{scan.errorDetail}</p>}

      {(scan.status === SCAN_STATUS.COMPLETED || scan.status === SCAN_STATUS.FAILED) && onNewScan && (
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button className="scans-secondary-btn" style={{ margin: 0, height: "34px" }} onClick={onNewScan}>
            Start New Scan
          </button>
        </div>
      )}
    </section>
  );
}

export default function Scans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    scans,
    filteredHistory,
    vulnerabilities,
    statusFilter,
    setStatusFilter,
    message,
    activeScan,
    activeScans,
    stats,
    domains,
    startScan,
    scheduleScan,
    rerun,
    formatScanTime,
    toneForStatus,
    error,
    loading,
    setMessage,
    setActiveScanId,
  } = useScans();

  const [showWizard, setShowWizard] = useState(false);

  const [selectedDomain, setSelectedDomain] = useState(searchParams.get("domain") || "");
  const [selectedType, setSelectedType] = useState("Full Scan");
  const [activeStep, setActiveStep] = useState(0);
  const [openMenu, setOpenMenu] = useState("");
  const [scanHistoryPage, setScanHistoryPage] = useState(1);
  const [checks, setChecks] = useState({
    owasp: true,
    ssl: true,
    headers: true,
    ports: false,
    malware: true,
    compliance: false,
    businessLogic: true,
    apiSecurity: true,
    cloudInfrastructure: true,
    fileUpload: true,
  });

  const selectedScan = SCAN_TYPE_META[selectedType];
  const canStartScan = Boolean(selectedDomain);
  const enabledChecksCount = Object.values(checks).filter(Boolean).length;
  const stepValidation = [
    Boolean(selectedDomain),
    Boolean(selectedType),
    enabledChecksCount > 0,
    Boolean(selectedDomain && selectedType && enabledChecksCount > 0),
  ];
  const canContinue = stepValidation[activeStep];
  const progressPercent = (activeStep / (steps.length - 1)) * 100;
  const scanHistoryTotalPages = Math.max(
    1,
    Math.ceil(filteredHistory.length / SCAN_HISTORY_PAGE_SIZE)
  );
  const paginatedHistory = useMemo(() => {
    const start = (scanHistoryPage - 1) * SCAN_HISTORY_PAGE_SIZE;
    return filteredHistory.slice(start, start + SCAN_HISTORY_PAGE_SIZE);
  }, [filteredHistory, scanHistoryPage]);
  const scanHistoryPages = useMemo(
    () => getVisiblePages(scanHistoryPage, scanHistoryTotalPages),
    [scanHistoryPage, scanHistoryTotalPages]
  );
  const showScanHistoryPagination = filteredHistory.length > SCAN_HISTORY_PAGE_SIZE;

  useEffect(() => {
    const paramDomain = searchParams.get("domain");
    if (paramDomain && domains.includes(paramDomain)) {
      setSelectedDomain(paramDomain);
      setShowWizard(true);
      setActiveStep(0);
      navigate("/dashboard/scans", { replace: true });
      return;
    }
    if (selectedDomain && !domains.includes(selectedDomain)) {
      setSelectedDomain(domains[0] || "");
      return;
    }
    if (!selectedDomain && domains.length > 0) {
      setSelectedDomain(domains[0]);
    }
  }, [domains, searchParams, selectedDomain, navigate]);

  useEffect(() => {
    setScanHistoryPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (scanHistoryPage > scanHistoryTotalPages) {
      setScanHistoryPage(scanHistoryTotalPages);
    }
  }, [scanHistoryPage, scanHistoryTotalPages]);

  const statCards = useMemo(
    () => [
      {
        label: "Total Scans",
        value: stats.total,
        detail: "all time",
        icon: Activity,
        tone: "green",
        filter: "All",
      },
      {
        label: "Completed Scans",
        value: stats.completed,
        detail: `${stats.successRate}% success rate`,
        icon: Check,
        tone: "blue",
        filter: SCAN_STATUS.COMPLETED,
      },
      {
        label: "In Progress",
        value: stats.running,
        detail: "currently running",
        icon: Clock3,
        tone: "orange",
        filter: SCAN_STATUS.IN_PROGRESS,
      },
      {
        label: "Failed Scans",
        value: stats.failed,
        detail: stats.total ? `${Math.round((stats.failed / stats.total) * 100)}% failure rate` : "0% failure rate",
        icon: X,
        tone: "red",
        filter: SCAN_STATUS.FAILED,
      },
    ],
    [stats]
  );

  function toggleCheck(key) {
    setChecks((current) => ({ ...current, [key]: !current[key] }));
  }

  function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    if (stepIndex > activeStep + 1) return;
    if (stepIndex > activeStep && !stepValidation[activeStep]) return;
    setOpenMenu("");
    setActiveStep(stepIndex);
  }

  function previousStep() {
    setOpenMenu("");
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  async function continueWizard() {
    if (!canContinue) {
      if (activeStep === 0) {
        setMessage("Select a verified domain to continue.");
      } else if (activeStep === 1) {
        setMessage("Select a scan type to continue.");
      } else if (activeStep === 2) {
        setMessage("Enable at least one scan check to continue.");
      }
      return;
    }

    if (activeStep < steps.length - 1) {
      setOpenMenu("");
      setActiveStep((step) => step + 1);
      return;
    }

    if (!canStartScan) {
      setMessage("Verify and activate a domain before starting a scan.");
      return;
    }

    try {
      await startScan({ domain: selectedDomain, scanType: selectedType, checks });
      setActiveStep(0);
      setShowWizard(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to start scan.");
    }
  }

  async function handleScheduleScan() {
    if (!canStartScan) {
      setMessage("Verify and activate a domain before scheduling a scan.");
      return;
    }

    try {
      await scheduleScan({ domain: selectedDomain, scanType: selectedType, checks });
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Failed to schedule scan.");
    }
  }

  async function handleRerunScan() {
    const target = activeScan || filteredHistory[0];
    if (!target) return;
    try {
      await rerun(target.id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to re-run scan.");
    }
  }

  return (
    <section className="scans-page">
      <div className="scans-stats-grid">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className="scans-stat-card"
              type="button"
              key={item.label}
              onClick={() => setStatusFilter(item.filter)}
            >
              <span className={`scans-stat-icon ${item.tone}`}>
                <Icon size={28} />
              </span>
              <div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <small className={item.tone === "red" ? "negative" : ""}>{item.detail}</small>
              </div>
            </button>
          );
        })}
      </div>

      {loading && <div className="scans-message">Loading scans...</div>}
      {(message || error) && <div className="scans-message">{message || error}</div>}

      <div className="scans-main-grid">
        {activeScans?.length > 0 && !showWizard ? (
          <div className="scans-status-stack">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Active Scans</h3>
              <button
                className="scans-primary-btn"
                style={{ margin: 0, height: "34px", padding: "0 14px", fontSize: "12px" }}
                onClick={() => setShowWizard(true)}
              >
                Start Another Scan
              </button>
            </div>
            {activeScans.map((scan) => (
              <ScanStatusPanel
                key={scan.id}
                scan={scan}
                formatScanTime={formatScanTime}
                onNewScan={() => setShowWizard(true)}
              />
            ))}
          </div>
        ) : (
          <section className="scans-panel scans-new-panel scans-new-panel-improved" id="new-scan">
            <div className="new-scan-header">
              <div className="new-scan-header-accent" />
              <div className="new-scan-header-text">
                <h3>New Scan</h3>
                <p>Move through each step to create and launch a focused security scan.</p>
              </div>
            </div>

            <div className="scans-steps">
              <div className="scans-steps-progress" aria-hidden="true">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              {steps.map(([label, help], index) => {
                const isCompleted = index < activeStep;
                const isActive = index === activeStep;
                const isFuture = index > activeStep;

                let circleClass = "";
                if (isActive) circleClass = "circle-active";
                else if (isCompleted) circleClass = "circle-completed";
                else circleClass = "circle-inactive";

                let labelClass = isActive ? "label-active" : "label-inactive";

                return (
                  <button
                    className={`scans-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""} ${isFuture ? "future" : ""}`}
                    type="button"
                    key={label}
                    onClick={() => goToStep(index)}
                    disabled={isFuture && index !== activeStep + 1}
                  >
                    <span className={`stepper-circle ${circleClass}`}>
                      {isCompleted ? <Check size={12} /> : index + 1}
                    </span>
                    <div className="label-text">
                      <strong className={`label-title ${labelClass}`}>{label}</strong>
                      <small className={`label-desc ${labelClass}`}>{help}</small>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="scans-step-panel">
              <div className="scans-step-intro">
                <h4>{steps[activeStep][0]}</h4>
                <p>{steps[activeStep][1]}</p>
              </div>

              {activeStep === 0 && (
                <div className="scans-step-content">
                  <label className="scans-step-field">
                    <span>Verified Domain</span>
                    <button
                      className="domain-selector-card"
                      type="button"
                      onClick={() => setOpenMenu(openMenu === "domain" ? "" : "domain")}
                    >
                      <div className="domain-globe-icon-box">
                        <Globe2 size={18} />
                      </div>
                      <div className="domain-info">
                        <span className="domain-name-text">
                          {selectedDomain || "No verified domains"}
                        </span>
                        <span className="domain-meta-text">
                          Verified & Active Domain
                        </span>
                      </div>
                      {selectedDomain && (
                        <span className="domain-active-badge">Active</span>
                      )}
                      <ChevronDown size={16} style={{ color: "#6b8a80" }} />
                    </button>
                    {openMenu === "domain" && (
                      <div className="scans-dropdown">
                        {domains.length === 0 && (
                          <button type="button" onClick={() => navigate("/dashboard/domains")}>
                            Verify a domain first
                          </button>
                        )}
                        {domains.map((domain) => (
                          <button
                            type="button"
                            key={domain}
                            onClick={() => {
                              setSelectedDomain(domain);
                              setOpenMenu("");
                            }}
                          >
                            {domain}
                          </button>
                        ))}
                      </div>
                    )}
                  </label>
                </div>
              )}

              {activeStep === 1 && (
                <div className="scans-step-content">
                  <div className="scans-type-grid">
                    {Object.entries(SCAN_TYPE_META).map(([type, meta]) => (
                      <button
                        className={`scans-type-card ${selectedType === type ? "selected" : ""}`}
                        type="button"
                        key={type}
                        onClick={() => setSelectedType(type)}
                      >
                        <div className="scans-type-head">
                          <strong>{type}</strong>
                          <Badge tone="purple">{meta.badge}</Badge>
                        </div>
                        <span className="scans-type-time">
                          <Timer size={14} /> {meta.duration}
                        </span>
                        {selectedType === type && <small className="scans-type-selected">Selected</small>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="scans-step-content">
                  <div className="scans-config-grid">
                    {Object.entries(checks).map(([key, enabled]) => (
                      <button
                        className={enabled ? "enabled" : ""}
                        type="button"
                        key={key}
                        onClick={() => toggleCheck(key)}
                      >
                        <span>{enabled ? <Check size={15} /> : <X size={15} />}</span>
                        {checkLabels[key]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="scans-step-content">
                  <div className="scans-detail-box scans-review-grid">
                    <div className="scan-info-copy">
                      <Info size={17} />
                      <div>
                        <strong>{selectedDomain || "No domain selected"}</strong>
                        <small>{selectedType}</small>
                      </div>
                    </div>
                    <div>
                      <small>Estimated Duration</small>
                      <strong><Timer size={16} /> {selectedScan.duration}</strong>
                    </div>
                    <div>
                      <small>Risk Coverage</small>
                      <strong><ShieldCheck size={16} /> {selectedScan.coverage}</strong>
                    </div>
                    <div>
                      <small>Resource Usage</small>
                      <strong className="usage-medium"><Activity size={16} /> {selectedScan.usage}</strong>
                    </div>
                  </div>

                  <div className="scans-review-box">
                    <strong>Checks Enabled</strong>
                    <span>{enabledChecksCount} selected</span>
                    <small>{Object.entries(checks).filter(([, enabled]) => enabled).map(([key]) => checkLabels[key]).join(", ")}</small>
                  </div>
                </div>
              )}
            </div>

            <div className="action-buttons-row">
              {activeScans?.length > 0 && (
                <button
                  className="btn-previous"
                  type="button"
                  style={{ marginRight: "auto" }}
                  onClick={() => setShowWizard(false)}
                >
                  Cancel & Back
                </button>
              )}
              <button
                className="btn-previous"
                type="button"
                onClick={previousStep}
                disabled={activeStep === 0}
              >
                Previous
              </button>
              <button
                className="btn-continue"
                type="button"
                onClick={continueWizard}
                disabled={activeStep === 3 ? !canStartScan || !canContinue : !canContinue}
              >
                {activeStep === 3 ? "Start Scan" : "Continue"} <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}

        <aside className="scans-right-column">
          <section className="scans-panel scans-overview-panel">
            <h3>Scan Overview</h3>
            <div className="scans-overview-body">
              <div className="scans-ring">
                <strong>{stats.total}</strong>
                <span>Total</span>
              </div>
              <div className="scans-ring-legend">
                <button type="button" onClick={() => setStatusFilter(SCAN_STATUS.COMPLETED)}>
                  <i className="green" /> Completed <span>{stats.completed}</span>
                </button>
                <button type="button" onClick={() => setStatusFilter(SCAN_STATUS.IN_PROGRESS)}>
                  <i className="orange" /> In Progress <span>{stats.running}</span>
                </button>
                <button type="button" onClick={() => setStatusFilter(SCAN_STATUS.FAILED)}>
                  <i className="red" /> Failed <span>{stats.failed}</span>
                </button>
                <button type="button" onClick={() => setStatusFilter(SCAN_STATUS.SCHEDULED)}>
                  <i className="purple" /> Scheduled <span>{stats.scheduled}</span>
                </button>
              </div>
            </div>
            <button className="scans-wide-link" type="button" onClick={() => setStatusFilter("All")}>
              <History size={16} /> View Scan History <ChevronRight size={17} />
            </button>
          </section>

          <section className="scans-panel scans-recent-panel">
            <div className="scans-section-head">
              <h3>Scan History</h3>
              <button type="button" onClick={() => setStatusFilter("All")}>View All</button>
            </div>

            <div className="scans-history-filter">
              {["All", SCAN_STATUS.COMPLETED, SCAN_STATUS.IN_PROGRESS, SCAN_STATUS.FAILED, SCAN_STATUS.SCHEDULED].map(
                (status) => (
                  <button
                    className={statusFilter === status ? "active" : ""}
                    type="button"
                    key={status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            <div className={`scans-recent-list ${showScanHistoryPagination ? "paginated" : ""}`}>
              <div className="scans-history-head" aria-hidden="true">
                <span>Domain</span>
                <span>Status</span>
                <span>Completed</span>
              </div>

              {paginatedHistory.map((scan) => (
                <button
                  className={scan.active ? "active" : ""}
                  type="button"
                  key={scan.id}
                  onClick={() => navigate(`/dashboard/reports?domain=${encodeURIComponent(scan.domain)}`)}
                >
                  <span className="scan-domain-icon"><Globe2 size={17} /></span>
                  <strong>
                    {scan.domain}
                    <small>{scan.scanType}</small>
                  </strong>
                  <Badge tone={toneForStatus(scan.status)}>{scan.status}</Badge>
                  <time>{formatScanTime(scan.completedAt || scan.startedAt || scan.createdAt)}</time>
                  <ChevronRight size={16} />
                </button>
              ))}
              {!loading && filteredHistory.length === 0 && (
                <div className="scans-empty">No scan data available</div>
              )}
            </div>

            <button className="scans-wide-link" type="button" onClick={handleRerunScan}>
              <CalendarCheck size={16} /> Re-run Selected Scan <ChevronRight size={17} />
            </button>

            {showScanHistoryPagination && (
              <div className="scans-history-pagination">
                <button
                  type="button"
                  disabled={scanHistoryPage === 1}
                  onClick={() => setScanHistoryPage((page) => Math.max(1, page - 1))}
                >
                  <ChevronLeft size={15} /> Previous
                </button>

                <div>
                  {scanHistoryPages.map((page) => (
                    <button
                      className={page === scanHistoryPage ? "active" : ""}
                      type="button"
                      key={page}
                      onClick={() => setScanHistoryPage(page)}
                      aria-current={page === scanHistoryPage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={scanHistoryPage === scanHistoryTotalPages}
                  onClick={() =>
                    setScanHistoryPage((page) => Math.min(scanHistoryTotalPages, page + 1))
                  }
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </section>
        </aside>

        <section className="scans-panel scans-vuln-panel">
          <div className="scans-section-head">
            <h3>Recent Vulnerabilities <span>(from last scans)</span></h3>
            <button type="button" onClick={() => navigate("/dashboard/vulnerabilities")}>View All</button>
          </div>

          <div className="scans-vuln-table">
            <div className="scans-vuln-head">
              <span>Vulnerability</span>
              <span>Domain</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Detected At</span>
            </div>
            {vulnerabilities.map((item) => (
              <button
                className="scans-vuln-row"
                type="button"
                key={item.id || `${item.name}-${item.domain}`}
                onClick={() =>
                  navigate(
                    `/dashboard/vulnerabilities?domain=${item.domain}&severity=${item.severity.toLowerCase()}`
                  )
                }
              >
                <span><Siren size={15} /> {item.name}</span>
                <span>{item.domain}</span>
                <Badge tone={item.tone}>{item.severity}</Badge>
                <Badge tone="red">{item.status}</Badge>
                <span>{item.detectedAt}</span>
              </button>
            ))}
            {!loading && vulnerabilities.length === 0 && (
              <div className="scans-empty">No scan data available</div>
            )}
          </div>

          <button className="scans-muted-btn" type="button" onClick={() => navigate("/dashboard/vulnerabilities")}>
            <ListChecks size={15} /> View All Vulnerabilities <ArrowRight size={15} />
          </button>
        </section>
      </div>

      <section className="scans-tip-panel">
        <span><Shield size={35} /></span>
        <div>
          <h3>Pro Tip</h3>
          <p>Schedule weekly full scans and quick daily checks to keep your posture fresh.</p>
        </div>
        <button type="button" onClick={handleScheduleScan}>
          <CalendarCheck size={16} /> Schedule Scan
        </button>
      </section>
    </section>
  );
}
