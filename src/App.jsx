import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
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
import RegisterPage from "./pages/RegisterPage";

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
