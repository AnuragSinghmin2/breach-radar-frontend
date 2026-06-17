import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, teamApi } from "../services/api";
import { formatAccountDate } from "../utils/profile";
import "./InvitePage.css";

const PENDING_INVITE_TOKEN_KEY = "pendingInviteToken";
const TEAM_SETTINGS_PATH = "/dashboard/settings/team";

function InviteSkeleton() {
  return (
    <div className="invite-card">
      <div className="invite-skeleton invite-title-skeleton" />
      <div className="invite-skeleton" />
      <div className="invite-skeleton" />
      <div className="invite-skeleton invite-button-skeleton" />
    </div>
  );
}

function getInviteErrorMessage(error) {
  const status = error.response?.status;
  const code = error.response?.data?.code;

  if (status === 410 || code === "EXPIRED") {
    return "Invitation expired. Request a new invitation from your organization admin.";
  }

  if (status === 409 || code === "REVOKED") {
    return "Invitation is no longer active. Request a new invitation from your organization admin.";
  }

  if (status === 404) {
    return "Invitation link is invalid.";
  }

  return getErrorMessage(error, "Invitation link could not be validated.");
}

export default function InviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [acceptAttempted, setAcceptAttempted] = useState(false);

  const expiry = useMemo(() => formatAccountDate(invitation?.expiresAt), [invitation?.expiresAt]);
  const inviterEmail = invitation?.invitedBy?.email || "Organization admin";

  useEffect(() => {
    if (token) {
      sessionStorage.setItem(PENDING_INVITE_TOKEN_KEY, token);
    }
  }, [token]);

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      setLoading(true);
      try {
        const data = await teamApi.getInvitation(token);
        if (!active) return;
        setInvitation(data);
        setMessage(null);
      } catch (error) {
        if (active) {
          setInvitation(null);
          setMessage({ type: "error", text: getInviteErrorMessage(error) });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInvitation();
    return () => {
      active = false;
    };
  }, [token]);

  const acceptInvitation = useCallback(async () => {
    setAcceptAttempted(true);
    setAccepting(true);
    try {
      await teamApi.acceptInvitation(token);
      sessionStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
      setMessage({ type: "success", text: "Invitation accepted. Redirecting to your team settings..." });
      window.setTimeout(() => navigate(TEAM_SETTINGS_PATH, { replace: true }), 600);
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error, "Failed to accept invitation.") });
    } finally {
      setAccepting(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!token || !invitation || !isAuthenticated || isLoading || accepting || acceptAttempted) return;
    acceptInvitation();
  }, [acceptAttempted, acceptInvitation, accepting, invitation, isAuthenticated, isLoading, token]);

  function goToAuth(path) {
    sessionStorage.setItem(PENDING_INVITE_TOKEN_KEY, token);
    navigate(path, {
      state: {
        inviteToken: token,
        invitedEmail: invitation?.email || "",
        from: { pathname: `/invite/${token}` },
      },
    });
  }

  return (
    <main className="invite-page">
      <section className="invite-shell">
        <div className="invite-brand">
          <ShieldCheck size={30} />
          <span>Breach Radar</span>
        </div>

        {loading || isLoading ? (
          <InviteSkeleton />
        ) : invitation ? (
          <div className="invite-card">
            <div className="invite-icon"><Mail size={28} /></div>
            <h1>Team Invitation</h1>
            <p>{inviterEmail} invited you to join {invitation.organization?.name} on Breach Radar.</p>

            <dl className="invite-details">
              <div><dt>Inviter</dt><dd>{inviterEmail}</dd></div>
              <div><dt>Organization</dt><dd>{invitation.organization?.name}</dd></div>
              <div><dt>Invited Email</dt><dd>{invitation.email}</dd></div>
              <div><dt>Assigned Role</dt><dd>{invitation.role}</dd></div>
              <div><dt>Expires</dt><dd>{expiry}</dd></div>
            </dl>

            {message && <div className={`invite-message ${message.type === "error" ? "error" : ""}`}>{message.text}</div>}

            {isAuthenticated ? (
              <div className="invite-actions">
                <button type="button" onClick={acceptInvitation} disabled={accepting || message?.type === "success"}>
                  <CheckCircle2 size={17} /> {accepting ? "Accepting..." : acceptAttempted ? "Try Again" : "Accepting Invitation..."}
                </button>
              </div>
            ) : (
              <div className="invite-actions">
                <button type="button" onClick={() => goToAuth("/login")}>
                  <LogIn size={17} /> Login
                </button>
                <button type="button" onClick={() => goToAuth("/register")}>
                  <UserPlus size={17} /> Register
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="invite-card">
            <div className="invite-icon expired">{message?.text?.includes("expired") ? <Clock3 size={28} /> : <AlertTriangle size={28} />}</div>
            <h1>Invitation Unavailable</h1>
            {message && <div className="invite-message error">{message.text}</div>}
            <div className="invite-actions">
              <button type="button" onClick={() => navigate("/login")}>Login</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
