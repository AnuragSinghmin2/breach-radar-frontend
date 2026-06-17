import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import UserRoute from "./components/UserRoute";
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
import InviteAcceptPage from "./pages/InviteAcceptPage";
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

function LegacyDashboardRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to={`/dashboard${location.pathname}${location.search}${location.hash}`}
      replace
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/invite/:token" element={<InviteAcceptPage />} />

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
        path="/dashboard"
        element={
          <UserRoute>
            <AppLayout />
          </UserRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="domains" element={<Domains />} />
        <Route path="scans" element={<Scans />} />
        <Route path="vulnerabilities" element={<VulnerabilitiesTable />} />
        <Route path="reports" element={<Reports />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="remediation" element={<Remediation />} />
        <Route path="settings" element={<Navigate to="/dashboard/settings/profile" replace />} />
        <Route path="settings/:section" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="/domains" element={<LegacyDashboardRedirect />} />
      <Route path="/scans" element={<LegacyDashboardRedirect />} />
      <Route path="/vulnerabilities" element={<LegacyDashboardRedirect />} />
      <Route path="/reports" element={<LegacyDashboardRedirect />} />
      <Route path="/monitoring" element={<LegacyDashboardRedirect />} />
      <Route path="/remediation" element={<LegacyDashboardRedirect />} />
      <Route path="/settings" element={<Navigate to="/dashboard/settings/profile" replace />} />
      <Route path="/settings/:section" element={<LegacyDashboardRedirect />} />

      <Route
        path="/super-admin"
        element={
          <SuperAdminRoute>
            <SuperAdminLayout />
          </SuperAdminRoute>
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
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
