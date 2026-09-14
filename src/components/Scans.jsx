import { useEffect, useMemo, useState } from "react";
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

function ScanStatusPanel({ scan, formatScanTime }) {
  if (!scan) return null;

  const isRunning =
    scan.status === SCAN_STATUS.QUEUED || scan.status === SCAN_STATUS.IN_PROGRESS;

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

      {scan.status === SCAN_STATUS.COMPLETED && (
        <div className="scans-status-findings">
          <span className="critical">{scan.vulnerabilitiesCount.critical} Critical</span>
          <span className="high">{scan.vulnerabilitiesCount.high} High</span>
          <span className="medium">{scan.vulnerabilitiesCount.medium} Medium</span>
          <span className="low">{scan.vulnerabilitiesCount.low} Low</span>
        </div>
      )}

      {scan.errorDetail && <p className="scans-status-error">{scan.errorDetail}</p>}
    </section>
  );
}

export default function Scans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    filteredHistory,
    vulnerabilities,
    statusFilter,
    setStatusFilter,
    message,
    activeScan,
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
  } = useScans();

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
      return;
    }
    if (selectedDomain && !domains.includes(selectedDomain)) {
      setSelectedDomain(domains[0] || "");
      return;
    }
    if (!selectedDomain && domains.length > 0) {
      setSelectedDomain(domains[0]);
    }
  }, [domains, searchParams, selectedDomain]);

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
        <div className="scans-left-column">
          <section className="scans-panel scans-new-panel" id="new-scan">
            <h3>New Scan</h3>
            <p>Move through each step to create and launch a focused security scan.</p>

            <div className="scans-steps">
              <div className="scans-steps-progress" aria-hidden="true">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              {steps.map(([label, help], index) => {
                const isCompleted = index < activeStep;
                const isActive = index === activeStep;
                const isFuture = index > activeStep;

                return (
                <button
                  className={`scans-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""} ${isFuture ? "future" : ""}`}
                  type="button"
                  key={label}
                  onClick={() => goToStep(index)}
                  disabled={isFuture && index !== activeStep + 1}
                >
                  <span className={isCompleted || isActive ? "active" : ""}>
                    {isCompleted ? <Check size={12} /> : index + 1}
                  </span>
                  <strong>{label}</strong>
                  <small>{help}</small>
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
                    <button type="button" onClick={() => setOpenMenu(openMenu === "domain" ? "" : "domain")}>
                      <Globe2 size={17} />
                      {selectedDomain || "No verified domains"}
                      {selectedDomain && <Badge tone="green">Active</Badge>}
                      <ChevronDown size={16} />
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

            <div className="scans-action-row">
              <button
                className="scans-secondary-btn"
                type="button"
                onClick={previousStep}
                disabled={activeStep === 0}
              >
                Previous
              </button>
              <button
                className="scans-primary-btn"
                type="button"
                onClick={continueWizard}
                disabled={activeStep === 3 ? !canStartScan || !canContinue : !canContinue}
              >
                {activeStep === 3 ? "Start Scan" : "Continue"} <ArrowRight size={16} />
              </button>
            </div>
          </section>

          <ScanStatusPanel scan={activeScan} formatScanTime={formatScanTime} />

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
