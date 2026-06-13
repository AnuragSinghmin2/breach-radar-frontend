import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { ShieldAlert, Globe, Filter } from "lucide-react";
import "./SuperAdmin.css";

export default function SuperAdminVulnerabilities() {
  const [vulns, setVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [severity, setSeverity] = useState("all");
  const [domain, setDomain] = useState("");
  const [user, setUser] = useState("");

  const loadVulns = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getVulnerabilities({ severity, domain, user });
      setVulns(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load vulnerabilities ledger"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVulns();
  }, [severity, domain, user]);

  return (
    <div className="sa-container">
      <div className="sa-card">
        {/* Filter Controls */}
        <div className="sa-controls">
          <select className="sa-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <input
            type="text"
            className="sa-search-input"
            placeholder="Filter by Domain name..."
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />

          <input
            type="text"
            className="sa-search-input"
            placeholder="Filter by Owner Email..."
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />

          <button className="sa-btn sa-btn-secondary" onClick={loadVulns}>Refresh</button>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

        {loading ? (
          <div className="sa-empty" style={{ color: "#00d68f" }}>Loading global vulnerabilities database...</div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Vulnerability</th>
                  <th>Domain</th>
                  <th>Workspace</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>CWE / Code</th>
                  <th>Detected At</th>
                </tr>
              </thead>
              <tbody>
                {vulns.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }} className="sa-empty">No vulnerabilities found matching filters.</td>
                  </tr>
                ) : (
                  vulns.map((v) => {
                    const isCritical = v.severity === "Critical";
                    const isHigh = v.severity === "High";
                    return (
                      <tr key={v._id}>
                        <td style={{ fontWeight: 600, color: "#f8fafc" }}>{v.name}</td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Globe size={12} style={{ color: "#94a3b8" }} />
                            {v.domainId?.domain || "N/A"}
                          </span>
                        </td>
                        <td>{v.workspaceId?.name || "N/A"}</td>
                        <td>
                          <span
                            className="sa-badge"
                            style={{
                              background: isCritical ? "rgba(239,68,68,0.15)" : isHigh ? "rgba(249,115,22,0.15)" : v.severity === "Medium" ? "rgba(234,179,8,0.15)" : "rgba(99,102,241,0.15)",
                              color: isCritical ? "#ef4444" : isHigh ? "#f97316" : v.severity === "Medium" ? "#facc15" : "#6366f1"
                            }}
                          >
                            {v.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`sa-badge ${v.status === "Resolved" ? "sa-badge-active" : "sa-badge-suspended"}`}>
                            {v.status}
                          </span>
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{v.cwe || "N/A"}</td>
                        <td>{new Date(v.detectedAt).toLocaleDateString()}</td>
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
