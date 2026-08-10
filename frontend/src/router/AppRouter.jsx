import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Applications from '../pages/Applications/Applications.jsx';
import ApplicationDetails from '../pages/ApplicationDetails/ApplicationDetails.jsx';
import Usage from '../pages/Usage/Usage.jsx';
import AuditLogs from '../pages/AuditLogs/AuditLogs.jsx';
import Profile from '../pages/Profile/Profile.jsx';
import AdminOverview from '../pages/Admin/AdminOverview.jsx';
import AdminUsers from '../pages/Admin/AdminUsers.jsx';
import AdminApplications from '../pages/Admin/AdminApplications.jsx';
import AdminAuditLogs from '../pages/Admin/AdminAuditLogs.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';

function getUser() {
  return JSON.parse(localStorage.getItem('user') || 'null');
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function RequireAdmin({ children }) {
  const token = localStorage.getItem('token');
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/applications" element={<RequireAuth><Applications /></RequireAuth>} />
      <Route path="/applications/:id" element={<RequireAuth><ApplicationDetails /></RequireAuth>} />
      <Route path="/usage" element={<RequireAuth><Usage /></RequireAuth>} />
      <Route path="/audit-logs" element={<RequireAuth><AuditLogs /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

      <Route path="/admin" element={<RequireAdmin><AdminOverview /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
      <Route path="/admin/applications" element={<RequireAdmin><AdminApplications /></RequireAdmin>} />
      <Route path="/admin/audit-logs" element={<RequireAdmin><AdminAuditLogs /></RequireAdmin>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}