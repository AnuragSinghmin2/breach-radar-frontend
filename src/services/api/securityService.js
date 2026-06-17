import { apiClient } from "./client";

export async function changePassword(payload) {
  const { data } = await apiClient.post("/security/change-password", payload);
  return data;
}

export async function enable2FA() {
  const { data } = await apiClient.post("/security/enable-2fa");
  return data;
}

export async function disable2FA() {
  const { data } = await apiClient.post("/security/disable-2fa");
  return data;
}

export async function getSessions() {
  const { data } = await apiClient.get("/security/sessions");
  return data;
}

export async function revokeSession(id) {
  const { data } = await apiClient.delete(`/security/sessions/${id}`);
  return data;
}
