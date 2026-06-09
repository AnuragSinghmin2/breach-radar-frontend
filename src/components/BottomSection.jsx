import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, FileText, Globe, Tag } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { domainApi } from "../services/api";
import "./bottom.css";

const guideSteps = [
  {
    icon: FileText,
    title: "File Upload",
    text: "Upload verification file to your domain root.",
  },
  {
    icon: Globe,
    title: "DNS TXT Record",
    text: "Add the generated TXT record in your DNS provider.",
  },
  {
    icon: Tag,
    title: "Meta Tag",
    text: "Place the secure scan meta tag inside your site head.",
  },
];

export default function BottomSection() {
  const navigate = useNavigate();
  const { notifications, refreshDomains, refreshStats } = useDashboard();
  const [domain, setDomain] = useState("");
  const [message, setMessage] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);

  async function handleAddDomain(event) {
    event.preventDefault();
    const value = domain.trim().toLowerCase();

    if (!value) {
      setMessage("Domain name required.");
      return;
    }

    try {
      await domainApi.addDomain({ domain: value });
      setMessage(`${value} added successfully.`);
      setDomain("");
      await Promise.all([refreshDomains(), refreshStats()]);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add domain.");
    }
  }

  return (
    <div className="bottom-container">
      <div className="bottom-card" id="add-domain">
        <h3>Add New Domain</h3>
        <p>Enter a domain to scan</p>

        <form className="domain-input" onSubmit={handleAddDomain}>
          <input
            placeholder="example.com"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
          />
          <button type="submit">Add Domain</button>
        </form>
        {message && <div className="dashboard-action-message">{message}</div>}
      </div>

      <div className="bottom-card">
        <h3>Domain Verification</h3>
        <p>Verify ownership of your domain</p>

        {guideSteps.map((item) => {
          const Icon = item.icon;

          return (
            <button className="verify-item" type="button" key={item.title}>
              <Icon size={16} />
              <span>
                <strong>{item.title}</strong>
                {guideOpen && <small>{item.text}</small>}
              </span>
            </button>
          );
        })}

        <button className="view-btn" type="button" onClick={() => setGuideOpen((open) => !open)}>
          {guideOpen ? "Hide Guide" : "View Guide"}
        </button>
      </div>

      <div className="bottom-card">
        <div className="card-header">
          <h3>Notifications</h3>
          <button type="button" onClick={() => navigate("/settings/notifications")}>
            View All
          </button>
        </div>

        {notifications.length === 0 && (
          <p className="dashboard-action-message">No recent activity yet.</p>
        )}

        {notifications.map((item) => (
          <button
            className={`notify-item ${item.tone}`}
            type="button"
            key={item.id}
            onClick={() => navigate(item.path)}
          >
            {item.tone === "success" && <CheckCircle size={15} />} {item.text}
          </button>
        ))}
      </div>

      <div className="bottom-card upgrade">
        <h3>Upgrade Your Plan</h3>
        <p>Unlock advanced features and scan more domains.</p>
        <button type="button" onClick={() => navigate("/settings/plan-billing")}>
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
