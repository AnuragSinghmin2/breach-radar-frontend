import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Bell, Moon } from "lucide-react";
import { useMemo } from "react";
import { useDashboard } from "../context/DashboardContext";
import { formatDay, formatScanTime, severityTone } from "../utils/format";
import "./dashboard.css";

function buildActivityData(scans) {
  const buckets = {};

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    buckets[formatDay(date)] = 0;
  }

  scans.forEach((scan) => {
    const key = formatDay(new Date(scan.createdAt));
    if (buckets[key] !== undefined) {
      buckets[key] += 1;
    }
  });

  return Object.entries(buckets).map(([day, count]) => ({ day, scans: count }));
}

export default function Dashboard() {
  const { scans, recentVulnerabilities, notifications, loading } = useDashboard();

  const data = useMemo(() => buildActivityData(scans), [scans]);
  const recentScans = useMemo(
    () =>
      scans.slice(0, 5).map((scan) => ({
        id: scan._id,
        name: scan.domainId?.domain || "Unknown domain",
        status: scan.status,
        score: scan.domainId?.score ?? scan.riskScore ?? "-",
      })),
    [scans]
  );

  const vulnerabilities = useMemo(
    () =>
      recentVulnerabilities.map((item) => ({
        id: item._id,
        name: item.name,
        domain: item.domainId?.domain || "Unknown domain",
        severity: item.severity,
        tone: severityTone(item.severity),
        detected: formatScanTime(item.detectedAt),
      })),
    [recentVulnerabilities]
  );

  return (
    <div className="dashboard">
      {/* Navbar */}
      <div className="navbar">
        <Moon />
        <div className="notification">
          <Bell />
          <span className="badge">{notifications.length}</span>
        </div>
      </div>

      {/* Top Section */}
      <div className="top-section">
        {/* Chart */}
        <div className="card chart">
          <h2>Scan Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="scans" stroke="#22c55e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Scans */}
        <div className="card">
          <h2>Recent Scans</h2>
          {loading && <p className="dashboard-empty">Loading scans...</p>}
          {!loading && recentScans.length === 0 && (
            <p className="dashboard-empty">No scan data available</p>
          )}
          {recentScans.map((item) => (
            <div key={item.id} className="scan-item">
              <div>
                <p>{item.name}</p>
                <span className={item.status === "Completed" ? "success" : "failed"}>
                  {item.status}
                </span>
              </div>
              <div className="score">{item.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Table */}
      <div className="card">
        <h2>Recent Vulnerabilities</h2>
        <table>                                                           
          <thead>
            <tr>
              <th>Vulnerability</th>
              <th>Domain</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {vulnerabilities.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.domain}</td>
                <td>
                  <span className={`severity ${v.tone}`}>
                    {v.severity}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && vulnerabilities.length === 0 && (
              <tr>
                <td colSpan="3" className="dashboard-empty">
                  No scan data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


