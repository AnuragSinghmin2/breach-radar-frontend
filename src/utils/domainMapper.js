import { formatDate, formatScanTime, timeAgo } from "./format";

const ICON_TONES = ["green", "purple", "blue", "orange"];

export function mapApiDomain(domain, vulnCounts = null) {
  const counts = vulnCounts || { critical: 0, high: 0, medium: 0, low: 0 };
  const toneIndex = domain.domain.length % ICON_TONES.length;

  return {
    _id: domain._id,
    domain: domain.domain,
    added: `Added on ${formatDate(domain.createdAt)}`,
    tag: domain.tag,
    iconTone: ICON_TONES[toneIndex],
    status: domain.status,
    statusDetail: domain.statusDetail,
    verificationStatus: domain.verificationStatus || "pending_verification",
    verifiedAt: domain.verifiedAt,
    verificationMethod: domain.verificationMethod,
    score: domain.score,
    scoreLabel: domain.scoreLabel,
    scoreTone: domain.scoreTone,
    vulnerabilities: counts,
    date: domain.lastScanAt ? formatScanTime(domain.lastScanAt) : "Not scanned yet",
    ago: domain.lastScanAt ? timeAgo(domain.lastScanAt) : "New domain",
  };
}

export function groupVulnerabilitiesByDomain(vulnerabilities) {
  const map = {};

  vulnerabilities.forEach((item) => {
    const domain = item.domainId?.domain;
    if (!domain) return;

    if (!map[domain]) {
      map[domain] = { critical: 0, high: 0, medium: 0, low: 0 };
    }

    const key = item.severity?.toLowerCase();
    if (map[domain][key] !== undefined) {
      map[domain][key] += 1;
    }
  });

  return map;
}
