import { useEffect, useMemo, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { ChevronLeft, ChevronRight, Edit2, Trash2, UserX, UserCheck } from "lucide-react";
import "./SuperAdmin.css";

const USERS_PER_PAGE = 8;

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  // Editing User Modal state
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [submitError, setSubmitError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getUsers({ search, role, status });
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load user list"));
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const p = await superAdminApi.getSubscriptionPlans();
      setPlans(p);
    } catch (err) {
      logger.error("Failed to load subscription plans: " + err.message);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadData();
    loadPlans();
  }, [search, role, status]);

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return users.slice(start, start + USERS_PER_PAGE);
  }, [currentPage, users]);
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
  const showPagination = users.length > USERS_PER_PAGE;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (!window.confirm(`Are you sure you want to change this user status to ${nextStatus}?`)) return;
    try {
      await superAdminApi.updateUserStatus(id, nextStatus);
      loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update user status"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user, their workspaces, and all domains/scans? This action cannot be undone.")) return;
    try {
      await superAdminApi.deleteUser(id);
      loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete user"));
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewPlan(user.profile?.plan || "Free");
    setSubmitError("");
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    try {
      // 1. Update role if changed
      if (newRole !== editingUser.role) {
        await superAdminApi.updateUserRole(editingUser._id, newRole);
      }
      // 2. Update plan if changed
      if (newPlan !== (editingUser.profile?.plan || "Free")) {
        await superAdminApi.upgradeUserSubscription(editingUser._id, newPlan);
      }
      setEditingUser(null);
      loadData();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Failed to update user parameters"));
    }
  };

  return (
    <div className="sa-container">
      {/* Search & Filters */}
      <div className="sa-card">
        <div className="sa-controls">
          <input
            type="text"
            className="sa-search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="sa-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select className="sa-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <button className="sa-btn sa-btn-secondary" onClick={loadData}>Refresh</button>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

        {loading ? (
          <div className="sa-empty" style={{ color: "#00d68f" }}>Loading user accounts...</div>
        ) : (
          <div className={`sa-table-wrapper ${showPagination ? "sa-users-table-wrapper" : ""}`}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Domains</th>
                  <th>Scans</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center" }} className="sa-empty">No users found matching query filters.</td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u._id}>
                      <td>{u.profile?.name || "N/A"}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`sa-badge sa-badge-${u.role?.replace("_", "")}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className="sa-badge" style={{ background: "rgba(234,179,8,0.1)", color: "#eab308" }}>
                          {u.profile?.plan || "Free"}
                        </span>
                      </td>
                      <td>
                        <span className={`sa-badge ${u.status === "active" ? "sa-badge-active" : "sa-badge-suspended"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>{u.domainCount || 0}</td>
                      <td>{u.scanCount || 0}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="sa-btn sa-btn-secondary"
                            style={{ padding: "4px 8px" }}
                            title="Edit Role & Plan"
                            onClick={() => openEditModal(u)}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className={`sa-btn ${u.status === "active" ? "sa-btn-danger" : "sa-btn-secondary"}`}
                            style={{ padding: "4px 8px" }}
                            title={u.status === "active" ? "Suspend Account" : "Activate Account"}
                            onClick={() => toggleStatus(u._id, u.status)}
                          >
                            {u.status === "active" ? <UserX size={12} /> : <UserCheck size={12} />}
                          </button>
                          <button
                            className="sa-btn sa-btn-danger"
                            style={{ padding: "4px 8px" }}
                            title="Delete Account"
                            onClick={() => handleDelete(u._id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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

      {/* Editing User Modal */}
      {editingUser && (
        <div className="sa-modal-backdrop">
          <div className="sa-modal">
            <div className="sa-modal-header">
              <h3>Edit User Config: {editingUser.email}</h3>
              <button className="sa-modal-close" onClick={() => setEditingUser(null)}>X</button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="sa-modal-body">
                {submitError && <div style={{ color: "#ef4444" }}>{submitError}</div>}

                <div className="sa-form-group">
                  <label>Assign Role</label>
                  <select
                    className="sa-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="user">User (Standard Access)</option>
                    <option value="admin">Admin (Staff Access)</option>
                    <option value="super_admin">Super Admin (System Owner)</option>
                  </select>
                </div>

                <div className="sa-form-group">
                  <label>Subscription Plan</label>
                  <select
                    className="sa-select"
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                  >
                    <option value="Free">Free Plan</option>
                    {plans.map(p => (
                      <option key={p._id} value={p.name}>{p.name} (${p.price}/mo)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn sa-btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="sa-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
