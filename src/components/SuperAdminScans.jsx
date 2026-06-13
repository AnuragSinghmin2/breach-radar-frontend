import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { Play, Square, RefreshCw, Scan, Clock, CheckCircle, XCircle } from "lucide-react";
import "./SuperAdmin.css";

export default function SuperAdminScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  const loadScans = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getScans({ status });
      setScans(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load scan history"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, [status]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to force-cancel this active scan?")) return;
    try {
      setProcessingId(id);
      await superAdminApi.cancelScan(id);
      loadScans();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to cancel scan"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestart = async (id) => {
    try {
      setProcessingId(id);
      await superAdminApi.restartScan(id);
      alert("Scan successfully queued again.");
      loadScans();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to restart scan"));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="sa-container">
      <div className="sa-card">
        <div className="sa-controls">
          <select className="sa-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Scans</option>
            <option value="Queued">Queued</option>
            <option value="In Progress">Running (In Progress)</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>

          <button className="sa-btn sa-btn-secondary" onClick={loadScans}>Refresh</button>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

        {loading ? (
          <div className="sa-empty" style={{ color: "#00d68f" }}>Loading scans queue...</div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Workspace</th>
                  <th>Scan Type</th>
                  <th>Status</th>
                  <th>Findings (C / H / M / L)</th>
                  <th>Trigger Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }} className="sa-empty">No scan records match filter status.</td>
                  </tr>
                ) : (
                  scans.map((s) => {
                    const counts = s.vulnerabilitiesCount || { critical: 0, high: 0, medium: 0, low: 0 };
                    const isActive = s.status === "Queued" || s.status === "In Progress";
                    return (
                      <tr key={s._id}>
                        <td style={{ fontWeight: 600, color: "#f8fafc" }}>{s.domainId?.domain || "Unknown Domain"}</td>
                        <td>{s.workspaceId?.name || "N/A"}</td>
                        <td>{s.scanType}</td>
                        <td>
                          <span className={`sa-badge ${s.status === "Completed" ? "sa-badge-active" : s.status === "Failed" ? "sa-badge-suspended" : "sa-badge-user"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: "#ff4545", marginRight: "6px" }}>{counts.critical}</span>
                          <span style={{ color: "#f97316", marginRight: "6px" }}>{counts.high}</span>
                          <span style={{ color: "#facc15", marginRight: "6px" }}>{counts.medium}</span>
                          <span style={{ color: "#6366f1" }}>{counts.low}</span>
                        </td>
                        <td>{new Date(s.createdAt).toLocaleString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {isActive ? (
                              <button
                                className="sa-btn sa-btn-danger"
                                style={{ padding: "4px 8px" }}
                                disabled={processingId === s._id}
                                onClick={() => handleCancel(s._id)}
                                title="Cancel Active Scan"
                              >
                                <Square size={12} /> Cancel
                              </button>
                            ) : (
                              <button
                                className="sa-btn"
                                style={{ padding: "4px 8px" }}
                                disabled={processingId === s._id}
                                onClick={() => handleRestart(s._id)}
                                title="Restart Scan Config"
                              >
                                <RefreshCw size={12} /> Rerun
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
