import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminRoute from "./components/SuperAdminRoute";
import PublicAuthRoute from "./components/PublicAuthRoute";
import SignInPage from "./components/SignInPage";
import Domains from "./components/Domains";
import Scans from "./components/Scans";
import SettingsPage from "./components/SettingsPage";
import Reports from "./components/Reports";
import Monitoring from "./components/Monitoring";
import Remediation from "./components/Remediation";
import VulnerabilitiesTable from "./components/VulnerabilitiesTable";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import SuperAdminLayout from "./components/SuperAdminLayout";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import SuperAdminUsers from "./components/SuperAdminUsers";
import SuperAdminDomains from "./components/SuperAdminDomains";
import SuperAdminScans from "./components/SuperAdminScans";
import SuperAdminVulnerabilities from "./components/SuperAdminVulnerabilities";
import SuperAdminReports from "./components/SuperAdminReports";
import SuperAdminSubscriptions from "./components/SuperAdminSubscriptions";
import SuperAdminPayments from "./components/SuperAdminPayments";
import SuperAdminTickets from "./components/SuperAdminTickets";
import SuperAdminAuditLogs from "./components/SuperAdminAuditLogs";
import SuperAdminSystemHealth from "./components/SuperAdminSystemHealth";
import SuperAdminSettings from "./components/SuperAdminSettings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <SignInPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicAuthRoute>
            <RegisterPage />
          </PublicAuthRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/domains" element={<Domains />} />
        <Route path="/scans" element={<Scans />} />
        <Route path="/vulnerabilities" element={<VulnerabilitiesTable />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/remediation" element={<Remediation />} />
        <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
        <Route path="/settings/:section" element={<SettingsPage />} />
      </Route>

      <Route
        path="/super-admin"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <SuperAdminLayout />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="users" element={<SuperAdminUsers />} />
        <Route path="domains" element={<SuperAdminDomains />} />
        <Route path="scans" element={<SuperAdminScans />} />
        <Route path="vulnerabilities" element={<SuperAdminVulnerabilities />} />
        <Route path="reports" element={<SuperAdminReports />} />
        <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
        <Route path="payments" element={<SuperAdminPayments />} />
        <Route path="tickets" element={<SuperAdminTickets />} />
        <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
        <Route path="system-health" element={<SuperAdminSystemHealth />} />
        <Route path="settings" element={<SuperAdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
