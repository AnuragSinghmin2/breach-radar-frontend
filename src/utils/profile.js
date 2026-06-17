export function getInitials(name = "", email = "") {
  const cleanName = name.trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  }

  return email.trim()[0]?.toUpperCase() || "";
}

export function resolveAvatarUrl(avatar = "") {
  if (!avatar) return "";
  if (/^https?:\/\//i.test(avatar)) return avatar;

  const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v1";
  if (apiBase.startsWith("http")) {
    return `${new URL(apiBase).origin}${avatar}`;
  }

  return avatar;
}

export function formatAccountDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
