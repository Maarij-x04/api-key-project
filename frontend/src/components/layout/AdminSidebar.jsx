import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Boxes, ScrollText, LogOut, ArrowLeftRight } from 'lucide-react';
import { authService } from '../../services/authService';

const navItems = [
  { to: '/admin', label: 'Overview', icon: ShieldCheck, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/applications', label: 'Applications', icon: Boxes },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-black/40 backdrop-blur-xl border-r border-secondary/20 p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-1 px-2">
        <ShieldCheck className="w-5 h-5 text-secondary" />
        <h1 className="font-display text-lg text-text-primary">Admin Console</h1>
      </div>
      <p className="font-body text-xs text-text-tertiary mb-8 px-2">Platform-wide control</p>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-colors ${
                isActive
                  ? 'bg-secondary/15 text-secondary'
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