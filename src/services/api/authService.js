import { apiClient, setAccessToken, clearAccessToken, getErrorMessage } from "./client";
import {
  clearAuthSession,
  getStoredUser,
  logAuthTrace,
  normalizeAuthUser,
  saveAuthSession,
} from "../../utils/session";

export async function login({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  const user = normalizeAuthUser(data.user, data.accessToken);

  logAuthTrace("authService login response", data);
  saveAuthSession(data.accessToken, user);
  setAccessToken(data.accessToken);

  return { ...data, user };
}

export async function register({ email, password, name }) {
  const { data } = await apiClient.post("/auth/register", { email, password, name });
  const user = normalizeAuthUser(data.user, data.accessToken);

  logAuthTrace("authService register response", data);
  saveAuthSession(data.accessToken, user);
  setAccessToken(data.accessToken);

  return { ...data, user };
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearAccessToken();
    clearAuthSession();
  }
}

export async function refreshToken() {
  const { data } = await apiClient.post("/auth/refresh-token");
  setAccessToken(data.accessToken);
  return data;
}

export { getStoredUser, getErrorMessage };
