import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Boxes, Activity, ScrollText, User, LogOut } from 'lucide-react';
import { authService } from '../../services/authService';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'Applications', icon: Boxes },
  { to: '/usage', label: 'Usage Logs', icon: Activity },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // ignore — log out client-side regardless
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <aside className="w-60 shrink-0 min-h-screen glass border-r border-white/[0.06] p-5 flex flex-col">
      <h1 className="font-display text-xl text-text-primary mb-8 px-2">API Platform</h1>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-colors ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-secondary hover:bg-white/[0.05] hover:text-text-primary'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Log out
      </button>
    </aside>
  );
}