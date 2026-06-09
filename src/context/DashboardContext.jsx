import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  dashboardApi,
  domainApi,
  reportApi,
  scanApi,
  vulnerabilityApi,
} from "../services/api";
import { groupVulnerabilitiesByDomain, mapApiDomain } from "../utils/domainMapper";
import { mapApiReport } from "../utils/reportMapper";
import { useAuth } from "./AuthContext";

const defaultStats = {
  totalDomains: 0,
  totalScans: 0,
  criticalCount: 0,
  highCount: 0,
  mediumCount: 0,
  lowCount: 0,
  securityScore: 0,
  securityScoreLabel: "Not Scanned",
};

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(defaultStats);
  const [domains, setDomains] = useState([]);
  const [scans, setScans] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshStats = useCallback(async () => {
    const data = await dashboardApi.getDashboardStats();
    setStats(data);
    return data;
  }, []);

  const refreshDomains = useCallback(async () => {
    const [domainData, vulnData] = await Promise.all([
      domainApi.getDomains(),
      vulnerabilityApi.getVulnerabilities(),
    ]);
    const vulnMap = groupVulnerabilitiesByDomain(vulnData);
    const mapped = domainData.map((item) => mapApiDomain(item, vulnMap[item.domain]));
    setDomains(mapped);
    setVulnerabilities(vulnData);
    return mapped;
  }, []);

  const refreshScans = useCallback(async () => {
    const data = await scanApi.getScans();
    setScans(data);
    return data;
  }, []);

  const refreshReports = useCallback(async () => {
    const data = await reportApi.getReports();
    const mapped = data.map(mapApiReport);
    setReports(mapped);
    return mapped;
  }, []);

  const refreshAll = useCallback(async () => {
    setError("");
    try {
      await Promise.all([
        refreshStats(),
        refreshDomains(),
        refreshScans(),
        refreshReports(),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [refreshDomains, refreshReports, refreshScans, refreshStats]);

  useEffect(() => {
    if (!isAuthenticated) {
      setStats(defaultStats);
      setDomains([]);
      setScans([]);
      setVulnerabilities([]);
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    refreshAll();
  }, [isAuthenticated, refreshAll]);

  const recentScans = useMemo(() => scans.slice(0, 5), [scans]);

  const recentVulnerabilities = useMemo(
    () =>
      [...vulnerabilities]
        .sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt))
        .slice(0, 5),
    [vulnerabilities]
  );

  const notifications = useMemo(() => {
    const items = [];

    recentScans.forEach((scan) => {
      if (scan.status === "Completed") {
        items.push({
          id: `scan-${scan._id}`,
          tone: "success",
          text: `Scan completed for ${scan.domainId?.domain || "domain"}`,
          path: "/scans",
        });
      } else if (scan.status === "Failed") {
        items.push({
          id: `scan-failed-${scan._id}`,
          tone: "danger",
          text: `Scan failed for ${scan.domainId?.domain || "domain"}`,
          path: "/scans",
        });
      }
    });

    recentVulnerabilities.slice(0, 2).forEach((item) => {
      items.push({
        id: `vuln-${item._id}`,
        tone: item.severity === "Critical" || item.severity === "High" ? "danger" : "success",
        text: `${item.severity} finding: ${item.name}`,
        path: `/vulnerabilities?domain=${item.domainId?.domain || ""}&severity=${item.severity?.toLowerCase() || "all"}`,
      });
    });

    return items.slice(0, 3);
  }, [recentScans, recentVulnerabilities]);

  const value = useMemo(
    () => ({
      stats,
      domains,
      scans,
      vulnerabilities,
      reports,
      recentScans,
      recentVulnerabilities,
      notifications,
      loading,
      error,
      refreshAll,
      refreshStats,
      refreshDomains,
      refreshScans,
      refreshReports,
    }),
    [
      stats,
      domains,
      scans,
      vulnerabilities,
      reports,
      recentScans,
      recentVulnerabilities,
      notifications,
      loading,
      error,
      refreshAll,
      refreshStats,
      refreshDomains,
      refreshScans,
      refreshReports,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
