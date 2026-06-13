import { useEffect, useState } from "react";
import { superAdminApi, getErrorMessage } from "../services/api/superAdminService";
import {
  Users as UsersIcon,
  Globe,
  Scan,
  ShieldAlert,
  DollarSign,
  Layers,
  Activity,
  HeartPulse,
  MessageSquare
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import "./SuperAdmin.css";

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await superAdminApi.getDashboardStats();
        setData(stats);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load dashboard statistics"));
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="sa-empty" style={{ color: "#00d68f", textAlign: "center", padding: "40px" }}>Loading Dashboard statistics...</div>;
  }

  if (error) {
    return <div className="sa-empty" style={{ color: "#ef4444", textAlign: "center", padding: "40px" }}>{error}</div>;
  }

  const { stats, charts, recentUsers, recentScans, ticketsOverview, systemHealth } = data;

  // Pie chart severity data
  const severityData = [
    { name: "Critical", value: charts.severityDistribution.Critical || 0, color: "#ff4545" },
    { name: "High", value: charts.severityDistribution.High || 0, color: "#f97316" },
    { name: "Medium", value: charts.severityDistribution.Medium || 0, color: "#facc15" },
    { name: "Low", value: charts.severityDistribution.Low || 0, color: "#6366f1" }
  ].filter(item => item.value > 0);

  return (
    <div className="sa-container">
      {/* 1. Statistics Cards */}
      <div className="sa-sa sa-stats-grid">
        <div className="sa-stat-card">
          <div className="sa-stat-icon"><UsersIcon size={24} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-label">Total Users</span>
            <span className="sa-stat-value">{stats.totalUsers}</span>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon"><Globe size={24} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-label">Total Domains</span>
            <span className="sa-stat-value">{stats.totalDomains}</span>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon"><Scan size={24} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-label">Total Scans</span>
            <span className="sa-stat-value">{stats.totalScans}</span>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ color: "#ff4545", background: "rgba(239,68,68,0.1)" }}><ShieldAlert size={24} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-label">Vulnerabilities</span>
            <span className="sa-stat-value">{stats.totalVulnerabilities}</span>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ color: "#eab308", background: "rgba(234,179,8,0.1)" }}><DollarSign size={24} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-label">Total Revenue</span>
            <span className="sa-stat-value">${stats.totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon" style={{ color: "#60a5fa", background: "rgba(96,165,250,0.1)" }}><Layers size={24} /></div>
          <div className="sa-stat-info">
            <span className="sa-stat-label">Active Subs</span>
            <span className="sa-stat-value">{stats.activeSubscriptions}</span>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="sa-dashboard-grid">
        {/* Scan Activity Chart */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h3>Scan Activity (Last 7 Days)</h3>
          </div>
          <div style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.scanActivity}>
                <defs>
                  <linearGradient id="saScanFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d68f" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00d68f" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(42, 69, 96, 0.3)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(42, 69, 96, 0.7)" }} />
                <Area type="monotone" dataKey="scans" stroke="#00d68f" strokeWidth={2} fill="url(#saScanFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h3>Vulnerability Severity Breakdown</h3>
          </div>
          {severityData.length === 0 ? (
            <div style={{ height: "260px", display: "grid", placeItems: "center", color: "#94a3b8" }}>
              No vulnerabilities detected yet.
            </div>
          ) : (
            <div style={{ height: "260px", display: "flex", alignItems: "center" }}>
              <div style={{ width: "60%", height: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(42, 69, 96, 0.7)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: "12px" }}>
                {severityData.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: item.color }}></div>
                    <span style={{ color: "#94a3b8" }}>{item.name}: <b>{item.value}</b></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Grid: Revenue, System Health, and Tickets */}
      <div className="sa-dashboard-grid">
        {/* Revenue Growth Chart */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h3>Revenue Analytics (Monthly)</h3>
          </div>
          {charts.revenueAnalytics.length === 0 ? (
            <div style={{ height: "220px", display: "grid", placeItems: "center", color: "#94a3b8" }}>
              No revenue records registered yet.
            </div>
          ) : (
            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.revenueAnalytics}>
                  <CartesianGrid stroke="rgba(42, 69, 96, 0.3)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(42, 69, 96, 0.7)" }} />
                  <Bar dataKey="revenue" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Support Overview & System Health widgets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Support desk ticket widget */}
          <div className="sa-card" style={{ flex: 1 }}>
            <div className="sa-card-header">
              <h3>Support Tickets</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center" }}>
              <div style={{ background: "rgba(239,68,68,0.05)", padding: "12px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <h4 style={{ margin: 0, color: "#f87171", fontSize: "20px" }}>{ticketsOverview.open}</h4>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Open</span>
              </div>
              <div style={{ background: "rgba(234,179,8,0.05)", padding: "12px", borderRadius: "6px", border: "1px solid rgba(234,179,8,0.2)" }}>
                <h4 style={{ margin: 0, color: "#facc15", fontSize: "20px" }}>{ticketsOverview.assigned}</h4>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Assigned</span>
              </div>
              <div style={{ background: "rgba(34,197,94,0.05)", padding: "12px", borderRadius: "6px", border: "1px solid rgba(34,197,94,0.2)" }}>
                <h4 style={{ margin: 0, color: "#4ade80", fontSize: "20px" }}>{ticketsOverview.closed}</h4>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Resolved</span>
              </div>
            </div>
          </div>

          {/* System health status indicators */}
          <div className="sa-card" style={{ flex: 1 }}>
            <div className="sa-card-header">
              <h3>System Health status</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Backend API Gateway</span>
                <span className="sa-health-indicator"><span className="sa-health-dot healthy"></span> {systemHealth.apiStatus}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#cbd5e1" }}>MongoDB Cluster</span>
                <span className="sa-health-indicator">
                  <span className={`sa-health-dot ${systemHealth.mongodbStatus === "Healthy" ? "healthy" : "error"}`}></span>
                  {systemHealth.mongodbStatus}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Redis Event Cache</span>
                <span className="sa-health-indicator">
                  <span className={`sa-health-dot ${systemHealth.redisStatus === "Healthy" ? "healthy" : "error"}`}></span>
                  {systemHealth.redisStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tables Section */}
      <div className="sa-dashboard-grid">
        {/* Recent Users Table */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h3>Recent Users</h3>
          </div>
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u._id}>
                    <td>{u.profile?.name || "N/A"}</td>
                    <td>{u.email}</td>
                    <td><span className={`sa-badge sa-badge-${u.role?.replace('_','')}`}>{u.role}</span></td>
                    <td><span className={`sa-badge sa-badge-${u.status}`}>{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h3>Recent Scans</h3>
          </div>
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Scan Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map(s => (
                  <tr key={s._id}>
                    <td>{s.domainId?.domain || "Unknown Domain"}</td>
                    <td>{s.scanType}</td>
                    <td>
                      <span className={`sa-badge ${s.status === "Completed" ? "sa-badge-active" : s.status === "Failed" ? "sa-badge-suspended" : "sa-badge-user"}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
