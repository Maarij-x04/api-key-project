import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import Table from '../../components/tables/Table';
import Pagination from '../../components/ui/Pagination';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminService.listAuditLogs({ page, limit });
        setLogs(data.data);
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
      <h1 className="font-display text-3xl text-text-primary mb-1">Platform Audit Logs</h1>
      <p className="font-body text-sm text-text-secondary mb-6">
        Every recorded action across every user account
      </p>

      {loading ? (
        <p className="text-text-secondary font-body">Loading…</p>
      ) : error ? (
        <p className="text-danger font-body">{error}</p>
      ) : (
        <>
          <Table columns={['User ID', 'Action', 'Entity', 'Entity ID', 'IP', 'Time']}>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-text-secondary">{log.user_id ?? '—'}</td>
                <td className="px-5 py-3 font-body text-sm text-text-primary">{log.action}</td>
                <td className="px-5 py-3 font-mono text-xs text-text-secondary">{log.entity_type || '—'}</td>
                <td className="px-5 py-3 font-mono text-xs text-text-secondary">{log.entity_id ?? '—'}</td>
                <td className="px-5 py-3 font-mono text-xs text-text-tertiary">{log.ip_address || '—'}</td>
                <td className="px-5 py-3 font-body text-xs text-text-tertiary">
                  {new Date(log.created_at).toLocaleString()}
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