export function isLocalDevHost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
}

export function normalizeApiBaseUrl(value) {
  const configuredBaseUrl = (value || "").trim();

  if (isLocalDevHost()) {
    return "/api/v1";
  }

  const baseUrl = (configuredBaseUrl || "/api/v1").replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(baseUrl)) {
    return baseUrl || "/api/v1";
  }

  const parsedUrl = new URL(baseUrl);
  if (parsedUrl.pathname === "" || parsedUrl.pathname === "/") {
    parsedUrl.pathname = "/api/v1";
    return parsedUrl.toString().replace(/\/+$/, "");
  }

  return baseUrl;
}

export function getApiOrigin() {
  if (typeof window === "undefined") return "";

  if (isLocalDevHost()) {
    return window.location.origin;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v1";
  if (/^https?:\/\//i.test(apiBase)) {
    return new URL(apiBase).origin;
  }

  return window.location.origin;
}
