const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 46;
const TOP_MARGIN = 48;
const BOTTOM_MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const LINE_HEIGHT = 13;

const severityOrder = ["Critical", "High", "Medium", "Low"];

function cleanText(value, fallback = "-") {
  const text = String(value ?? "").trim();
  return (text || fallback)
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126);
    })
    .join("");
}

function pdfEscape(value) {
  return cleanText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function normalizeSeverity(value) {
  const severity = cleanText(value, "Medium").toLowerCase();
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function normalizeStatus(value) {
  return cleanText(value, "Open");
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatReportDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatReportTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function getDomainNameFromVulnerability(item) {
  return cleanText(item.domainId?.domain || item.domain || item.asset || "", "");
}

export function getDomainVulnerabilities(vulnerabilities, domain) {
  const target = cleanText(domain, "").toLowerCase();
  return vulnerabilities.filter((item) => getDomainNameFromVulnerability(item).toLowerCase() === target);
}

export function getDomainReportFilename(domain) {
  const safeDomain = cleanText(domain, "domain")
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safeDomain || "domain"}-security-report.pdf`;
}

function mapVulnerability(item) {
  return {
    name: cleanText(item.name || item.title, "Untitled vulnerability"),
    severity: normalizeSeverity(item.severity),
    status: normalizeStatus(item.status),
    detectedDate: formatDateTime(item.detectedAt || item.createdAt || item.date),
    description: cleanText(item.desc || item.description, "No description available."),
    impact: cleanText(item.impact, "No impact details available."),
    fix: cleanText(item.fix || item.recommendation || item.recommendedFix || item.solution, "No remediation guidance available."),
    cwe: cleanText(item.cwe, "-"),
    cve: cleanText(item.cve || item.cves, "-"),
    affectedUrl: cleanText(item.affectedUrl || item.url || item.path || item.endpoint, "-"),
  };
}

function scoreFromVulnerabilities(items) {
  const counts = items.reduce(
    (acc, item) => {
      const severity = normalizeSeverity(item.severity);
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 }
  );
  const penalty = counts.Critical * 18 + counts.High * 10 + counts.Medium * 5 + counts.Low * 2;
  return Math.max(0, Math.min(100, 100 - penalty));
}

function measureText(text, size) {
  return cleanText(text).length * size * 0.48;
}

function wrapText(text, size, maxWidth) {
  const words = cleanText(text).split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (measureText(candidate, size) <= maxWidth) {
      current = candidate;
      return;
    }

    if (current) lines.push(current);
    if (measureText(word, size) <= maxWidth) {
      current = word;
      return;
    }

    const maxChars = Math.max(8, Math.floor(maxWidth / (size * 0.48)));
    for (let index = 0; index < word.length; index += maxChars) {
      lines.push(word.slice(index, index + maxChars));
    }
    current = "";
  });

  if (current) lines.push(current);
  return lines.length ? lines : ["-"];
}

class PdfBuilder {
  constructor(title) {
    this.title = title;
    this.pages = [];
    this.commands = [];
    this.y = TOP_MARGIN;
    this.addPage();
  }

  add(command) {
    this.commands.push(command);
  }

  addPage() {
    if (this.commands.length) this.pages.push(this.commands);
    this.commands = [];
    this.y = TOP_MARGIN;
  }

  ensureSpace(height) {
    if (this.y + height > PAGE_HEIGHT - BOTTOM_MARGIN) {
      this.addPage();
    }
  }

  text(value, x, y, options = {}) {
    const size = options.size || 10;
    const font = options.font || "F1";
    const color = options.color || "0.13 0.18 0.28";
    this.add(`BT /${font} ${size} Tf ${color} rg ${x.toFixed(2)} ${y.toFixed(2)} Td (${pdfEscape(value)}) Tj ET`);
  }

  line(x1, y1, x2, y2, color = "0.83 0.86 0.91", width = 1) {
    this.add(`${color} RG ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  rect(x, y, width, height, color) {
    this.add(`${color} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
  }

  writeLines(text, x, width, options = {}) {
    const size = options.size || 10;
    const lineHeight = options.lineHeight || LINE_HEIGHT;
    const lines = wrapText(text, size, width);
    lines.forEach((line) => {
      this.ensureSpace(lineHeight + 2);
      this.text(line, x, PAGE_HEIGHT - this.y, { ...options, size });
      this.y += lineHeight;
    });
  }

  heading(text) {
    this.ensureSpace(34);
    this.text(text, MARGIN_X, PAGE_HEIGHT - this.y, { size: 15, font: "F2", color: "0.02 0.08 0.16" });
    this.y += 13;
    this.line(MARGIN_X, PAGE_HEIGHT - this.y, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - this.y, "0.00 0.65 0.45", 1.4);
    this.y += 16;
  }

  labelValue(label, value, x, y, width) {
    this.text(label, x, PAGE_HEIGHT - y, { size: 8, font: "F2", color: "0.39 0.45 0.55" });
    this.writeLines(value, x, width, { size: 10, font: "F1", color: "0.08 0.11 0.18", lineHeight: 12 });
  }

  finish() {
    if (this.commands.length) this.pages.push(this.commands);
    const totalPages = this.pages.length;

    this.pages = this.pages.map((commands, index) => [
      ...commands,
      `BT /F1 9 Tf 0.39 0.45 0.55 rg ${(PAGE_WIDTH / 2 - 32).toFixed(2)} 28 Td (Page ${index + 1} of ${totalPages}) Tj ET`,
    ]);

    return serializePdf(this.pages, this.title);
  }
}

function serializePdf(pages, title) {
  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("");
  const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageIds = [];

  pages.forEach((commands) => {
    const content = commands.join("\n");
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n% Binary\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info << /Title (${pdfEscape(title)}) >> >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function writeMetricGrid(pdf, metrics) {
  const gap = 10;
  const cols = 4;
  const cardWidth = (CONTENT_WIDTH - gap * (cols - 1)) / cols;
  const cardHeight = 46;

  metrics.forEach((metric, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = MARGIN_X + col * (cardWidth + gap);
    const y = pdf.y + row * (cardHeight + gap);
    pdf.rect(x, PAGE_HEIGHT - y - cardHeight + 10, cardWidth, cardHeight, "0.96 0.98 1.00");
    pdf.text(metric.label, x + 10, PAGE_HEIGHT - y - 7, { size: 8, font: "F2", color: "0.39 0.45 0.55" });
    pdf.text(String(metric.value), x + 10, PAGE_HEIGHT - y - 27, { size: 17, font: "F2", color: "0.02 0.08 0.16" });
  });

  pdf.y += Math.ceil(metrics.length / cols) * (cardHeight + gap) + 14;
}

function writeVulnerability(pdf, vulnerability, index) {
  pdf.ensureSpace(190);
  pdf.rect(MARGIN_X, PAGE_HEIGHT - pdf.y - 22, CONTENT_WIDTH, 26, "0.95 0.97 0.99");
  pdf.text(`VULNERABILITY #${index + 1}`, MARGIN_X + 12, PAGE_HEIGHT - pdf.y - 6, {
    size: 12,
    font: "F2",
    color: "0.02 0.08 0.16",
  });
  pdf.y += 36;

  const meta = [
    ["Name", vulnerability.name],
    ["Severity", vulnerability.severity],
    ["Status", vulnerability.status],
    ["Detected Date", vulnerability.detectedDate],
    ["Affected URL", vulnerability.affectedUrl],
    ["CWE", vulnerability.cwe],
    ["CVE", vulnerability.cve],
  ];

  meta.forEach(([label, value]) => {
    pdf.ensureSpace(18);
    pdf.text(`${label}:`, MARGIN_X + 12, PAGE_HEIGHT - pdf.y, { size: 9, font: "F2", color: "0.25 0.31 0.39" });
    pdf.writeLines(value, MARGIN_X + 104, CONTENT_WIDTH - 116, { size: 9.5, lineHeight: 11 });
    pdf.y += 2;
  });

  [
    ["Description", vulnerability.description],
    ["Impact", vulnerability.impact],
    ["Recommended Fix", vulnerability.fix],
  ].forEach(([label, value]) => {
    pdf.ensureSpace(34);
    pdf.text(label, MARGIN_X + 12, PAGE_HEIGHT - pdf.y, { size: 10, font: "F2", color: "0.02 0.08 0.16" });
    pdf.y += 15;
    pdf.writeLines(value, MARGIN_X + 12, CONTENT_WIDTH - 24, { size: 9.5, lineHeight: 12 });
    pdf.y += 8;
  });

  pdf.y += 8;
}

export function createDomainSecurityReportPdf({ domain, vulnerabilities }) {
  const generatedAt = new Date();
  const items = vulnerabilities.map(mapVulnerability);
  const counts = severityOrder.reduce((acc, severity) => {
    acc[severity] = items.filter((item) => item.severity === severity).length;
    return acc;
  }, {});
  const openCount = items.filter((item) => item.status === "Open").length;
  const resolvedCount = items.filter((item) => item.status === "Resolved").length;
  const score = Number.isFinite(Number(domain.score)) ? Math.round(Number(domain.score)) : scoreFromVulnerabilities(items);

  const pdf = new PdfBuilder(`${cleanText(domain.domain)} Security Report`);
  pdf.rect(0, PAGE_HEIGHT - 118, PAGE_WIDTH, 118, "0.02 0.08 0.16");
  pdf.text("PentestRadar", MARGIN_X, PAGE_HEIGHT - 40, { size: 16, font: "F2", color: "0.00 0.84 0.56" });
  pdf.text("Security Assessment Report", MARGIN_X, PAGE_HEIGHT - 72, {
    size: 22,
    font: "F2",
    color: "1.00 1.00 1.00",
  });
  pdf.text(cleanText(domain.domain), MARGIN_X, PAGE_HEIGHT - 96, { size: 12, color: "0.80 0.86 0.94" });
  pdf.y = 146;

  pdf.heading("Domain");
  writeMetricGrid(pdf, [
    { label: "Domain", value: domain.domain },
    { label: "Generated Date", value: formatReportDate(generatedAt) },
    { label: "Generated Time", value: formatReportTime(generatedAt) },
    { label: "Security Score", value: `${score}/100` },
  ]);

  pdf.heading("SUMMARY");
  writeMetricGrid(pdf, [
    { label: "Total Vulnerabilities", value: items.length },
    { label: "Critical", value: counts.Critical },
    { label: "High", value: counts.High },
    { label: "Medium", value: counts.Medium },
    { label: "Low", value: counts.Low },
    { label: "Open", value: openCount },
    { label: "Resolved", value: resolvedCount },
  ]);

  pdf.heading("Vulnerability Details");
  if (items.length === 0) {
    pdf.writeLines("No vulnerabilities are currently available for this domain.", MARGIN_X, CONTENT_WIDTH, {
      size: 11,
      lineHeight: 15,
    });
  } else {
    items.forEach((item, index) => writeVulnerability(pdf, item, index));
  }

  pdf.ensureSpace(54);
  pdf.line(MARGIN_X, PAGE_HEIGHT - pdf.y, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - pdf.y, "0.83 0.86 0.91", 1);
  pdf.y += 22;
  pdf.text("End of Report", MARGIN_X, PAGE_HEIGHT - pdf.y, { size: 12, font: "F2", color: "0.02 0.08 0.16" });
  pdf.y += 18;
  pdf.text("Generated by PentestRadar", MARGIN_X, PAGE_HEIGHT - pdf.y, { size: 10, color: "0.39 0.45 0.55" });

  return pdf.finish();
}
