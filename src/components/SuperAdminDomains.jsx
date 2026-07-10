import { useEffect, useMemo, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { ChevronLeft, ChevronRight, Globe, RefreshCw } from "lucide-react";
import "./SuperAdmin.css";

const DOMAINS_PER_PAGE = 8;

export default function SuperAdminDomains() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [scanningId, setScanningId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getDomains({ search, status });
      setDomains(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load domain ledger"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadDomains();
  }, [search, status]);

  const totalPages = Math.max(1, Math.ceil(domains.length / DOMAINS_PER_PAGE));
  const paginatedDomains = useMemo(() => {
    const start = (currentPage - 1) * DOMAINS_PER_PAGE;
    return domains.slice(start, start + DOMAINS_PER_PAGE);
  }, [currentPage, domains]);
  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const halfWindow = Math.floor(maxVisiblePages / 2);
    const start = Math.max(
      1,
      Math.min(currentPage - halfWindow, totalPages - maxVisiblePages + 1)
    );
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);
  const showPagination = domains.length > DOMAINS_PER_PAGE;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleForceScan = async (domainId) => {
    try {
      setScanningId(domainId);
      await superAdminApi.forceScanDomain(domainId);
      alert("Scan successfully queued in background.");
      loadDomains();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to initiate force scan"));
    } finally {
      setScanningId(null);
    }
  };

  return (
    <div className="sa-container">
      <div className="sa-card">
        <div className="sa-controls">
          <input
            type="text"
            className="sa-search-input"
            placeholder="Search domain names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="sa-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Verification Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="rejected">Rejected</option>
          </select>

          <button className="sa-btn sa-btn-secondary" onClick={loadDomains}>Refresh</button>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

        {loading ? (
          <div className="sa-empty" style={{ color: "#00d68f" }}>Loading domain records...</div>
        ) : (
          <div className={`sa-table-wrapper ${showPagination ? "sa-domains-table-wrapper" : ""}`}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Owner Email</th>
                  <th>Workspace</th>
                  <th>Verification</th>
                  <th>Security Score</th>
                  <th>Last Scan</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }} className="sa-empty">No domains found matching criteria.</td>
                  </tr>
                ) : (
                  paginatedDomains.map((d) => {
                    const owner = d.workspaceId?.owner;
                    const workspaceName = d.workspaceId?.name || "N/A";
                    const isVerified = d.verificationStatus === "verified";
                    return (
                      <tr key={d._id}>
                        <td style={{ fontWeight: 600, color: "#f8fafc" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Globe size={14} style={{ color: "#00d68f" }} />
                            {d.domain}
                          </div>
                        </td>
                        <td>{owner?.email || "Unknown"}</td>
                        <td>{workspaceName}</td>
                        <td>
                          <span className={`sa-badge ${isVerified ? "sa-badge-active" : "sa-badge-suspended"}`}>
                            {d.verificationStatus || "pending"}
                          </span>
                        </td>
                        <td>
                          <span
                            className="sa-badge"
                            style={{
                              background: d.score >= 80 ? "rgba(34,197,94,0.15)" : d.score >= 50 ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)",
                              color: d.score >= 80 ? "#22c55e" : d.score >= 50 ? "#facc15" : "#ef4444"
                            }}
                          >
                            {d.score} / 100 ({d.scoreLabel || "Not Scanned"})
                          </span>
                        </td>
                        <td>{d.lastScanAt ? new Date(d.lastScanAt).toLocaleString() : "Never Scanned"}</td>
                        <td>
                          <button
                            className="sa-btn"
                            disabled={scanningId === d._id || !isVerified}
                            onClick={() => handleForceScan(d._id)}
                            title={isVerified ? "Trigger Full Vulnerability Scan" : "Domain must be verified first"}
                          >
                            <RefreshCw size={12} className={scanningId === d._id ? "sa-spin" : ""} />
                            {scanningId === d._id ? "Queueing..." : "Force Scan"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && showPagination && (
          <div className="sa-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <div>
              {pageNumbers.map((page) => (
                <button
                  className={page === currentPage ? "active" : ""}
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
