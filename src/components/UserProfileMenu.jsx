import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Key, LogOut, User } from "lucide-react";
import { getInitials, resolveAvatarUrl } from "../utils/profile";
import "./UserProfileMenu.css";

export default function UserProfileMenu({ user, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const containerRef = useRef(null);

  const avatarUrl = !avatarBroken ? resolveAvatarUrl(user?.profile?.avatar) : "";
  const initials = getInitials(user?.profile?.name, user?.email);

  useEffect(() => {
    setAvatarBroken(false);
  }, [user?.profile?.avatar]);

  useEffect(() => {
    if (!open) return undefined;

    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function goTo(path) {
    setOpen(false);
    navigate(path);
  }

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        className="user-menu-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="user-avatar user-menu-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" onError={() => setAvatarBroken(true)} />
          ) : (
            <span>{initials}</span>
          )}
        </span>
        <span className="user-menu-trigger-copy">
          <strong>{user?.profile?.name || "Account"}</strong>
        </span>
        <ChevronDown size={15} className={open ? "user-menu-chevron open" : "user-menu-chevron"} />
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-dropdown-head">
            <span className="user-avatar user-menu-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" onError={() => setAvatarBroken(true)} />
              ) : (
                <span>{initials}</span>
              )}
            </span>
            <span>
              <strong>{user?.profile?.name || "Account"}</strong>
              <small>{user?.email}</small>
            </span>
          </div>

          <button type="button" role="menuitem" onClick={() => goTo("/dashboard/settings/profile")}>
            <User size={16} />
            <span>My Profile</span>
          </button>
          <button type="button" role="menuitem" onClick={() => goTo("/dashboard/settings/security")}>
            <Key size={16} />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="user-menu-logout"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}