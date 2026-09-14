import { useEffect, useMemo, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Settings,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { formatCurrency } from "../utils/format";
import "./SuperAdmin.css";

const SUBSCRIPTIONS_PER_PAGE = 8;

export default function SuperAdminSubscriptions() {
  const [activeTab, setActiveTab] = useState("plans"); // 'plans' or 'customers'

  // Plans tier state
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plansPage, setPlansPage] = useState(1);

  // Customer subscriptions state
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersPage, setCustomersPage] = useState(1);

  // Plan creation / editing modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [billingInterval, setBillingInterval] = useState("month");
  const [domainLimit, setDomainLimit] = useState(1);
  const [scanLimit, setScanLimit] = useState(5);
  const [seatLimit, setSeatLimit] = useState(1);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [ctaText, setCtaText] = useState("Get Started");
  const [features, setFeatures] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  // Customer plan manual change state
  const [changingSub, setChangingSub] = useState(null);
  const [manualPlanName, setManualPlanName] = useState("");
  const [manualPlanSaving, setManualPlanSaving] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getSubscriptionPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load subscription plans"));
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      const data = await superAdminApi.getCustomerSubscriptions();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load customer subscriptions"));
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "plans") {
      setPlansPage(1);
      loadPlans();
    } else {
      setCustomersPage(1);
      loadCustomers();
    }
  }, [activeTab]);

  const plansTotalPages = Math.max(1, Math.ceil(plans.length / SUBSCRIPTIONS_PER_PAGE));
  const paginatedPlans = useMemo(() => {
    const start = (plansPage - 1) * SUBSCRIPTIONS_PER_PAGE;
    return plans.slice(start, start + SUBSCRIPTIONS_PER_PAGE);
  }, [plans, plansPage]);

  const plansPageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const halfWindow = Math.floor(maxVisiblePages / 2);
    const start = Math.max(1, Math.min(plansPage - halfWindow, plansTotalPages - maxVisiblePages + 1));
    const end = Math.min(plansTotalPages, start + maxVisiblePages - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [plansPage, plansTotalPages]);
  const showPlansPagination = plans.length > SUBSCRIPTIONS_PER_PAGE;

  const customersTotalPages = Math.max(1, Math.ceil(customers.length / SUBSCRIPTIONS_PER_PAGE));
  const paginatedCustomers = useMemo(() => {
    const start = (customersPage - 1) * SUBSCRIPTIONS_PER_PAGE;
    return customers.slice(start, start + SUBSCRIPTIONS_PER_PAGE);
  }, [customers, customersPage]);

  const customersPageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const halfWindow = Math.floor(maxVisiblePages / 2);
    const start = Math.max(1, Math.min(customersPage - halfWindow, customersTotalPages - maxVisiblePages + 1));
    const end = Math.min(customersTotalPages, start + maxVisiblePages - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [customersPage, customersTotalPages]);
  const showCustomersPagination = customers.length > SUBSCRIPTIONS_PER_PAGE;

  useEffect(() => {
    if (plansPage > plansTotalPages) {
      setPlansPage(plansTotalPages);
    }
  }, [plansPage, plansTotalPages]);

  useEffect(() => {
    if (customersPage > customersTotalPages) {
      setCustomersPage(customersTotalPages);
    }
  }, [customersPage, customersTotalPages]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName("");
    setDisplayName("");
    setDescription("");
    setPrice(0);
    setCurrency("INR");
    setBillingInterval("month");
    setDomainLimit(1);
    setScanLimit(5);
    setSeatLimit(1);
    setSortOrder(plans.length + 1);
    setIsActive(true);
    setIsPopular(false);
    setCtaText("Get Started");
    setFeatures("");
    setSubmitError("");
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setName(plan.name || "");
    setDisplayName(plan.displayName || plan.name || "");
    setDescription(plan.description || plan.desc || "");
    setPrice(plan.price !== undefined ? plan.price : 0);
    setCurrency(plan.currency || "INR");
    setBillingInterval(plan.billingInterval || "month");
    setDomainLimit(plan.domainLimit !== undefined ? plan.domainLimit : 1);
    setScanLimit(plan.scanLimit !== undefined ? plan.scanLimit : 5);
    setSeatLimit(plan.seatLimit !== undefined ? plan.seatLimit : 1);
    setSortOrder(plan.sortOrder !== undefined ? plan.sortOrder : 0);
    setIsActive(plan.isActive !== undefined ? plan.isActive : true);
    setIsPopular(Boolean(plan.isPopular || plan.popular));
    setCtaText(plan.ctaText || plan.cta || "Get Started");
    setFeatures(plan.features ? plan.features.join("\n") : "");
    setSubmitError("");
    setModalOpen(true);
  };

  const handleDelete = async (id, planName) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${planName}"? Existing subscribed users will remain on their current limits until manually adjusted.`)) return;
    try {
      await superAdminApi.deleteSubscriptionPlan(id);
      loadPlans();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete plan"));
    }
  };

  const handleTogglePlanStatus = async (plan) => {
    try {
      const nextStatus = !plan.isActive;
      await superAdminApi.toggleSubscriptionPlanStatus(plan._id, nextStatus);
      loadPlans();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update plan status"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSaving(true);

    const featuresList = features
      .split(/[\n,]+/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const planPayload = {
      name: name.trim(),
      displayName: displayName.trim() || name.trim(),
      description: description.trim(),
      price: Number(price),
      currency,
      billingInterval,
      domainLimit: Number(domainLimit),
      scanLimit: Number(scanLimit),
      seatLimit: Number(seatLimit),
      sortOrder: Number(sortOrder),
      isActive: Boolean(isActive),
      isPopular: Boolean(isPopular),
      ctaText: ctaText.trim() || (Number(price) === 0 ? "Get Started Free" : "Get Started"),
      features: featuresList
    };

    try {
      if (editingPlan) {
        await superAdminApi.updateSubscriptionPlan(editingPlan._id, planPayload);
      } else {
        await superAdminApi.createSubscriptionPlan(planPayload);
      }
      setModalOpen(false);
      loadPlans();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Failed to save subscription plan"));
    } finally {
      setSaving(false);
    }
  };

  const handleManualPlanChange = async (e) => {
    e.preventDefault();
    if (!changingSub) return;
    setManualPlanSaving(true);
    try {
      await superAdminApi.changeCustomerPlan(changingSub._id, manualPlanName);
      setChangingSub(null);
      loadCustomers();
      alert("Subscription plan manually updated.");
    } catch (err) {
      alert(getErrorMessage(err, "Failed to change customer plan"));
    } finally {
      setManualPlanSaving(false);
    }
  };

  const handleToggleStatus = async (sub, currentStatus) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    if (!window.confirm(`Are you sure you want to set subscription status to ${nextStatus}? Suspended subscriptions block scanning access.`)) return;
    try {
      await superAdminApi.updateCustomerSubscriptionStatus(sub._id, nextStatus);
      loadCustomers();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update subscription status"));
    }
  };

  return (
    <div className="sa-container">
      {/* Tab Selectors */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          className={activeTab === "plans" ? "sa-btn" : "sa-btn sa-btn-secondary"}
          onClick={() => setActiveTab("plans")}
        >
          SaaS Tier Packages
        </button>
        <button
          className={activeTab === "customers" ? "sa-btn" : "sa-btn sa-btn-secondary"}
          onClick={() => setActiveTab("customers")}
        >
          Customer Subscriptions
        </button>
      </div>

      {activeTab === "plans" ? (
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <h3>SaaS Pricing Tiers & Plans</h3>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px" }}>
                Active plans appear dynamically on the Landing Page and checkout.
              </p>
            </div>
            <button className="sa-btn" onClick={openCreateModal}>
              <Plus size={14} /> Create Plan
            </button>
          </div>

          {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

          {loading ? (
            <div className="sa-empty" style={{ color: "#00d68f" }}>Loading plans list...</div>
          ) : (
            <div className={`sa-table-wrapper ${showPlansPagination ? "sa-admin-table-paginated" : ""}`}>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Sort</th>
                    <th>Plan Name</th>
                    <th>Price / Interval</th>
                    <th>Limits (Domain / Scan / Seat)</th>
                    <th>Highlight</th>
                    <th>Status</th>
                    <th>Feature Highlights</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center" }} className="sa-empty">
                        No subscription plans defined. Click "Create Plan" to define one.
                      </td>
                    </tr>
                  ) : (
                    paginatedPlans.map((p) => (
                      <tr key={p._id}>
                        <td style={{ color: "#64748b", fontWeight: 600 }}>#{p.sortOrder || 0}</td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 700, color: "#f8fafc" }}>
                              {p.displayName || p.name}
                            </span>
                            {p.description && (
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                {p.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: "#eab308", fontWeight: 600 }}>
                          {p.price === 0 && p.name === "Enterprise"
                            ? "Custom"
                            : `${formatCurrency(p.price, p.currency || "INR")} / ${p.billingInterval === "year" ? "yr" : "mo"}`}
                        </td>
                        <td style={{ fontSize: "12px" }}>
                          <div>Domains: <strong>{p.domainLimit >= 999999 ? "Unlimited" : p.domainLimit}</strong></div>
                          <div>Scans: <strong>{p.scanLimit >= 999999 ? "Unlimited" : p.scanLimit}</strong></div>
                          <div>Seats: <strong>{p.seatLimit >= 999999 ? "Unlimited" : p.seatLimit}</strong></div>
                        </td>
                        <td>
                          {p.isPopular ? (
                            <span className="sa-badge" style={{ background: "rgba(234, 179, 8, 0.15)", color: "#eab308" }}>
                              <Star size={11} fill="#eab308" /> Popular
                            </span>
                          ) : (
                            <span style={{ color: "#64748b", fontSize: "12px" }}>—</span>
                          )}
                        </td>
                        <td>
                          <span className={`sa-badge ${p.isActive ? "sa-badge-active" : "sa-badge-suspended"}`}>
                            {p.isActive ? (
                              <><CheckCircle2 size={11} /> Active</>
                            ) : (
                              <><XCircle size={11} /> Inactive</>
                            )}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "260px" }}>
                            {p.features?.map((f, idx) => (
                              <span key={idx} className="sa-badge sa-badge-user" style={{ fontSize: "10px" }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="sa-btn sa-btn-secondary"
                              style={{ padding: "4px 8px" }}
                              onClick={() => openEditModal(p)}
                              title="Edit Plan Config"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              className={`sa-btn ${p.isActive ? "sa-btn-secondary" : "sa-btn"}`}
                              style={{ padding: "4px 8px" }}
                              onClick={() => handleTogglePlanStatus(p)}
                              title={p.isActive ? "Deactivate Plan (Hide from Landing Page)" : "Activate Plan (Show on Landing Page)"}
                            >
                              {p.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button
                              className="sa-btn sa-btn-danger"
                              style={{ padding: "4px 8px" }}
                              onClick={() => handleDelete(p._id, p.name)}
                              title="Delete Plan"
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
          {!loading && showPlansPagination && (
            <div className="sa-pagination">
              <button type="button" disabled={plansPage === 1} onClick={() => setPlansPage((page) => Math.max(1, page - 1))}>
                <ChevronLeft size={14} /> Previous
              </button>
              <div>
                {plansPageNumbers.map((page) => (
                  <button className={page === plansPage ? "active" : ""} type="button" key={page} onClick={() => setPlansPage(page)} aria-current={page === plansPage ? "page" : undefined}>
                    {page}
                  </button>
                ))}
              </div>
              <button type="button" disabled={plansPage === plansTotalPages} onClick={() => setPlansPage((page) => Math.min(plansTotalPages, page + 1))}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="sa-card">
          <div className="sa-card-header">
            <h3>Customer Subscriptions Ledger</h3>
            <button className="sa-btn sa-btn-secondary" onClick={loadCustomers}>Refresh Ledger</button>
          </div>

          {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

          {customersLoading ? (
            <div className="sa-empty" style={{ color: "#00d68f" }}>Loading active customer accounts...</div>
          ) : (
            <div className={`sa-table-wrapper ${showCustomersPagination ? "sa-admin-table-paginated" : ""}`}>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Owner Email</th>
                    <th>Current Plan</th>
                    <th>Billing Cycle</th>
                    <th>Billing Status</th>
                    <th>Started Date</th>
                    <th>Next Bill Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center" }} className="sa-empty">No active organization subscriptions found.</td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((c) => {
                      const isSuspended = c.status === "suspended";
                      return (
                        <tr key={c._id}>
                          <td style={{ fontWeight: 700, color: "#f8fafc" }}>{c.organizationId?.name || "N/A"}</td>
                          <td>{c.userId?.email || "N/A"}</td>
                          <td>
                            <span className="sa-badge" style={{ background: "rgba(0, 132, 255, 0.1)", color: "#3aa0ff" }}>
                              {c.currentPlan}
                            </span>
                          </td>
                          <td>{c.billingCycle}</td>
                          <td>
                            <span className={`sa-badge ${isSuspended ? "sa-badge-suspended" : "sa-badge-active"}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>{new Date(c.startDate).toLocaleDateString()}</td>
                          <td>{c.nextBillingDate ? new Date(c.nextBillingDate).toLocaleDateString() : "N/A"}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="sa-btn sa-btn-secondary"
                                style={{ padding: "4px 8px" }}
                                title="Change Plan manually"
                                onClick={() => {
                                  setChangingSub(c);
                                  setManualPlanName(c.currentPlan);
                                }}
                              >
                                <Settings size={12} />
                              </button>
                              <button
                                className={`sa-btn ${isSuspended ? "sa-btn-secondary" : "sa-btn-danger"}`}
                                style={{ padding: "4px 8px" }}
                                title={isSuspended ? "Reactivate Subscription" : "Suspend Subscription"}
                                onClick={() => handleToggleStatus(c, c.status)}
                              >
                                {isSuspended ? <UserCheck size={12} /> : <UserX size={12} />}
                              </button>
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
          {!customersLoading && showCustomersPagination && (
            <div className="sa-pagination">
              <button type="button" disabled={customersPage === 1} onClick={() => setCustomersPage((page) => Math.max(1, page - 1))}>
                <ChevronLeft size={14} /> Previous
              </button>
              <div>
                {customersPageNumbers.map((page) => (
                  <button className={page === customersPage ? "active" : ""} type="button" key={page} onClick={() => setCustomersPage(page)} aria-current={page === customersPage ? "page" : undefined}>
                    {page}
                  </button>
                ))}
              </div>
              <button type="button" disabled={customersPage === customersTotalPages} onClick={() => setCustomersPage((page) => Math.min(customersTotalPages, page + 1))}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Plan Creator modal */}
      {modalOpen && (
        <div className="sa-modal-backdrop">
          <div className="sa-modal" style={{ width: "min(620px, 95vw)" }}>
            <div className="sa-modal-header">
              <h3>{editingPlan ? `Edit Plan: ${editingPlan.displayName || editingPlan.name}` : "Create New Subscription Plan"}</h3>
              <button className="sa-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="sa-modal-body">
                {submitError && <div style={{ color: "#ef4444", fontSize: "13px" }}>{submitError}</div>}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="sa-form-group">
                    <label>Plan Key Name *</label>
                    <input
                      type="text"
                      required
                      className="sa-form-input"
                      placeholder="e.g. Starter, Professional, Business"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="sa-form-group">
                    <label>Display Title</label>
                    <input
                      type="text"
                      className="sa-form-input"
                      placeholder="e.g. Professional Plan"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sa-form-group">
                  <label>Subtitle / Description</label>
                  <input
                    type="text"
                    className="sa-form-input"
                    placeholder="e.g. Great for growing businesses"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div className="sa-form-group">
                    <label>Price (INR) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      className="sa-form-input"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="sa-form-group">
                    <label>Currency</label>
                    <input
                      type="text"
                      className="sa-form-input"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    />
                  </div>

                  <div className="sa-form-group">
                    <label>Interval</label>
                    <select
                      className="sa-select"
                      style={{ padding: "10px" }}
                      value={billingInterval}
                      onChange={(e) => setBillingInterval(e.target.value)}
                    >
                      <option value="month">Monthly (/mo)</option>
                      <option value="year">Yearly (/yr)</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                  <div className="sa-form-group">
                    <label title=">= 999999 for Unlimited">Domains Limit *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      className="sa-form-input"
                      placeholder="1"
                      value={domainLimit}
                      onChange={(e) => setDomainLimit(e.target.value)}
                    />
                  </div>

                  <div className="sa-form-group">
                    <label title=">= 999999 for Unlimited">Scans Limit *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      className="sa-form-input"
                      placeholder="5"
                      value={scanLimit}
                      onChange={(e) => setScanLimit(e.target.value)}
                    />
                  </div>

                  <div className="sa-form-group">
                    <label title=">= 999999 for Unlimited">Seats Limit</label>
                    <input
                      type="number"
                      min={0}
                      className="sa-form-input"
                      placeholder="1"
                      value={seatLimit}
                      onChange={(e) => setSeatLimit(e.target.value)}
                    />
                  </div>

                  <div className="sa-form-group">
                    <label>Sort Order</label>
                    <input
                      type="number"
                      min={0}
                      className="sa-form-input"
                      placeholder="1"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="sa-form-group">
                    <label>Button CTA Text</label>
                    <input
                      type="text"
                      className="sa-form-input"
                      placeholder="e.g. Get Started / Get Started Free"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "20px", alignItems: "center", paddingTop: "18px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#dbe3ee", fontSize: "13px" }}>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      Active (Published)
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#eab308", fontSize: "13px" }}>
                      <input
                        type="checkbox"
                        checked={isPopular}
                        onChange={(e) => setIsPopular(e.target.checked)}
                      />
                      Most Popular Badge
                    </label>
                  </div>
                </div>

                <div className="sa-form-group">
                  <label>Features List (one per line or comma-separated)</label>
                  <textarea
                    rows={4}
                    className="sa-form-input"
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                    placeholder="1 User Seat&#10;1 Verified Domain&#10;2 Scans / month&#10;Basic Reports&#10;Community Support"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                  />
                </div>
              </div>
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn sa-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sa-btn" disabled={saving}>
                  {saving ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Change Customer Plan Modal */}
      {changingSub && (
        <div className="sa-modal-backdrop">
          <div className="sa-modal">
            <div className="sa-modal-header">
              <h3>Manual Plan Change: {changingSub.organizationId?.name}</h3>
              <button className="sa-modal-close" onClick={() => setChangingSub(null)}>✕</button>
            </div>
            <form onSubmit={handleManualPlanChange}>
              <div className="sa-modal-body">
                <p style={{ color: "#aeb8c7", fontSize: "13px" }}>
                  Override the customer subscription plan manually. This overrides their workspace seat and domain limits.
                </p>
                <div className="sa-form-group">
                  <label>Select Target Plan</label>
                  <select
                    className="sa-select"
                    value={manualPlanName}
                    onChange={(e) => setManualPlanName(e.target.value)}
                  >
                    {plans.map((p) => (
                      <option key={p._id || p.name} value={p.name}>
                        {p.displayName || p.name} ({formatCurrency(p.price, p.currency || "INR")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn sa-btn-secondary" onClick={() => setChangingSub(null)}>
                  Cancel
                </button>
                <button type="submit" className="sa-btn" disabled={manualPlanSaving}>
                  {manualPlanSaving ? "Saving..." : "Change Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
