import { apiClient } from "./client";

export async function getLogs(params) {
  const { data } = await apiClient.get("/activity-log", { params });
  return data;
}

export async function exportLogsCsv() {
  const { data } = await apiClient.get("/activity-log/export", { responseType: 'blob' });
  return data;
}
