export const PRODUCTION_API_URL = "https://breach-radar-backend-539618567961.europe-west1.run.app/api/v1";

export function isLocalDevHost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
}

export function normalizeApiBaseUrl(value) {
  const configuredBaseUrl = (value || "").trim();

  if (isLocalDevHost()) {
    return configuredBaseUrl || "/api/v1";
  }

  // If running in production on pentestradar.com and no explicit URL is configured, route to GCP backend
  if (!configuredBaseUrl || configuredBaseUrl === "/api/v1" || configuredBaseUrl === "/api") {
    return PRODUCTION_API_URL;
  }

  const baseUrl = configuredBaseUrl.replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(baseUrl)) {
    return PRODUCTION_API_URL;
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

  const apiBase = import.meta.env.VITE_API_BASE_URL || PRODUCTION_API_URL;
  if (/^https?:\/\//i.test(apiBase)) {
    return new URL(apiBase).origin;
  }

  return new URL(PRODUCTION_API_URL).origin;
}

