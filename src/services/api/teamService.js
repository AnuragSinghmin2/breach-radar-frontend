import { apiClient } from "./client";

export async function getTeam(params = {}) {
  const { data } = await apiClient.get("/team", { params });
  return data;
}

export async function inviteMember(payload) {
  const { data } = await apiClient.post("/team/invite", payload);
  return data;
}

export async function getInvitations(params = {}) {
  const { data } = await apiClient.get("/team/invitations", { params });
  return data;
}

export async function getEmailStatus() {
  const { data } = await apiClient.get("/team/debug/email-status");
  return data;
}

export async function resendInvitation(invitationId) {
  const { data } = await apiClient.post(`/team/invite/${invitationId}/resend`);
  return data;
}

export async function revokeInvitation(invitationId) {
  const { data } = await apiClient.patch(`/team/invite/${invitationId}/revoke`);
  return data;
}

export async function deleteInvitation(invitationId) {
  const { data } = await apiClient.delete(`/team/invite/${invitationId}`);
  return data;
}

export async function getInvitation(token) {
  const { data } = await apiClient.get(`/invitations/${token}`);
  return data;
}

export async function acceptInvitation(token) {
  const { data } = await apiClient.post(`/invitations/${token}/accept`);
  return data;
}

export async function updateMemberRole(memberId, role) {
  const { data } = await apiClient.patch(`/team/member/${memberId}/role`, { role });
  return data;
}

export async function updateMemberStatus(memberId, status) {
  const { data } = await apiClient.patch(`/team/member/${memberId}/status`, { status });
  return data;
}

export async function removeMember(memberId) {
  const { data } = await apiClient.delete(`/team/member/${memberId}`);
  return data;
}

export async function updateOrganization(payload) {
  const { data } = await apiClient.patch("/team/organization", payload);
  return data;
}
