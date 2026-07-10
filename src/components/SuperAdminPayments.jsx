import { useEffect, useMemo, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { ChevronLeft, ChevronRight, DollarSign, CheckCircle, RotateCcw } from "lucide-react";
import "./SuperAdmin.css";

const PAYMENTS_PER_PAGE = 8;

export default function SuperAdminPayments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refundId, setRefundId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getPayments();
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load payment history"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const payments = data?.payments || [];
  const summary = data?.summary || { totalRevenue: 0, succeededCount: 0, refundedCount: 0 };
  const totalPages = Math.max(1, Math.ceil(payments.length / PAYMENTS_PER_PAGE));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * PAYMENTS_PER_PAGE;
    return payments.slice(start, start + PAYMENTS_PER_PAGE);
  }, [currentPage, payments]);
  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const halfWindow = Math.floor(maxVisiblePages / 2);
    const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - maxVisiblePages + 1));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);
  const showPagination = payments.length > PAYMENTS_PER_PAGE;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRefund = async (id) => {
    if (!window.confirm("Are you sure you want to refund this payment transaction? This will mark the record as refunded and updates ARR metrics.")) return;
    try {
      setRefundId(id);
      await superAdminApi.refundPayment(id);
      alert("Payment transaction successfully refunded.");
      loadPayments();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to issue refund"));
    } finally {
      setRefundId(null);
    }
  };

  if (loading && !data) {
    return <div className="sa-empty" style={{ color: "#00d68f", textAlign: "center", padding: "40px" }}>Loading financial ledger...</div>;
  }

  if (error) {
    return <div className="sa-empty" style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>{error}</div>;
  }

  return (
    <div className="sa-container">
      {/* Financial Summary */}
      <div className="sa-stats-grid">
        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ color: "#eab308", background: "rgba(234,179,8,0.1)" }}><DollarSign size={24} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-label">Net ARR Revenue</span>
            <span className="sa-stat-value">${summary.totalRevenue.toFixed(2)}</span>
          </div>
        </div>
        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ color: "#22c55e", background: "rgba(34,197,94,0.1)" }}><CheckCircle size={24} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-label">Successful Transactions</span>
            <span className="sa-stat-value">{summary.succeededCount}</span>
          </div>
        </div>
        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}><RotateCcw size={24} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-label">Refunded Transactions</span>
            <span className="sa-stat-value">{summary.refundedCount}</span>
          </div>
        </div>
      </div>

      <div className="sa-card">
        <div className="sa-card-header">
          <h3>Transaction History</h3>
          <button className="sa-btn sa-btn-secondary" onClick={loadPayments}>Refresh Ledger</button>
        </div>

        <div className={`sa-table-wrapper ${showPagination ? "sa-admin-table-paginated" : ""}`}>
          <table className="sa-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Transaction ID</th>
                <th>Price Tier Plan</th>
                <th>Amount Paid</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }} className="sa-empty">No payments registered.</td>
                </tr>
              ) : (
                paginatedPayments.map((p) => {
                  const isRefunded = p.status === "refunded";
                  return (
                    <tr key={p._id}>
                      <td>{p.userId?.email || "Unknown User"}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{p.transactionId}</td>
                      <td>{p.planName}</td>
                      <td style={{ color: isRefunded ? "#94a3b8" : "#22c55e", fontWeight: 700 }}>
                        {isRefunded ? "-" : ""}${p.amount.toFixed(2)}
                      </td>
                      <td>{new Date(p.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`sa-badge ${isRefunded ? "sa-badge-suspended" : "sa-badge-active"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {!isRefunded && (
                          <button
                            className="sa-btn sa-btn-danger"
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                            disabled={refundId === p._id}
                            onClick={() => handleRefund(p._id)}
                          >
                            <RotateCcw size={10} style={{ marginRight: "4px" }} />
                            {refundId === p._id ? "Processing..." : "Refund"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {showPagination && (
          <div className="sa-pagination">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
              <ChevronLeft size={14} /> Previous
            </button>
            <div>
              {pageNumbers.map((page) => (
                <button className={page === currentPage ? "active" : ""} type="button" key={page} onClick={() => setCurrentPage(page)} aria-current={page === currentPage ? "page" : undefined}>
                  {page}
                </button>
              ))}
            </div>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
