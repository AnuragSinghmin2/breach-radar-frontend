import ProtectedRoute from "./ProtectedRoute";

export default function UserRoute({ children }) {
  return <ProtectedRoute allowedRoles={["user"]}>{children}</ProtectedRoute>;
}
