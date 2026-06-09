import { useEffect, useState } from "react";
import { saveAuthSession } from "../utils/session";

const ADMIN_ORIGIN = import.meta.env.VITE_ADMIN_ORIGIN || window.location.origin;
const ADMIN_LOGIN_URL =
  import.meta.env.VITE_ADMIN_LOGIN_URL || "/login";

export default function SessionHandoff() {
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const isEmbedded = window.parent !== window;

    function notifyParent(payload) {
      if (isEmbedded) {
        window.parent.postMessage(payload, ADMIN_ORIGIN);
      }
    }

    function onMessage(event) {
      if (event.origin !== ADMIN_ORIGIN) {
        return;
      }

      if (event.data?.type !== "AUTH_HANDOFF") {
        return;
      }

      try {
        const { accessToken, user } = event.data;

        if (!accessToken || !user) {
          throw new Error("Missing session data.");
        }

        saveAuthSession(accessToken, user);
        notifyParent({ type: "AUTH_HANDOFF_ACK" });
        setMessage("Sign in complete. Redirecting...");
      } catch (error) {
        notifyParent({
          type: "AUTH_HANDOFF_ERROR",
          message: error.message || "Session handoff failed.",
        });
        setMessage("Unable to complete sign in.");
      }
    }

    window.addEventListener("message", onMessage);

    if (isEmbedded) {
      notifyParent({ type: "AUTH_HANDOFF_READY" });
    } else {
      setMessage("Invalid session handoff request.");
      window.setTimeout(() => {
        window.location.href = ADMIN_LOGIN_URL;
      }, 1500);
    }

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="auth-loading">
      <p>{message}</p>
    </div>
  );
}
