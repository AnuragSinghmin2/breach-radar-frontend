import { apiClient } from "./client";

export async function getApiAccess() {
  const { data } = await apiClient.get("/api-access");
  return data;
}

export async function generateApiKey(payload) {
  const { data } = await apiClient.post("/api-access/generate", payload);
  return data;
}

export async function regenerateApiKey(id) {
  const { data } = await apiClient.post(`/api-access/regenerate/${id}`);
  return data;
}

export async function revokeApiKey(id) {
  const { data } = await apiClient.delete(`/api-access/${id}`);
  return data;
}
