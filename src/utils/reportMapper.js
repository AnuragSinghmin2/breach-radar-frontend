export function mapApiReport(report) {
  return {
    _id: report._id,
    title: report.title,
    id: report.id || report.reportNumber,
    domain: report.domain || report.domainId?.domain || "",
    scanType: report.scanType,
    status: report.status,
    vulns: report.vulns,
    score: report.score,
    generated: report.generated,
    type: report.type || "full",
    owner: report.owner || "Security Team",
    scanId: report.scanId,
    generatedAt: report.generatedAt,
  };
}
