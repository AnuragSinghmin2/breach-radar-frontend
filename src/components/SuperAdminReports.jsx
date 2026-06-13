import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { FileText, Download, CheckCircle, RefreshCw } from "lucide-react";
import "./SuperAdmin.css";

export default function SuperAdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getReports();
      setReports(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load reports ledger"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const downloadReportSample = (reportName) => {
    const csv = [
      ["Parameter", "Metric", "Status"],
      ["Domain Scanned", "Example.com", "Completed"],
      ["Vulnerabilities Found", "0", "Clean"],
      ["SSL Expiration", "Valid (90 days left)", "Healthy"]
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportName.toLowerCase().replace(/\s+/g, "_")}_summary.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sa-container">
      <div className="sa-card">
        <div className="sa-card-header">
          <h3>Generated Security Reports Ledger</h3>
          <button className="sa-btn sa-btn-secondary" onClick={loadReports}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

        {loading ? (
          <div className="sa-empty" style={{ color: "#00d68f" }}>Loading reports...</div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Workspace</th>
                  <th>Template Type</th>
                  <th>Status</th>
                  <th>Generated Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }} className="sa-empty">No reports have been generated yet.</td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600, color: "#f8fafc" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <FileText size={14} style={{ color: "#00d68f" }} />
                          {r.name || "Vulnerability Scan Report"}
                        </div>
                      </td>
                      <td>{r.workspaceId?.name || "Default Workspace"}</td>
                      <td>
                        <span className="sa-badge sa-badge-user">
                          {r.template || "Executive"}
                        </span>
                      </td>
                      <td>
                        <span className={`sa-badge ${r.status === "Completed" ? "sa-badge-active" : "sa-badge-suspended"}`}>
                          {r.status || "Completed"}
                        </span>
                      </td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          className="sa-btn"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                          onClick={() => downloadReportSample(r.name || "Scan_Report")}
                        >
                          <Download size={10} style={{ marginRight: "4px" }} /> Download CSV
                        </button>
                      </td>
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
