import { apiClient } from "./client";

export async function getBilling() {
  const { data } = await apiClient.get("/billing");
  return data;
}

export async function getCurrentPlan() {
  const { data } = await apiClient.get("/billing/current-plan");
  return data;
}

export async function getUsage() {
  const { data } = await apiClient.get("/billing/usage");
  return data;
}

export async function getInvoices() {
  const { data } = await apiClient.get("/billing/invoices");
  return data;
}

export async function downloadInvoicePdf(id) {
  const { data } = await apiClient.get(`/billing/invoices/${id}/pdf`, { responseType: 'blob' });
  return data;
}

export async function upgradePlan(payload) {
  const { data } = await apiClient.post("/billing/upgrade", payload);
  return data;
}

export async function downgradePlan(payload) {
  const { data } = await apiClient.post("/billing/downgrade", payload);
  return data;
}

export async function cancelSubscription() {
  const { data } = await apiClient.post("/billing/cancel");
  return data;
}

export async function changePlan(payload) {
  const { data } = await apiClient.post("/billing/change-plan", payload);
  return data;
}

export async function createRazorpayOrder(payload) {
  const { data } = await apiClient.post("/payment/create-order", payload);
  return data;
}

export async function verifyRazorpayPayment(payload) {
  const { data } = await apiClient.post("/payment/verify", payload);
  return data;
}
