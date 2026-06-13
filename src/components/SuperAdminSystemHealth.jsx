import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { HeartPulse, CheckCircle2, AlertOctagon, RefreshCw } from "lucide-react";
import "./SuperAdmin.css";

export default function SuperAdminSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadHealth = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      const data = await superAdminApi.getSystemHealth();
      setHealth(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to connect to health diagnostics API"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  if (loading && !health) {
    return <div className="sa-empty" style={{ color: "#00d68f", textAlign: "center", padding: "40px" }}>Requesting health credentials from server...</div>;
  }

  if (error) {
    return <div className="sa-empty" style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>{error}</div>;
  }

  const { apiStatus, mongodbStatus, redisStatus, workerStatus, queueStatus, timestamp } = health;

  const getStatusColorClass = (status) => {
    if (status === "Healthy" || status === "OK" || status === "active" || status === "connected") return "healthy";
    if (status === "Error" || status === "Disconnected" || status === "failed") return "error";
    return "warning";
  };

  return (
    <div className="sa-container">
      <div className="sa-card">
        <div className="sa-card-header">
          <h3>Services Health Ledger</h3>
          <button className="sa-btn sa-btn-secondary" onClick={() => loadHealth(true)} disabled={refreshing}>
            <RefreshCw size={12} className={refreshing ? "sa-spin" : ""} /> {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "20px" }}>
          Last Checked: {new Date(timestamp || Date.now()).toLocaleTimeString()} (Auto-checks database, key-value stores, and queuing workers).
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* API Gateway Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#071321", border: "1px solid rgba(42, 69, 96, 0.4)", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <HeartPulse size={18} style={{ color: "#00d68f" }} />
              <div>
                <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "14px" }}>API Gateway Service</h4>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Main endpoint server listening for user requests</span>
              </div>
            </div>
            <span className="sa-health-indicator">
              <span className={`sa-health-dot ${getStatusColorClass(apiStatus)}`}></span>
              {apiStatus}
            </span>
          </div>

          {/* MongoDB Cluster Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#071321", border: "1px solid rgba(42, 69, 96, 0.4)", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <HeartPulse size={18} style={{ color: "#00d68f" }} />
              <div>
                <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "14px" }}>MongoDB Database Cluster</h4>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Persistent Mongoose storage connection check</span>
              </div>
            </div>
            <span className="sa-health-indicator">
              <span className={`sa-health-dot ${getStatusColorClass(mongodbStatus)}`}></span>
              {mongodbStatus}
            </span>
          </div>

          {/* Redis Event Cache Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#071321", border: "1px solid rgba(42, 69, 96, 0.4)", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <HeartPulse size={18} style={{ color: "#00d68f" }} />
              <div>
                <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "14px" }}>Redis Queue Cache Store</h4>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Redis connection status required for BullMQ queues</span>
              </div>
            </div>
            <span className="sa-health-indicator">
              <span className={`sa-health-dot ${getStatusColorClass(redisStatus)}`}></span>
              {redisStatus}
            </span>
          </div>

          {/* BullMQ Worker Pool */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#071321", border: "1px solid rgba(42, 69, 96, 0.4)", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <HeartPulse size={18} style={{ color: "#00d68f" }} />
              <div>
                <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "14px" }}>Vulnerability Scan Worker pool</h4>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Background scanning processors executing jobs</span>
              </div>
            </div>
            <span className="sa-health-indicator">
              <span className={`sa-health-dot ${getStatusColorClass(workerStatus)}`}></span>
              {workerStatus}
            </span>
          </div>

          {/* BullMQ Queues */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#071321", border: "1px solid rgba(42, 69, 96, 0.4)", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <HeartPulse size={18} style={{ color: "#00d68f" }} />
              <div>
                <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "14px" }}>BullMQ Task Queue status</h4>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Task schedulers for scanning, alerting, and reporting cycles</span>
              </div>
            </div>
            <span className="sa-health-indicator">
              <span className={`sa-health-dot ${getStatusColorClass(queueStatus)}`}></span>
              {queueStatus}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
