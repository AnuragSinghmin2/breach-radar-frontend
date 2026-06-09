import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser,
} from "./session";

/**
 * Utility helper to validate if a JWT token is valid and not expired.
 * @param {string} token - The JWT token to validate
 * @returns {boolean} - True if valid and not expired, false otherwise
 */
export function isValidToken(token) {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
}

export function isSessionValid() {
  const token = getStoredAccessToken();
  const user = getStoredUser();
  return Boolean(token && user && isValidToken(token));
}

export { clearAuthSession, getStoredAccessToken, getStoredUser };
