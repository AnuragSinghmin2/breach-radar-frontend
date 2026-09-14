import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radar,
  Globe2,
  CreditCard,
  X,
  Check,
  Trash2,
  ExternalLink,
  Loader2
} from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from "../services/api/notificationService";
import "./NotificationDropdown.css";

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function getNotificationMeta(type = "") {
  const upper = (type || "").toUpperCase();

  if (upper.includes("CRITICAL") || upper.includes("VULNERABILITY") && upper.includes("HIGH")) {
    return {
      icon: ShieldAlert,
      tone: "critical",
      badge: "Critical Alert",
      link: "/dashboard/vulnerabilities"
    };
  }
  if (upper.includes("HIGH") || upper.includes("ALERT")) {
    return {
      icon: AlertTriangle,
      tone: "warning",
      badge: "Security Alert",
      link: "/dashboard/vulnerabilities"
    };
  }
  if (upper.includes("SCAN_STARTED")) {
    return {
      icon: Radar,
      tone: "info",
      badge: "Scan In Progress",
      link: "/dashboard/scans"
    };
  }
  if (upper.includes("SCAN_COMPLETED")) {
    return {
      icon: ShieldCheck,
      tone: "success",
      badge: "Scan Finished",
      link: "/dashboard/scans"
    };
  }
  if (upper.includes("SCAN_FAILED")) {
    return {
      icon: AlertTriangle,
      tone: "critical",
      badge: "Scan Error",
      link: "/dashboard/scans"
    };
  }
  if (upper.includes("DOMAIN")) {
    return {
      icon: Globe2,
      tone: "success",
      badge: "Domain Update",
      link: "/dashboard/domains"
    };
  }
  if (upper.includes("PLAN") || upper.includes("INVOICE") || upper.includes("PAYMENT") || upper.includes("SUBSCRIPTION")) {
    return {
      icon: CreditCard,
      tone: "purple",
      badge: "Billing",
      link: "/dashboard/settings/plan-billing"
    };
  }

  return {
    icon: Bell,
    tone: "info",
    badge: "Notification",
    link: "/dashboard"
  };
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const fetchList = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.debug("[NotificationDropdown] Failed to fetch notifications:", err?.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load + real-time interval polling
  useEffect(() => {
    fetchList(false);
    const timer = setInterval(() => {
      fetchList(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchList]);

  // Handle outside click & escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadList = notifications.filter((n) => !n.readAt);
  const unreadCount = unreadList.length;

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date() } : n))
      );
      await markAsRead(id);
    } catch (err) {
      console.error("[NotificationDropdown] Mark as read failed:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date() }))
      );
      await markAllAsRead();
    } catch (err) {
      console.error("[NotificationDropdown] Mark all read failed:", err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      await deleteNotification(id);
    } catch (err) {
      console.error("[NotificationDropdown] Delete failed:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      setNotifications([]);
      await clearAllNotifications();
    } catch (err) {
      console.error("[NotificationDropdown] Clear all failed:", err);
    }
  };

  const handleItemClick = (item) => {
    if (!item.readAt) {
      handleMarkAsRead(item._id);
    }
    const meta = getNotificationMeta(item.type);
    setIsOpen(false);
    if (meta.link) {
      navigate(meta.link);
    }
  };

  const displayedList = filter === "unread" ? unreadList : notifications;

  return (
    <div className="notif-dropdown-wrapper" ref={containerRef}>
      <button
        className={`icon-btn notif-bell-btn ${isOpen ? "active" : ""} ${unreadCount > 0 ? "has-unread" : ""}`}
        type="button"
        aria-label={`Notifications (${unreadCount} unread)`}
        title="Notifications"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) fetchList(true);
        }}
      >
        <Bell className="icon" />
        {unreadCount > 0 && (
          <span className="notif-badge-pill" aria-label={`${unreadCount} unread`}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown-menu" role="dialog" aria-label="Notifications panel">
          {/* Header */}
          <div className="notif-menu-header">
            <div className="notif-title-area">
              <h4>Notifications</h4>
              {unreadCount > 0 ? (
                <span className="notif-unread-chip">{unreadCount} New</span>
              ) : (
                <span className="notif-read-chip">All caught up</span>
              )}
            </div>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button
                  className="notif-action-text-btn"
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="notif-icon-small-btn"
                  type="button"
                  onClick={handleClearAll}
                  title="Clear all notifications"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="notif-tabs">
            <button
              className={`notif-tab ${filter === "all" ? "active" : ""}`}
              type="button"
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              className={`notif-tab ${filter === "unread" ? "active" : ""}`}
              type="button"
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* List content */}
          <div className="notif-list-scroll">
            {loading && notifications.length === 0 ? (
              <div className="notif-empty-state">
                <Loader2 className="notif-spin" size={24} />
                <p>Loading alerts...</p>
              </div>
            ) : displayedList.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-empty-icon-wrap">
                  <ShieldCheck size={28} />
                </div>
                <h5>No notifications</h5>
                <p>
                  {filter === "unread"
                    ? "You have read all your notifications."
                    : "Important scan results, domain alerts, and security reports will show up here."}
                </p>
              </div>
            ) : (
              displayedList.map((item) => {
                const meta = getNotificationMeta(item.type);
                const Icon = meta.icon;
                const isUnread = !item.readAt;

                return (
                  <div
                    key={item._id}
                    className={`notif-item ${isUnread ? "unread" : "read"} tone-${meta.tone}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className={`notif-item-icon-box ${meta.tone}`}>
                      <Icon size={16} />
                    </div>

                    <div className="notif-item-body">
                      <div className="notif-item-top">
                        <span className="notif-item-title">{item.title}</span>
                        <span className="notif-item-time">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="notif-item-message">{item.message}</p>
                      <div className="notif-item-footer">
                        <span className={`notif-type-tag ${meta.tone}`}>
                          {meta.badge}
                        </span>
                        <span className="notif-view-link">
                          View details <ExternalLink size={10} />
                        </span>
                      </div>
                    </div>

                    <div className="notif-item-controls">
                      {isUnread && (
                        <button
                          className="notif-control-btn mark-read"
                          type="button"
                          title="Mark as read"
                          onClick={(e) => handleMarkAsRead(item._id, e)}
                        >
                          <Check size={13} />
                        </button>
                      )}
                      <button
                        className="notif-control-btn dismiss"
                        type="button"
                        title="Dismiss"
                        onClick={(e) => handleDelete(item._id, e)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
