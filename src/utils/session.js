const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

function isAuthTraceEnabled() {
  return import.meta.env.DEV || localStorage.getItem("authDebug") === "true";
}

export function logAuthTrace(label, payload) {
  if (isAuthTraceEnabled()) {
    console.log(`[auth] ${label}`, payload);
  }
}

function decodeJwtPayload(token) {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );

    return JSON.parse(json);
  } catch (error) {
    logAuthTrace("failed to decode access token payload", error);
    return null;
  }
}

export function normalizeAuthUser(user, accessToken = getStoredAccessToken()) {
  if (!user) return null;

  const parsedUser = typeof user === "string" ? JSON.parse(user) : user;
  const sourceUser = parsedUser.user || parsedUser;
  const tokenPayload = decodeJwtPayload(accessToken);
  const role = sourceUser.role || sourceUser.userRole || sourceUser.globalRole || tokenPayload?.role;

  return {
    ...sourceUser,
    role,
  };
}

export function saveAuthSession(accessToken, user) {
  const normalizedUser = normalizeAuthUser(user, accessToken);

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
  logAuthTrace("stored user object", normalizedUser);
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    const user = normalizeAuthUser(JSON.parse(raw));
    logAuthTrace("restored user object", user);
    return user;
  } catch (error) {
    logAuthTrace("failed to restore user object", error);
    return null;
  }
}
