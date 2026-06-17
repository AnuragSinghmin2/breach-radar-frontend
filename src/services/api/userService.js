import { apiClient } from "./client";

export async function getProfile() {
  const { data } = await apiClient.get("/users/profile");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await apiClient.put("/users/profile", payload);
  return data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await apiClient.post("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function removeAvatar() {
  const { data } = await apiClient.delete("/users/avatar");
  return data;
}
