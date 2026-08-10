import { useEffect, useState } from 'react';
import { Users, Boxes, ScrollText } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';

export default function AdminOverview() {
  const [users, setUsers] = useState({ total: 0 });
  const [applications, setApplications] = useState({ total: 0 });
  const [auditLogs, setAuditLogs] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [u, a, l] = await Promise.all([
          adminService.listUsers({ limit: 1 }),
          adminService.listApplications({ limit: 1 }),
          adminService.listAuditLogs({ limit: 1 }),
        ]);
        setUsers(u);
        setApplications(a);
        setAuditLogs(l);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-text-secondary font-body px-8 py-10">Loading…</p>;
  if (error) return <p className="text-danger font-body px-8 py-10">{error}</p>;

  return (
    <div className="px-8 py-10 max-w-6xl">
      <h1 className="font-display text-3xl text-text-primary mb-1">Platform Overview</h1>
      <p className="font-body text-sm text-text-secondary mb-8">
        Cross-account data across the entire platform
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="font-body text-sm text-text-secondary">Total Users</p>
            <p className="font-display text-2xl text-text-primary">{users.total}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4" delay={0.05}>
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-body text-sm text-text-secondary">Total Applications</p>
            <p className="font-display text-2xl text-text-primary">{applications.total}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4" delay={0.1}>
          <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="font-body text-sm text-text-secondary">Total Audit Events</p>
            <p className="font-display text-2xl text-text-primary">{auditLogs.total}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}