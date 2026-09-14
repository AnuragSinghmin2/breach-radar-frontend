import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, KeyRound, LogOut, UserRound } from "lucide-react";
import { getInitials, resolveAvatarUrl } from "../utils/profile";
import "./AdminProfile.css";

export default function AdminProfileMenu({ user, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const containerRef = useRef(null);

  const avatarUrl = !avatarBroken ? resolveAvatarUrl(user?.profile?.avatar) : "";
  const initials = getInitials(user?.profile?.name, user?.email);
  const roleLabel = user?.role === "super_admin" ? "Super Admin" : "Admin";

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
    <div className="admin-profile-menu" ref={containerRef}>
      <button
        className="admin-profile-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="user-avatar admin-profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="" onError={() => setAvatarBroken(true)} /> : <span>{initials}</span>}
        </span>
        <span className="admin-profile-trigger-copy">
          <strong>{user?.profile?.name || "Admin"}</strong>
          <small>{roleLabel}</small>
        </span>
        <ChevronDown size={15} className={open ? "admin-profile-chevron open" : "admin-profile-chevron"} />
      </button>

      {open && (
        <div className="admin-profile-dropdown" role="menu">
          <div className="admin-profile-dropdown-head">
            <span className="user-avatar admin-profile-avatar">
              {avatarUrl ? <img src={avatarUrl} alt="" onError={() => setAvatarBroken(true)} /> : <span>{initials}</span>}
            </span>
            <span>
              <strong>{user?.profile?.name || "Admin"}</strong>
              <small>{user?.email}</small>
            </span>
          </div>

          <button type="button" role="menuitem" onClick={() => goTo("/super-admin/profile")}>
            <UserRound size={16} />
            <span>My Profile</span>
          </button>
          <button type="button" role="menuitem" onClick={() => goTo("/super-admin/change-password")}>
            <KeyRound size={16} />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="admin-profile-logout"
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