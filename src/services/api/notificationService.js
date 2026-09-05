import { apiClient } from "./client";

export async function getNotifications() {
  const { data } = await apiClient.get("/notifications");
  return data;
}

export async function getSettings() {
  const { data } = await apiClient.get("/notifications/settings");
  return data;
}

export async function updateSettings(payload) {
  const { data } = await apiClient.put("/notifications/settings", payload);
  return data;
}

export async function sendTestNotification() {
  const { data } = await apiClient.post("/notifications/test");
  return data;
}

export async function markAsRead(id) {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllAsRead() {
  const { data } = await apiClient.patch("/notifications/read-all");
  return data;
}

export async function deleteNotification(id) {
  const { data } = await apiClient.delete(`/notifications/${id}`);
  return data;
}

export async function clearAllNotifications() {
  const { data } = await apiClient.delete("/notifications");
  return data;
}
