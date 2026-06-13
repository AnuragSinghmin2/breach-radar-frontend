import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { History, ShieldAlert, RefreshCw } from "lucide-react";
import "./SuperAdmin.css";

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState("all");
  const [user, setUser] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getAuditLogs({ action, user });
      setLogs(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load audit logs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [action, user]);

  return (
    <div className="sa-container">
      <div className="sa-card">
        <div className="sa-controls">
          <select className="sa-select" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="Login">Login</option>
            <option value="Logout">Logout</option>
            <option value="Role Changes">Role Changes</option>
            <option value="User Deletion">User Deletion</option>
            <option value="Subscription Changes">Subscription Changes</option>
            <option value="Domain Deletion">Domain Deletion</option>
            <option value="User Status Change">User Status Change</option>
            <option value="Plan Changes">Plan Changes</option>
            <option value="Payment Refunded">Payment Refunded</option>
          </select>

          <input
            type="text"
            className="sa-search-input"
            placeholder="Search by User Email..."
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />

          <button className="sa-btn sa-btn-secondary" onClick={loadLogs}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

        {loading ? (
          <div className="sa-empty" style={{ color: "#00d68f" }}>Loading audit logs...</div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>IP Address</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }} className="sa-empty">No audit logs matching selection parameters.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontWeight: 600, color: "#f8fafc" }}>
                        {log.userId?.email || "System Service / Anonymous"}
                      </td>
                      <td>
                        <span className="sa-badge sa-badge-user" style={{ background: "rgba(0, 214, 143, 0.12)", color: "#00d68f" }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: "#cbd5e1" }}>{log.description}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{log.ipAddress || "N/A"}</td>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
