import { apiClient } from "./client";

export async function getReports() {
  const { data } = await apiClient.get("/reports");
  return data.reports || [];
}

export async function generateReport(payload) {
  const { data } = await apiClient.post("/reports", payload);
  return data;
}

export async function getReportById(id) {
  const { data } = await apiClient.get(`/reports/${id}`);
  return data;
}
