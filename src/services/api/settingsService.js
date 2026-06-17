import { apiClient } from "./client";

export async function getNotifications() {
  const { data } = await apiClient.get("/settings/notifications");
  return data;
}

export async function updateNotifications(payload) {
  const { data } = await apiClient.put("/settings/notifications", payload);
  return data;
}

export async function getScanPreferences() {
  const { data } = await apiClient.get("/settings/scan-preferences");
  return data;
}

export async function updateScanPreferences(payload) {
  const { data } = await apiClient.put("/settings/scan-preferences", payload);
  return data;
}
