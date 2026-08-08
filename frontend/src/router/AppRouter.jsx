import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Applications from '../pages/Applications/Applications.jsx';
import ApplicationDetails from '../pages/ApplicationDetails/ApplicationDetails.jsx';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/applications" element={<RequireAuth><Applications /></RequireAuth>} />
       <Route path="/applications/:id" element={<RequireAuth><ApplicationDetails /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}