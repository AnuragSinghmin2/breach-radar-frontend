import ProtectedRoute from "./ProtectedRoute";

export default function SuperAdminRoute({ children }) {
  return <ProtectedRoute allowedRoles={["super_admin"]}>{children}</ProtectedRoute>;
}
