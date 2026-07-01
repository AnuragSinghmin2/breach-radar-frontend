import axios from "axios";

function normalizeApiBaseUrl(value) {
  const baseUrl = (value || "/api/v1").trim().replace(/\/+$/, "");

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

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const isPaymentEndpoint = (url = "") => url.includes("/payment") || url.includes("/billing");

if (window.location.protocol === "https:" && API_BASE_URL.startsWith("http://")) {
  console.error("[api] HTTPS frontend cannot call an HTTP backend. Set VITE_API_BASE_URL to an HTTPS backend URL.");
}

if (window.location.hostname.includes("vercel.app") && !import.meta.env.VITE_API_BASE_URL) {
  console.error("[api] Vercel deployment is using relative /api/v1. Set VITE_API_BASE_URL to the deployed backend API URL.");
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let accessToken = localStorage.getItem("accessToken") || null;
let refreshPromise = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}

apiClient.interceptors.request.use((config) => {
  if (isPaymentEndpoint(config.url)) {
    console.log("[api] Payment/Billing request", {
      method: config.method,
      baseURL: config.baseURL,
      url: config.url
    });
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (isPaymentEndpoint(response.config?.url)) {
      console.log("[api] Payment/Billing response", {
        status: response.status,
        url: response.config?.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (isPaymentEndpoint(originalRequest?.url)) {
      console.error("[api] Payment/Billing API error", {
        status,
        code,
        url: originalRequest?.url,
        data: error.response?.data,
        message: error.message
      });
    }

    if (
      !originalRequest ||
      originalRequest._retry ||
      status !== 401 ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    if (code === "TOKEN_EXPIRED" || !accessToken) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = apiClient
            .post("/auth/refresh-token")
            .then((response) => {
              setAccessToken(response.data.accessToken);
              return response.data.accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("auth:logout"));
        window.location.href = import.meta.env.VITE_ADMIN_LOGIN_URL || "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = "Request failed") {
  return error.response?.data?.message || error.message || fallback;
}
