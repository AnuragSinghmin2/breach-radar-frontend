import { MOCK_VULNERABILITY_CATALOG } from "./mockVulnerabilities";
import { MOCK_DOMAINS, SCAN_STATUS, SCAN_TYPES, DEFAULT_CHECKS } from "./constants";

let scanIdCounter = 6;
let vulnIdCounter = 100;

const scans = [
  createScanRecord({
    id: "scan-1",
    domain: "example.com",
    scanType: SCAN_TYPES.FULL,
    status: SCAN_STATUS.COMPLETED,
    createdAt: new Date("2024-05-16T10:30:00"),
    startedAt: new Date("2024-05-16T10:30:00"),
    completedAt: new Date("2024-05-16T10:45:00"),
    vulnerabilitiesCount: { critical: 0, high: 1, medium: 2, low: 0 },
    riskScore: 29,
    active: true,
  }),
  createScanRecord({
    id: "scan-2",
    domain: "testsite.com",
    scanType: SCAN_TYPES.QUICK,
    status: SCAN_STATUS.COMPLETED,
    createdAt: new Date("2024-05-16T09:15:00"),
    startedAt: new Date("2024-05-16T09:15:00"),
    completedAt: new Date("2024-05-16T09:22:00"),
    vulnerabilitiesCount: { critical: 1, high: 0, medium: 1, low: 0 },
    riskScore: 32,
  }),
  createScanRecord({
    id: "scan-3",
    domain: "myapp.io",
    scanType: SCAN_TYPES.FULL,
    status: SCAN_STATUS.IN_PROGRESS,
    createdAt: new Date("2024-05-16T08:45:00"),
    startedAt: new Date("2024-05-16T08:45:00"),
  }),
  createScanRecord({
    id: "scan-4",
    domain: "demo.org",
    scanType: SCAN_TYPES.FULL,
    status: SCAN_STATUS.COMPLETED,
    createdAt: new Date("2024-05-16T07:20:00"),
    startedAt: new Date("2024-05-16T07:20:00"),
    completedAt: new Date("2024-05-16T07:38:00"),
    vulnerabilitiesCount: { critical: 0, high: 1, medium: 0, low: 1 },
    riskScore: 17,
  }),
  createScanRecord({
    id: "scan-5",
    domain: "vulnerable.net",
    scanType: SCAN_TYPES.CUSTOM,
    status: SCAN_STATUS.FAILED,
    createdAt: new Date("2024-05-16T06:10:00"),
    startedAt: new Date("2024-05-16T06:10:00"),
    completedAt: new Date("2024-05-16T06:12:00"),
    errorDetail: "Target host unreachable during mock scan.",
  }),
];

const vulnerabilities = [];
const listeners = new Set();
const activeTimers = new Map();

function createScanRecord({
  id,
  domain,
  scanType,
  status,
  checks = { ...DEFAULT_CHECKS },
  createdAt = new Date(),
  startedAt = null,
  completedAt = null,
  scheduledTime = null,
  vulnerabilitiesCount = { critical: 0, high: 0, medium: 0, low: 0 },
  riskScore = 0,
  errorDetail = "",
  active = false,
}) {
  return {
    id,
    domain,
    scanType,
    status,
    checks,
    createdAt,
    startedAt,
    completedAt,
    scheduledTime,
    vulnerabilitiesCount,
    riskScore,
    errorDetail,
    active,
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function mergeChecks(scanType, checks = {}) {
  const defaults = {
    ...DEFAULT_CHECKS,
    ports: scanType === SCAN_TYPES.FULL || scanType === SCAN_TYPES.CUSTOM,
    compliance: scanType === SCAN_TYPES.FULL,
  };
  return { ...defaults, ...checks };
}

function pickMockFindings() {
  const shuffled = [...MOCK_VULNERABILITY_CATALOG].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 4) + 2;
  return shuffled.slice(0, count);
}

function computeRiskScore(counts) {
  const score =
    counts.critical * 25 + counts.high * 15 + counts.medium * 7 + counts.low * 2;
  return Math.min(100, score);
}

function addFindingsFromScan(scan, findings) {
  const detectedAt = formatScanTime(scan.completedAt || new Date());

  findings.forEach((finding) => {
    vulnerabilities.unshift({
      id: `vuln-${vulnIdCounter++}`,
      scanId: scan.id,
      name: finding.name,
      domain: scan.domain,
      severity: finding.severity,
      status: "Open",
      detectedAt,
      tone: finding.tone,
    });
  });
}

function clearActiveFlag() {
  scans.forEach((scan) => {
    scan.active = false;
  });
}

function executeMockScan(scanId) {
  const scan = scans.find((item) => item.id === scanId);
  if (!scan || scan.status === SCAN_STATUS.SCHEDULED) return;

  const startTimer = setTimeout(() => {
    scan.status = SCAN_STATUS.IN_PROGRESS;
    scan.startedAt = new Date();
    notify();
  }, 500);

  const completeTimer = setTimeout(() => {
    const findings = pickMockFindings();
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };

    findings.forEach((finding) => {
      const key = finding.severity.toLowerCase();
      counts[key] += 1;
    });

    scan.status = SCAN_STATUS.COMPLETED;
    scan.completedAt = new Date();
    scan.vulnerabilitiesCount = counts;
    scan.riskScore = computeRiskScore(counts);
    addFindingsFromScan(scan, findings);
    activeTimers.delete(scanId);
    notify();
  }, 5500);

  activeTimers.set(scanId, [startTimer, completeTimer]);
}

export function formatScanTime(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function toneForStatus(status) {
  if (status === SCAN_STATUS.COMPLETED) return "green";
  if (status === SCAN_STATUS.IN_PROGRESS || status === SCAN_STATUS.QUEUED) return "blue";
  if (status === SCAN_STATUS.SCHEDULED) return "purple";
  return "red";
}

export function getDomains() {
  return [...MOCK_DOMAINS];
}

export function getScanHistory({ status, domain } = {}) {
  return scans
    .filter((scan) => {
      if (status && status !== "All" && scan.status !== status) return false;
      if (domain && scan.domain !== domain) return false;
      return true;
    })
    .map((scan) => ({ ...scan }));
}

export function getScanStatus(scanId) {
  const scan = scans.find((item) => item.id === scanId);
  return scan ? { ...scan } : null;
}

export function getRecentVulnerabilities() {
  return vulnerabilities.slice(0, 10).map((item) => ({ ...item }));
}

export function startScan({ domain, scanType, checks }) {
  if (!domain) throw new Error("Domain is required.");
  if (!scanType) throw new Error("Scan type is required.");
  if (!MOCK_DOMAINS.includes(domain)) {
    throw new Error(`Domain "${domain}" is not registered.`);
  }

  clearActiveFlag();

  const scan = createScanRecord({
    id: `scan-${scanIdCounter++}`,
    domain,
    scanType,
    status: SCAN_STATUS.QUEUED,
    checks: mergeChecks(scanType, checks),
    createdAt: new Date(),
    active: true,
  });

  scans.unshift(scan);
  executeMockScan(scan.id);
  notify();

  return { ...scan };
}

export function scheduleScan({ domain, scanType, checks, scheduledTime }) {
  clearActiveFlag();

  const scan = createScanRecord({
    id: `scan-${scanIdCounter++}`,
    domain,
    scanType,
    status: SCAN_STATUS.SCHEDULED,
    checks: mergeChecks(scanType, checks),
    createdAt: new Date(),
    scheduledTime: scheduledTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
    active: true,
  });

  scans.unshift(scan);
  notify();
  return { ...scan };
}

export function rerunScan(scanId) {
  const previous = scans.find((item) => item.id === scanId);
  if (!previous) throw new Error("Scan not found.");

  return startScan({
    domain: previous.domain,
    scanType: previous.scanType,
    checks: previous.checks,
  });
}

export function hasActiveScans() {
  return scans.some(
    (scan) =>
      scan.status === SCAN_STATUS.QUEUED || scan.status === SCAN_STATUS.IN_PROGRESS
  );
}

export const scanService = {
  subscribe,
  getDomains,
  getScanHistory,
  getScanStatus,
  getRecentVulnerabilities,
  startScan,
  scheduleScan,
  rerunScan,
  hasActiveScans,
  formatScanTime,
  toneForStatus,
};
