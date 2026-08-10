import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import Table from '../../components/tables/Table';
import Pagination from '../../components/ui/Pagination';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminService.listApplications({ page, limit });
        setApplications(data.data);
        setTotal(data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  return (
    <div className="px-8 py-10 max-w-6xl">
      <h1 className="font-display text-3xl text-text-primary mb-1">All Applications</h1>
      <p className="font-body text-sm text-text-secondary mb-6">
        Every application across every user account
      </p>

      {loading ? (
        <p className="text-text-secondary font-body">Loading applications…</p>
      ) : error ? (
        <p className="text-danger font-body">{error}</p>
      ) : applications.length === 0 ? (
        <div className="glass rounded-2xl text-center py-12">
          <p className="font-body text-text-secondary">No applications on the platform yet.</p>
        </div>
      ) : (
        <>
          <Table columns={['Name', 'Owner', 'Environment', 'Status', 'Created']}>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-body text-sm text-text-primary">{app.name}</td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">
                  {app.owner_name} <span className="text-text-tertiary">({app.owner_email})</span>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-text-secondary">{app.environment}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-body ${
                      app.status === 'active' ? 'bg-success/15 text-success' : 'bg-text-tertiary/15 text-text-tertiary'
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="px-5 py-3 font-body text-xs text-text-tertiary">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}