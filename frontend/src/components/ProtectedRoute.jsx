import { Navigate } from "react-router-dom";

/**
 * Redirects to /login if no token is present in sessionStorage.
 */
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Blocks access for non-admin users — redirects to /dashboard.
 */
function AdminRoute({ children }) {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
export { AdminRoute };
