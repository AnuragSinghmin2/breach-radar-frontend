import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Bell, Moon } from "lucide-react";
import "./dashboard.css";

const data = [
  { day: "10 May", scans: 15 },
  { day: "11 May", scans: 55 },
  { day: "12 May", scans: 45 },
  { day: "13 May", scans: 75 },
  { day: "14 May", scans: 65 },
  { day: "15 May", scans: 70 },
  { day: "16 May", scans: 85 },
];

const scans = [
  { name: "example.com", status: "Completed", score: 68 },
  { name: "testsite.com", status: "Completed", score: 72 },
  { name: "myapp.io", status: "Completed", score: 64 },
  { name: "demo.org", status: "Completed", score: 80 },
  { name: "vulnerable.net", status: "Failed", score: "-" },
];

const vulnerabilities = [
  { name: "Cross Site Scripting (XSS)", domain: "example.com", severity: "Critical" },
  { name: "SQL Injection", domain: "api.example.com", severity: "High" },
  { name: "Security Misconfiguration", domain: "test.example.com", severity: "Medium" },
  { name: "Missing Security Headers", domain: "app.example.com", severity: "Low" },
  { name: "CORS", domain: "demo.org", severity: "Low" },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Navbar */}
      <div className="navbar">
        <Moon />
        <div className="notification">
          <Bell />
          <span className="badge">3</span>
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
          {scans.map((item, i) => (
            <div key={i} className="scan-item">
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
            {vulnerabilities.map((v, i) => (
              <tr key={i}>
                <td>{v.name}</td>
                <td>{v.domain}</td>
                <td>
                  <span className={`severity ${v.severity.toLowerCase()}`}>
                    {v.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


