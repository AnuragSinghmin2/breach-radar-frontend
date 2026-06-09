export const SCAN_STATUS = {
  QUEUED: "Queued",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  FAILED: "Failed",
  SCHEDULED: "Scheduled",
};

export const SCAN_TYPES = {
  FULL: "Full Scan",
  QUICK: "Quick Scan",
  CUSTOM: "Custom Scan",
};

export const DEFAULT_CHECKS = {
  owasp: true,
  ssl: true,
  headers: true,
  ports: false,
  malware: true,
  compliance: false,
};

export const SCAN_TYPE_META = {
  [SCAN_TYPES.FULL]: {
    badge: "Recommended",
    duration: "15-30 min",
    coverage: "High",
    usage: "Medium",
    description:
      "Comprehensive scan including OWASP Top 10, SSL/TLS checks, security headers, exposed services, malware signals, and dependency hints.",
  },
  [SCAN_TYPES.QUICK]: {
    badge: "Fast",
    duration: "5-8 min",
    coverage: "Medium",
    usage: "Low",
    description:
      "Lightweight scan for headers, TLS posture, exposed ports, redirects, and common misconfigurations.",
  },
  [SCAN_TYPES.CUSTOM]: {
    badge: "Advanced",
    duration: "10-45 min",
    coverage: "Custom",
    usage: "Variable",
    description:
      "Pick scan modules and intensity for targeted checks across app, network, headers, and compliance posture.",
  },
};

export const MOCK_DOMAINS = [
  "example.com",
  "testsite.com",
  "myapp.io",
  "demo.org",
  "vulnerable.net",
];
