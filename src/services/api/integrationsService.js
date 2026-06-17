import { apiClient } from "./client";

export async function getIntegrations() {
  const { data } = await apiClient.get("/integrations");
  return data;
}

export async function connectIntegration(payload) {
  const { data } = await apiClient.post("/integrations", payload);
  return data;
}

export async function disconnectIntegration(id) {
  const { data } = await apiClient.delete(`/integrations/${id}`);
  return data;
}

export async function testIntegration(payload) {
  const { data } = await apiClient.post("/integrations/test", payload);
  return data;
}
