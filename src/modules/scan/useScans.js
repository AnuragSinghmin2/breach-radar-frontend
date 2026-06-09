import { useCallback, useEffect, useMemo, useState } from "react";
import { SCAN_STATUS } from "./constants";
import { scanApi, domainApi, vulnerabilityApi } from "../../services/api";
import { useDashboard } from "../../context/DashboardContext";
import { formatScanTime, toneForStatus, severityTone } from "../../utils/format";

function mapScan(apiScan, active = false) {
  return {
    id: apiScan._id,
    domain: apiScan.domainId?.domain || "",
    scanType: apiScan.scanType,
    status: apiScan.status,
    checks: apiScan.checks,
    startedAt: apiScan.startedAt,
    completedAt: apiScan.completedAt,
    createdAt: apiScan.createdAt,
    vulnerabilitiesCount: apiScan.vulnerabilitiesCount || {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    riskScore: apiScan.riskScore || 0,
    errorDetail: apiScan.errorDetail || "",
    active,
  };
}

function mapVulnerability(item) {
  return {
    id: item._id,
    name: item.name,
    domain: item.domainId?.domain || "",
    severity: item.severity,
    status: item.status,
    detectedAt: formatScanTime(item.detectedAt),
    tone: item.tone || severityTone(item.severity),
  };
}

function isScannableDomain(domain) {
  return domain.verificationStatus === "verified" && domain.status === "Active";
}

export function useScans() {
  const {
    scans: contextScans,
    domains: contextDomains,
    vulnerabilities: contextVulnerabilities,
    loading: contextLoading,
    refreshScans,
    refreshAll,
  } = useDashboard();
  const [scans, setScans] = useState([]);
  const [domains, setDomains] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [activeScanId, setActiveScanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [scanData, domainData, vulnData] = await Promise.all([
        scanApi.getScans(),
        domainApi.getDomains(),
        vulnerabilityApi.getVulnerabilities(),
      ]);

      setScans(scanData.map((scan) => mapScan(scan)));
      setDomains(domainData.filter(isScannableDomain).map((item) => item.domain));
      setVulnerabilities(vulnData.slice(0, 10).map(mapVulnerability));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load scans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contextLoading) return;

    if (contextScans.length > 0 || contextDomains.length > 0) {
      setScans(contextScans.map((scan) => mapScan(scan)));
      setDomains(contextDomains.filter(isScannableDomain).map((item) => item.domain));
      setVulnerabilities(contextVulnerabilities.slice(0, 10).map(mapVulnerability));
      setLoading(false);
      return;
    }

    loadData();
  }, [contextDomains, contextLoading, contextScans, contextVulnerabilities, loadData]);

  const hasActiveScans = useMemo(
    () =>
      scans.some(
        (scan) =>
          scan.status === SCAN_STATUS.QUEUED || scan.status === SCAN_STATUS.IN_PROGRESS
      ),
    [scans]
  );

  useEffect(() => {
    if (!hasActiveScans) return undefined;

    const interval = setInterval(async () => {
      try {
        const scanData = await scanApi.getScans();
        setScans(scanData.map((scan) => mapScan(scan, scan._id === activeScanId)));

        const vulnData = await vulnerabilityApi.getVulnerabilities();
        setVulnerabilities(vulnData.slice(0, 10).map(mapVulnerability));
        await refreshScans();
      } catch {
        // Polling errors are non-fatal
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [hasActiveScans, activeScanId, refreshScans]);

  const activeScan = useMemo(() => {
    if (activeScanId) {
      return scans.find((scan) => scan.id === activeScanId) || null;
    }
    return (
      scans.find((scan) => scan.active) ||
      scans.find(
        (scan) =>
          scan.status === SCAN_STATUS.QUEUED || scan.status === SCAN_STATUS.IN_PROGRESS
      ) ||
      null
    );
  }, [scans, activeScanId]);

  const filteredHistory = useMemo(
    () =>
      scans.filter((scan) => statusFilter === "All" || scan.status === statusFilter),
    [scans, statusFilter]
  );

  const stats = useMemo(() => {
    const total = scans.length || 1;
    const completed = scans.filter((scan) => scan.status === SCAN_STATUS.COMPLETED).length;
    const running = scans.filter(
      (scan) =>
        scan.status === SCAN_STATUS.IN_PROGRESS || scan.status === SCAN_STATUS.QUEUED
    ).length;
    const failed = scans.filter((scan) => scan.status === SCAN_STATUS.FAILED).length;
    const scheduled = scans.filter((scan) => scan.status === SCAN_STATUS.SCHEDULED).length;

    return {
      total: scans.length,
      completed,
      running,
      failed,
      scheduled,
      successRate: Math.round((completed / total) * 100),
    };
  }, [scans]);

  const startScan = useCallback(async ({ domain, scanType, checks }) => {
    const { scan } = await scanApi.startScan({ domain, scanType, checks });
    const mapped = mapScan(scan, true);
    setScans((current) => [mapped, ...current.map((item) => ({ ...item, active: false }))]);
    setActiveScanId(mapped.id);
    setStatusFilter(SCAN_STATUS.IN_PROGRESS);
    setMessage(`${scanType} started for ${domain}.`);
    await refreshAll();
    return mapped;
  }, [refreshAll]);

  const scheduleScan = useCallback(async ({ domain, scanType, checks }) => {
    const scheduled = mapScan(
      {
        _id: `local-${Date.now()}`,
        domainId: { domain },
        scanType,
        status: SCAN_STATUS.SCHEDULED,
        checks,
        createdAt: new Date(),
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      true
    );
    setScans((current) => [scheduled, ...current.map((item) => ({ ...item, active: false }))]);
    setActiveScanId(scheduled.id);
    setStatusFilter(SCAN_STATUS.SCHEDULED);
    setMessage(`${scanType} scheduled for ${domain}.`);
    return scheduled;
  }, []);

  const rerun = useCallback(async (scanId) => {
    if (String(scanId).startsWith("local-")) {
      throw new Error("Cannot re-run a locally scheduled scan.");
    }
    const { scan } = await scanApi.rerunScan(scanId);
    const mapped = mapScan(scan, true);
    setScans((current) => [mapped, ...current.map((item) => ({ ...item, active: false }))]);
    setActiveScanId(mapped.id);
    setStatusFilter(SCAN_STATUS.IN_PROGRESS);
    setMessage(`${mapped.scanType} re-run queued for ${mapped.domain}.`);
    await refreshAll();
    return mapped;
  }, [refreshAll]);

  const getScanStatus = useCallback(
    async (scanId) => {
      const scan = await scanApi.getScanById(scanId);
      return mapScan(scan);
    },
    []
  );

  return {
    scans,
    filteredHistory,
    vulnerabilities,
    statusFilter,
    setStatusFilter,
    message,
    setMessage,
    error,
    loading,
    activeScan,
    activeScanId,
    setActiveScanId,
    stats,
    domains,
    startScan,
    scheduleScan,
    rerun,
    getScanStatus,
    refresh: loadData,
    formatScanTime,
    toneForStatus,
  };
}
