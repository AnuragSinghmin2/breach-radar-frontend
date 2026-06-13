import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import "./SuperAdmin.css";

export default function SuperAdminSubscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Plan creation / editing modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [domainLimit, setDomainLimit] = useState(0);
  const [scanLimit, setScanLimit] = useState(0);
  const [features, setFeatures] = useState("");
  const [submitError, setSubmitError] = useState("");

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

  useEffect(() => {
    loadPlans();
  }, []);

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

  return (
    <div className="sa-container">
      <div className="sa-card">
        <div className="sa-card-header">
          <h3>SaaS Tier Packages</h3>
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
                      <td style={{ color: "#eab308", fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                      <td>{p.domainLimit}</td>
                      <td>{p.scanLimit}</td>
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

      {/* Create / Edit Plan Modal */}
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
                    placeholder="e.g. Starter, Pro, Enterprise"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="sa-form-group">
                  <label>Monthly Price ($ USD)</label>
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
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
