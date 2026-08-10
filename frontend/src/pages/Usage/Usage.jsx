import { useEffect, useState } from 'react';
import { usageService } from '../../services/usageService';
import { applicationService } from '../../services/applicationService';
import Table from '../../components/tables/Table';
import Pagination from '../../components/ui/Pagination';

const STATUS_COLORS = {
  2: 'text-success',
  4: 'text-secondary',
  5: 'text-danger',
};

function statusColor(code) {
  return STATUS_COLORS[Math.floor(code / 100)] || 'text-text-secondary';
}

export default function Usage() {
  const [logs, setLogs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [applicationId, setApplicationId] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationService.list().then((data) => setApplications(data.data)).catch(() => {});
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (applicationId) params.applicationId = applicationId;
      if (status) params.status = status;
      if (method) params.method = method;
      const data = await usageService.list(params);
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
  }, [page, applicationId, status, method]);

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl text-text-primary mb-1">Usage Logs</h1>
      <p className="font-body text-sm text-text-secondary mb-6">
        Every request made against your API keys
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={applicationId}
          onChange={(e) => { setApplicationId(e.target.value); setPage(1); }}
          className="rounded-xl glass px-4 py-2.5 text-text-primary font-body focus:outline-none"
        >
          <option value="">All applications</option>
          {applications.map((app) => (
            <option key={app.id} value={app.id}>{app.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl glass px-4 py-2.5 text-text-primary font-body focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="200">200 OK</option>
          <option value="201">201 Created</option>
          <option value="404">404 Not Found</option>
          <option value="429">429 Rate Limited</option>
          <option value="500">500 Server Error</option>
        </select>
        <select
          value={method}
          onChange={(e) => { setMethod(e.target.value); setPage(1); }}
          className="rounded-xl glass px-4 py-2.5 text-text-primary font-body focus:outline-none"
        >
          <option value="">All methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

     {loading ? (
  <p className="text-text-secondary font-body">Loading usage logs…</p>
) : error ? (
  <p className="text-danger font-body">{error}</p>
) : logs.length === 0 ? (
        <div className="glass rounded-2xl text-center py-12">
          <p className="font-body text-text-secondary">No usage logs match these filters.</p>
        </div>
      ) : (
        <>
          <Table columns={['Endpoint', 'Method', 'Status', 'Response Time', 'Application', 'Key', 'Time']}>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-mono text-sm text-text-primary">{log.endpoint}</td>
                <td className="px-5 py-3 font-mono text-xs text-text-secondary">{log.method}</td>
                <td className={`px-5 py-3 font-mono text-sm font-medium ${statusColor(log.status_code)}`}>
                  {log.status_code}
                </td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">{log.response_time_ms}ms</td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">{log.application_name}</td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">{log.key_name}</td>
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