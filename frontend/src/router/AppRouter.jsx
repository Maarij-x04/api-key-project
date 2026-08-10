import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Applications from '../pages/Applications/Applications.jsx';
import ApplicationDetails from '../pages/ApplicationDetails/ApplicationDetails.jsx';
import Usage from '../pages/Usage/Usage.jsx';
import AuditLogs from '../pages/AuditLogs/AuditLogs.jsx';
import Profile from '../pages/Profile/Profile.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}