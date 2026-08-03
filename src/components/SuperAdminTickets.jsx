import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import { Check, ExternalLink, Image, Paperclip, Send, UserPlus } from "lucide-react";
import { getApiOrigin } from "../utils/apiBase";
import "./SuperAdmin.css";

function resolveAttachmentUrl(attachment = "") {
  const rawAttachment = typeof attachment === "string" ? attachment : attachment?.url || "";
  if (!rawAttachment) return "";
  if (/^https?:\/\//i.test(rawAttachment)) return rawAttachment;

  const normalizedAttachment = (rawAttachment.startsWith("/") ? rawAttachment : `/${rawAttachment}`)
    .replace(/^\/uploads\/support\//, "/uploads/support-tickets/");
  return `${getApiOrigin()}${normalizedAttachment}`;
}

function getAttachmentName(attachment = "") {
  if (!attachment) return "";
  if (typeof attachment === "object") {
    return attachment.originalName || attachment.storedName || "Attachment";
  }
  return String(attachment).split("/").pop() || "Attachment";
}

function isImageAttachment(attachment = "") {
  const value = typeof attachment === "object"
    ? `${attachment.mimeType || ""} ${attachment.url || attachment.originalName || attachment.storedName || ""}`
    : String(attachment);

  return /image\/|\.jpe?g($|\?)|\.png($|\?)|\.webp($|\?)/i.test(value);
}

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

  const attachmentUrl = resolveAttachmentUrl(activeTicket?.attachment);
  const attachmentName = getAttachmentName(activeTicket?.attachment);
  const showImagePreview = isImageAttachment(activeTicket?.attachment);

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
                        <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: t.priority === "High" ? "#ff4545" : t.priority === "Medium" ? "#f97316" : "#cbd5e1" }}>
                          {t.priority} priority
                        </span>
                        <span className={`sa-badge ${t.status === "Closed" || t.status === "Resolved" ? "sa-badge-active" : t.status === "In Progress" ? "sa-badge-admin" : "sa-badge-suspended"}`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "14px" }}>{t.subject}</h4>
                      <p style={{ fontSize: "12px", color: "#94a3b8", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {t.message}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                        <span>From: {t.name ? `${t.name} (${t.email})` : t.email || "Unknown"}</span>
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
                  <h3 style={{ margin: 0, color: "#f8fafc" }}>{activeTicket.subject}</h3>
                  <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    {activeTicket.name} · {activeTicket.email}{activeTicket.company ? ` · ${activeTicket.company}` : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {activeTicket.status !== "In Progress" && activeTicket.status !== "Closed" && activeTicket.status !== "Resolved" && (
                    <button className="sa-btn sa-btn-secondary" onClick={() => handleAssign(activeTicket._id)}>
                      <UserPlus size={14} /> Claim
                    </button>
                  )}
                  {activeTicket.status !== "Closed" && activeTicket.status !== "Resolved" && (
                    <button className="sa-btn" onClick={() => handleResolve(activeTicket._id)}>
                      <Check size={14} /> Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages: the backend only stores the original message + an appended adminNotes trail (no per-message array) */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", padding: "10px", maxHeight: "380px" }}>
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "#071321",
                    border: "1px solid rgba(42, 69, 96, 0.4)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    maxWidth: "80%",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, marginBottom: "4px" }}>
                    {activeTicket.name || "Customer"}
                  </span>
                  <p style={{ fontSize: "13px", color: "#cbd5e1", margin: 0, whiteSpace: "pre-wrap" }}>{activeTicket.message}</p>
                  {attachmentUrl && (
                    <div style={{ marginTop: "12px", borderTop: "1px solid rgba(42, 69, 96, 0.45)", paddingTop: "10px" }}>
                      {showImagePreview && (
                        <a href={attachmentUrl} target="_blank" rel="noreferrer" style={{ display: "block", marginBottom: "8px" }}>
                          <img
                            src={attachmentUrl}
                            alt={attachmentName}
                            style={{ maxWidth: "220px", maxHeight: "160px", width: "100%", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(148, 163, 184, 0.25)" }}
                          />
                        </a>
                      )}
                      <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#00d68f", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}
                      >
                        {showImagePreview ? <Image size={14} /> : <Paperclip size={14} />}
                        {attachmentName}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
                {activeTicket.adminNotes && activeTicket.adminNotes.split("\n\n").filter(Boolean).map((note, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: "flex-end",
                      background: "rgba(0, 214, 143, 0.1)",
                      border: "1px solid #00d68f",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      maxWidth: "80%",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <span style={{ fontSize: "10px", color: "#00d68f", fontWeight: 700, marginBottom: "4px" }}>
                      Support Agent
                    </span>
                    <p style={{ fontSize: "13px", color: "#cbd5e1", margin: 0, whiteSpace: "pre-wrap" }}>{note}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {activeTicket.status !== "Closed" && activeTicket.status !== "Resolved" ? (
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
