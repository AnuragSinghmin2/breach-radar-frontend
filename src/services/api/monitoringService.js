import { apiClient } from "./client";

export async function getMonitoringOverview() {
  const { data } = await apiClient.get("/monitoring");
  return data;
}

export async function getMonitoringAlerts(params = {}) {
  const { data } = await apiClient.get("/monitoring/alerts", { params });
  return data.alerts;
}

export async function getSslMonitoring() {
  const { data } = await apiClient.get("/monitoring/ssl");
  return data;
}

export async function getDomainExpiryMonitoring() {
  const { data } = await apiClient.get("/monitoring/domains");
  return data;
}

export async function acknowledgeAlert(alertId) {
  const { data } = await apiClient.patch(`/monitoring/alerts/${alertId}/acknowledge`);
  return data;
}
