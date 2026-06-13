import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { MessageSquare, Check, UserPlus, Send, CornerDownRight } from "lucide-react";
import "./SuperAdmin.css";

export default function SuperAdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");

  // Chat window state
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getSupportTickets({ status });
      setTickets(data);
      // Keep selected ticket refreshed
      if (activeTicket) {
        const refreshed = data.find(t => t._id === activeTicket._id);
        if (refreshed) setActiveTicket(refreshed);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load support tickets"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [status]);

  const handleAssign = async (id) => {
    try {
      await superAdminApi.assignSupportTicket(id);
      loadTickets();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to assign support ticket"));
    }
  };

  const handleResolve = async (id) => {
    try {
      await superAdminApi.resolveSupportTicket(id);
      loadTickets();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to resolve support ticket"));
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      setSendingReply(true);
      await superAdminApi.replySupportTicket(activeTicket._id, replyMessage);
      setReplyMessage("");
      loadTickets();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to send message reply"));
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="sa-container">
      <div className="sa-dashboard-grid">
        {/* Ticket List Column */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h3>Support Tickets Queue</h3>
            <select className="sa-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="closed">Resolved (Closed)</option>
            </select>
          </div>

          {error && <div style={{ color: "#ef4444" }}>{error}</div>}

          {loading && tickets.length === 0 ? (
            <div className="sa-empty" style={{ color: "#00d68f" }}>Loading tickets...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "600px", overflowY: "auto" }}>
              {tickets.length === 0 ? (
                <div className="sa-empty">No support tickets found.</div>
              ) : (
                tickets.map((t) => {
                  const isActive = activeTicket?._id === t._id;
                  return (
                    <div
                      key={t._id}
                      onClick={() => setActiveTicket(t)}
                      style={{
                        padding: "16px",
                        background: isActive ? "rgba(0, 214, 143, 0.08)" : "#071321",
                        border: `1px solid ${isActive ? "#00d68f" : "rgba(42, 69, 96, 0.5)"}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: t.priority === "critical" ? "#ff4545" : t.priority === "high" ? "#f97316" : "#cbd5e1" }}>
                          {t.priority} priority
                        </span>
                        <span className={`sa-badge ${t.status === "closed" ? "sa-badge-active" : t.status === "assigned" ? "sa-badge-admin" : "sa-badge-suspended"}`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "14px" }}>{t.title}</h4>
                      <p style={{ fontSize: "12px", color: "#94a3b8", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {t.description}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                        <span>From: {t.userId?.email || "Unknown"}</span>
                        <span>Assigned to: {t.assignedTo?.profile?.name || "Unassigned"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Chat / Ticket Detail Column */}
        <div className="sa-card" style={{ display: "flex", flexDirection: "column", minHeight: "500px" }}>
          {activeTicket ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>
              {/* Active Ticket Header */}
              <div style={{ borderBottom: "1px solid rgba(42, 69, 96, 0.5)", paddingBottom: "16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#f8fafc" }}>{activeTicket.title}</h3>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>{activeTicket.description}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {activeTicket.status !== "assigned" && activeTicket.status !== "closed" && (
                    <button className="sa-btn sa-btn-secondary" onClick={() => handleAssign(activeTicket._id)}>
                      <UserPlus size={14} /> Claim
                    </button>
                  )}
                  {activeTicket.status !== "closed" && (
                    <button className="sa-btn" onClick={() => handleResolve(activeTicket._id)}>
                      <Check size={14} /> Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", padding: "10px", maxHeight: "380px" }}>
                {activeTicket.messages?.map((msg, idx) => {
                  // If senderId matches user profile, it's support message. Let's color accordingly
                  const isAgent = msg.senderId === activeTicket.assignedTo?._id || msg.senderName === "Breach Radar Super Admin" || msg.senderName === "Support Agent" || msg.senderName.includes("Super Admin");
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isAgent ? "flex-end" : "flex-start",
                        background: isAgent ? "rgba(0, 214, 143, 0.1)" : "#071321",
                        border: `1px solid ${isAgent ? "#00d68f" : "rgba(42, 69, 96, 0.4)"}`,
                        borderRadius: "8px",
                        padding: "10px 14px",
                        maxWidth: "80%",
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      <span style={{ fontSize: "10px", color: "#00d68f", fontWeight: 700, marginBottom: "4px" }}>
                        {msg.senderName}
                      </span>
                      <p style={{ fontSize: "13px", color: "#cbd5e1", margin: 0 }}>{msg.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              {activeTicket.status !== "closed" ? (
                <form onSubmit={handleSendReply} style={{ display: "flex", gap: "10px", marginTop: "16px", borderTop: "1px solid rgba(42, 69, 96, 0.4)", paddingTop: "16px" }}>
                  <input
                    type="text"
                    className="sa-search-input"
                    placeholder="Type support reply message..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    disabled={sendingReply}
                  />
                  <button type="submit" className="sa-btn" disabled={sendingReply || !replyMessage.trim()}>
                    <Send size={14} /> {sendingReply ? "Sending..." : "Send"}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px", borderTop: "1px solid rgba(42, 69, 96, 0.4)", marginTop: "16px" }}>
                  This ticket is marked resolved and closed.
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, display: "grid", placeItems: "center", color: "#94a3b8", fontSize: "14px" }}>
              Select a support ticket from the list to view conversations and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
