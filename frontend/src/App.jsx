import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import AdminPanel from "./pages/AdminPanel";
import Layout from "./layout/Layout";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";

function App() {
  return (
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
  );
}

export default App;
