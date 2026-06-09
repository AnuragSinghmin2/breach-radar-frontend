import { apiClient, setAccessToken, clearAccessToken, getErrorMessage } from "./client";
import { clearAuthSession, getStoredUser, saveAuthSession } from "../../utils/session";

export async function login({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  saveAuthSession(data.accessToken, data.user);
  setAccessToken(data.accessToken);
  return data;
}

export async function register({ email, password, name }) {
  const { data } = await apiClient.post("/auth/register", { email, password, name });
  saveAuthSession(data.accessToken, data.user);
  setAccessToken(data.accessToken);
  return data;
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
