import { useEffect, useState } from 'react';
import { auditService } from '../../services/auditService';
import Table from '../../components/tables/Table';
import Pagination from '../../components/ui/Pagination';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (action) params.action = action;
      if (entityType) params.entityType = entityType;
      const data = await auditService.list(params);
      setLogs(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, action, entityType]);

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl text-text-primary mb-1">Audit Logs</h1>
      <p className="font-body text-sm text-text-secondary mb-6">
        A permanent record of every important action on your account
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          className="rounded-xl glass px-4 py-2.5 text-text-primary font-body focus:outline-none"
        >
          <option value="">All entity types</option>
          <option value="user">User</option>
          <option value="application">Application</option>
          <option value="api_key">API Key</option>
        </select>
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="rounded-xl glass px-4 py-2.5 text-text-primary font-body focus:outline-none"
        >
          <option value="">All actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="generated_key">Generated key</option>
          <option value="revoked_key">Revoked key</option>
          <option value="rotated_key">Rotated key</option>
          <option value="logged_in">Logged in</option>
        </select>
      </div>

      {loading ? (
        <p className="text-text-secondary font-body">Loading audit logs…</p>
      ) : error ? (
        <p className="text-danger font-body">{error}</p>
      ) : logs.length === 0 ? (
        <div className="glass rounded-2xl text-center py-12">
          <p className="font-body text-text-secondary">No audit logs match these filters.</p>
        </div>
      ) : (
        <>
          <Table columns={['Action', 'Entity', 'Entity ID', 'IP Address', 'Time']}>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-body text-sm text-text-primary">{log.action}</td>
                <td className="px-5 py-3 font-mono text-xs text-text-secondary">{log.entity_type || '—'}</td>
                <td className="px-5 py-3 font-mono text-xs text-text-secondary">{log.entity_id || '—'}</td>
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