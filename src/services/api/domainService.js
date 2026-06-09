import { apiClient } from "./client";

export async function getDomains() {
  const { data } = await apiClient.get("/domains");
  return data;
}

export async function getDomainById(id) {
  const { data } = await apiClient.get(`/domains/${id}`);
  return data;
}

export async function addDomain({ domain, tag }) {
  const { data } = await apiClient.post("/domains", { domain, tag });
  return data;
}

export async function updateDomain(id, payload) {
  const { data } = await apiClient.put(`/domains/${id}`, payload);
  return data;
}

export async function toggleDomainStatus(id) {
  const { data } = await apiClient.patch(`/domains/${id}/status`);
  return data;
}

export async function deleteDomain(id) {
  const { data } = await apiClient.delete(`/domains/${id}`);
  return data;
}

export async function getVerificationInstructions(id) {
  const { data } = await apiClient.get(`/domains/${id}/verification`);
  return data;
}

export async function verifyDomainDns(id, bypass = false) {
  const { data } = await apiClient.post(`/domains/${id}/verification/dns${bypass ? "?bypass=true" : ""}`);
  return data;
}

export async function verifyDomainHtml(id, bypass = false) {
  const { data } = await apiClient.post(`/domains/${id}/verification/html${bypass ? "?bypass=true" : ""}`);
  return data;
}
