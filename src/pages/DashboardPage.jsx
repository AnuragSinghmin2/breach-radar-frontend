import { useEffect, useState } from "react";
import StatsCards from "../components/StatsCards";
import MonitoringWidgets from "../components/MonitoringWidgets";
import ChartSection from "../components/ChartSection";
import BottomSection from "../components/BottomSection";
import { useDashboard } from "../context/DashboardContext";

export default function DashboardPage() {
  const { domains, loading, refreshAll } = useDashboard();
  const [resetToast, setResetToast] = useState("");

  useEffect(() => {
    const message = sessionStorage.getItem("workspaceResetToast");
    if (!message) return;

    setResetToast(message);
    sessionStorage.removeItem("workspaceResetToast");
    refreshAll();

    const timeoutId = window.setTimeout(() => setResetToast(""), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [refreshAll]);

  return (
    <>
      {resetToast && (
        <div style={{ marginBottom: "16px", borderRadius: "12px", border: "1px solid rgba(34, 197, 94, 0.28)", background: "rgba(34, 197, 94, 0.12)", color: "#bbf7d0", padding: "14px 16px", fontWeight: 700 }}>
          {resetToast}
        </div>
      )}
      {!loading && domains.length === 0 && (
        <div style={{ marginBottom: "16px", borderRadius: "16px", border: "1px solid rgba(51, 65, 85, 0.8)", background: "linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.98))", padding: "18px 20px", color: "#e2e8f0" }}>
          <strong style={{ display: "block", fontSize: "16px", marginBottom: "4px" }}>No domains found.</strong>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>Start by adding your first domain.</span>
        </div>
      )}
      <StatsCards />
      <MonitoringWidgets />
      <div className="middle-section">
        <ChartSection />
      </div>
      <BottomSection />
    </>
  );
}
