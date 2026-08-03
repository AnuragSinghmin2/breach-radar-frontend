import { apiClient } from "./client";

/**
 * Submit a public support ticket from the landing page.
 * @param {object} fields - { name, email, company, subject, category, priority, message }
 * @param {File|null} attachment - optional attachment file
 * @param {(percent: number) => void} [onUploadProgress]
 */
export async function submitSupportTicket(fields, attachment, onUploadProgress) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value ?? "");
  });

  if (attachment) {
    formData.append("attachment", attachment);
  }

  const { data } = await apiClient.post("/support", formData, {
    onUploadProgress: (event) => {
      if (!onUploadProgress || !event.total) return;
      onUploadProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return data;
}