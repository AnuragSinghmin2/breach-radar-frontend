import { apiClient } from "./client";

export async function getScans(params = {}) {
  const { data } = await apiClient.get("/scans", { params });
  return data;
}

export async function getScanById(id) {
  const { data } = await apiClient.get(`/scans/${id}`);
  return data;
}

export async function getScanStatus(id) {
  const { data } = await apiClient.get(`/scans/${id}/status`);
  return data;
}

export async function getScanResults(id) {
  const { data } = await apiClient.get(`/scans/${id}/results`);
  return data;
}

export async function startScan({ domain, scanType, checks }) {
  const { data } = await apiClient.post("/scans", { domain, scanType, checks });
  return data;
}

export async function rerunScan(id) {
  const { data } = await apiClient.post(`/scans/${id}/rerun`);
  return data;
}
