import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import StatsCards from "./components/StatsCards";
import ChartSection from "./components/ChartSection";
import BottomSection from "./components/BottomSection";
import Domains from "./components/Domains";
import Scans from "./components/Scans";
import SettingsPage from "./components/SettingsPage";
import Reports from "./components/Reports";
import Monitoring from "./components/Monitoring";
import Remediation from "./components/Remediation";
import SessionHandoff from "./pages/SessionHandoff";
import VulnerabilitiesTable from "./components/VulnerabilitiesTable";
import MonitoringWidgets from "./components/MonitoringWidgets";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/session-handoff" element={<SessionHandoff />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={
            <>
              <StatsCards />
              <MonitoringWidgets />
              <div className="middle-section">
                <ChartSection />
              </div>
              <BottomSection />
            </>
          }
        />
        <Route path="/domains" element={<Domains />} />
        <Route path="/scans" element={<Scans />} />
        <Route path="/vulnerabilities" element={<VulnerabilitiesTable />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/remediation" element={<Remediation />} />
        <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
        <Route path="/settings/:section" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
