import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import Layout from "./layout/Layout";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Projects = lazy(() => import("./pages/Projects"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    }>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected — wrapped in Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* All authenticated users */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />

        {/* Admin only */}
        <Route path="/projects" element={<AdminRoute><Projects /></AdminRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </Suspense>
  );
}

export default App;
