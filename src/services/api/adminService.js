import { apiClient } from "./client";

export async function getUsers() {
  const { data } = await apiClient.get("/admin/users");
  return data.users || [];
}

export async function updateUserStatus(id, status) {
  const { data } = await apiClient.put(`/admin/users/${id}/status`, { status });
  return data;
}

export async function getSystemHealth() {
  const { data } = await apiClient.get("/admin/system-health");
  return data;
}
