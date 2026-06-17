import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { Plus, Edit2, Trash2, CheckCircle2, UserCheck, UserX, Settings } from "lucide-react";
import "./SuperAdmin.css";

export default function SuperAdminSubscriptions() {
  const [activeTab, setActiveTab] = useState("plans"); // 'plans' or 'customers'
  
  // Plans tier state
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Customer subscriptions state
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Plan creation / editing modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [domainLimit, setDomainLimit] = useState(0);
  const [scanLimit, setScanLimit] = useState(0);
  const [features, setFeatures] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Customer plan manual change state
  const [changingSub, setChangingSub] = useState(null);
  const [manualPlanName, setManualPlanName] = useState("");
  const [manualPlanSaving, setManualPlanSaving] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getSubscriptionPlans();
      setPlans(data);
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
      setCustomers(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load customer subscriptions"));
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "plans") {
      loadPlans();
    } else {
      loadCustomers();
    }
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName("");
    setPrice(0);
    setDomainLimit(0);
    setScanLimit(0);
    setFeatures("");
    setSubmitError("");
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.price);
    setDomainLimit(plan.domainLimit);
    setScanLimit(plan.scanLimit);
    setFeatures(plan.features ? plan.features.join(", ") : "");
    setSubmitError("");
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan? Existing subscribed users will remain on their current limits until manually upgraded.")) return;
    try {
      await superAdminApi.deleteSubscriptionPlan(id);
      loadPlans();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete plan"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const featuresList = features.split(",").map(f => f.trim()).filter(f => f.length > 0);
    const planPayload = {
      name,
      price: Number(price),
      domainLimit: Number(domainLimit),
      scanLimit: Number(scanLimit),
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
            <h3>SaaS Plan Tiers</h3>
            <button className="sa-btn" onClick={openCreateModal}>
              <Plus size={14} /> Create Plan
            </button>
          </div>

          {error && <div style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</div>}

          {loading ? (
            <div className="sa-empty" style={{ color: "#00d68f" }}>Loading plans list...</div>
          ) : (
            <div className="sa-table-wrapper">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Price / Month</th>
                    <th>Domain Limit</th>
                    <th>Scan Limit</th>
                    <th>Feature Highlights</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }} className="sa-empty">No subscription plans defined. Click "Create Plan" to define one.</td>
                    </tr>
                  ) : (
                    plans.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 700, color: "#f8fafc" }}>{p.name}</td>
                        <td style={{ color: "#eab308", fontWeight: 600 }}>
                          {p.price === 0 && p.name === 'Enterprise' ? 'Custom' : `₹${p.price}`}
                        </td>
                        <td>{p.domainLimit >= 999999 ? 'Unlimited' : p.domainLimit}</td>
                        <td>{p.scanLimit >= 999999 ? 'Unlimited' : p.scanLimit}</td>
                        <td>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {p.features?.map((f, idx) => (
                              <span key={idx} className="sa-badge sa-badge-user" style={{ fontSize: "10px" }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="sa-btn sa-btn-secondary"
                              style={{ padding: "4px 8px" }}
                              onClick={() => openEditModal(p)}
                              title="Edit Plan Config"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              className="sa-btn sa-btn-danger"
                              style={{ padding: "4px 8px" }}
                              onClick={() => handleDelete(p._id)}
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
            <div className="sa-table-wrapper">
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
                    customers.map((c) => {
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
        </div>
      )}

      {/* Plan Creator modal */}
      {modalOpen && (
        <div className="sa-modal-backdrop">
          <div className="sa-modal">
            <div className="sa-modal-header">
              <h3>{editingPlan ? `Edit Plan Config: ${editingPlan.name}` : "Create New Subscription Plan"}</h3>
              <button className="sa-modal-close" onClick={() => setModalOpen(false)}>X</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="sa-modal-body">
                {submitError && <div style={{ color: "#ef4444" }}>{submitError}</div>}

                <div className="sa-form-group">
                  <label>Plan Name</label>
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
                  <label>Monthly Price (INR)</label>
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
                  <label>Max Domains Limit</label>
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
                  <label>Max Monthly Scans Limit</label>
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
                  <label>Features List (comma-separated)</label>
                  <textarea
                    rows={3}
                    className="sa-form-input"
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                    placeholder="e.g. SSL scans, Email alerts, Priority support"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                  />
                </div>
              </div>
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn sa-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sa-btn">
                  Save PlanConfig
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
              <button className="sa-modal-close" onClick={() => setChangingSub(null)}>X</button>
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
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Business">Business</option>
                    <option value="Enterprise">Enterprise</option>
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
