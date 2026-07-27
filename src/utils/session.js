const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const ROLE_HOME_PATHS = {
  user: "/dashboard",
  super_admin: "/super-admin",
};

function isAuthTraceEnabled() {
  return import.meta.env.DEV || localStorage.getItem("authDebug") === "true";
}

export function logAuthTrace(label, payload) {
  if (isAuthTraceEnabled()) {
    console.log(`[auth] ${label}`, payload);
  }
}

export function getTokenExpiryMs(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

export function decodeJwtPayload(token) {
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

function getActiveAuthStorage() {
  if (localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(USER_KEY)) {
    return localStorage;
  }
  if (sessionStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(USER_KEY)) {
    return sessionStorage;
  }
  return null;
}

function resolveAuthStorage(rememberMe) {
  if (rememberMe === true) return localStorage;
  if (rememberMe === false) return sessionStorage;
  return getActiveAuthStorage() || localStorage;
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

export function getRoleHomePath(role) {
  return ROLE_HOME_PATHS[role] || "/login";
}

export function getUserHomePath(user) {
  return getRoleHomePath(user?.role);
}

export function saveAuthSession(accessToken, user, { rememberMe } = {}) {
  const normalizedUser = normalizeAuthUser(user, accessToken);
  const storage = resolveAuthStorage(rememberMe);

  clearAuthSession();
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(USER_KEY, JSON.stringify(normalizedUser));
  logAuthTrace("stored user object", {
    rememberMe: storage === localStorage,
    user: normalizedUser,
  });
}

export function setStoredAccessToken(token) {
  if (!token) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  const storage = getActiveAuthStorage() || localStorage;
  const other = storage === localStorage ? sessionStorage : localStorage;
  other.removeItem(ACCESS_TOKEN_KEY);
  storage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
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
