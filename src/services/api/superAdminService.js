import { apiClient } from "./client";

export async function getDashboardStats() {
  const { data } = await apiClient.get("/super-admin/dashboard");
  return data;
}

export async function getUsers(params = {}) {
  const { data } = await apiClient.get("/super-admin/users", { params });
  return data;
}

export async function getUserDetails(id) {
  const { data } = await apiClient.get(`/super-admin/users/${id}`);
  return data;
}

export async function updateUserStatus(id, status) {
  const { data } = await apiClient.put(`/super-admin/users/${id}/status`, { status });
  return data;
}

export async function updateUserRole(id, role) {
  const { data } = await apiClient.put(`/super-admin/users/${id}/role`, { role });
  return data;
}

export async function upgradeUserSubscription(id, planName) {
  const { data } = await apiClient.put(`/super-admin/users/${id}/subscription`, { planName });
  return data;
}

export async function deleteUser(id) {
  const { data } = await apiClient.delete(`/super-admin/users/${id}`);
  return data;
}

export async function getDomains(params = {}) {
  const { data } = await apiClient.get("/super-admin/domains", { params });
  return data;
}

export async function forceScanDomain(domainId) {
  const { data } = await apiClient.post("/super-admin/domains/force-scan", { domainId });
  return data;
}

export async function getScans(params = {}) {
  const { data } = await apiClient.get("/super-admin/scans", { params });
  return data;
}

export async function cancelScan(id) {
  const { data } = await apiClient.post(`/super-admin/scans/${id}/cancel`);
  return data;
}

export async function restartScan(id) {
  const { data } = await apiClient.post(`/super-admin/scans/${id}/restart`);
  return data;
}

export async function getVulnerabilities(params = {}) {
  const { data } = await apiClient.get("/super-admin/vulnerabilities", { params });
  return data;
}

export async function getSubscriptionPlans() {
  const { data } = await apiClient.get("/super-admin/subscriptions");
  return data;
}

export async function createSubscriptionPlan(planData) {
  const { data } = await apiClient.post("/super-admin/subscriptions", planData);
  return data;
}

export async function updateSubscriptionPlan(id, planData) {
  const { data } = await apiClient.put(`/super-admin/subscriptions/${id}`, planData);
  return data;
}

export async function deleteSubscriptionPlan(id) {
  const { data } = await apiClient.delete(`/super-admin/subscriptions/${id}`);
  return data;
}

export async function getPayments() {
  const { data } = await apiClient.get("/super-admin/payments");
  return data;
}

export async function refundPayment(id) {
  const { data } = await apiClient.post(`/super-admin/payments/${id}/refund`);
  return data;
}

export async function getSupportTickets(params = {}) {
  const { data } = await apiClient.get("/super-admin/tickets", { params });
  return data;
}

export async function assignSupportTicket(id, assignedToUserId) {
  const { data } = await apiClient.post(`/super-admin/tickets/${id}/assign`, { assignedToUserId });
  return data;
}

export async function replySupportTicket(id, message) {
  const { data } = await apiClient.post(`/super-admin/tickets/${id}/reply`, { message });
  return data;
}

export async function resolveSupportTicket(id) {
  const { data } = await apiClient.post(`/super-admin/tickets/${id}/resolve`);
  return data;
}

export async function getReports() {
  const { data } = await apiClient.get("/super-admin/reports");
  return data;
}

export async function getAuditLogs(params = {}) {
  const { data } = await apiClient.get("/super-admin/audit-logs", { params });
  return data;
}

export async function getSystemHealth() {
  const { data } = await apiClient.get("/super-admin/system-health");
  return data;
}

export function getErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.message || error?.message || fallback;
}

export const superAdminApi = {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  upgradeUserSubscription,
  deleteUser,
  getDomains,
  forceScanDomain,
  getScans,
  cancelScan,
  restartScan,
  getVulnerabilities,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getPayments,
  refundPayment,
  getSupportTickets,
  assignSupportTicket,
  replySupportTicket,
  resolveSupportTicket,
  getReports,
  getAuditLogs,
  getSystemHealth
};
