import { useEffect, useState } from 'react';
import { Search, Trash2, ShieldCheck, Shield } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Table from '../../components/tables/Table';
import Pagination from '../../components/ui/Pagination';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (search) params.search = search;
      const data = await adminService.listUsers(params);
      setUsers(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, search]);

  async function toggleRole(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${user.name}'s role to "${newRole}"?`)) return;
    try {
      await adminService.updateUser(user.id, { role: newRole });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(user) {
    if (!confirm(`Permanently delete ${user.name}'s account? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(user.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="px-8 py-10 max-w-6xl">
      <h1 className="font-display text-3xl text-text-primary mb-1">Users</h1>
      <p className="font-body text-sm text-text-secondary mb-6">
        Manage every account on the platform
      </p>

      <div className="relative max-w-sm mb-6">
        <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-xl glass pl-10 pr-4 py-2.5 text-text-primary font-body placeholder:text-text-tertiary focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-text-secondary font-body">Loading users…</p>
      ) : error ? (
        <p className="text-danger font-body">{error}</p>
      ) : users.length === 0 ? (
        <div className="glass rounded-2xl text-center py-12">
          <p className="font-body text-text-secondary">No users match this search.</p>
        </div>
      ) : (
        <>
          <Table columns={['Name', 'Email', 'Role', 'Joined', 'Actions']}>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-body text-sm text-text-primary">{u.name}</td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">{u.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-body capitalize ${
                      u.role === 'admin' ? 'bg-secondary/15 text-secondary' : 'bg-white/[0.06] text-text-secondary'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 font-body text-xs text-text-tertiary">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleRole(u)}
                      title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                      className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                    >
                      {u.role === 'admin' ? (
                        <Shield className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-secondary" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      title="Delete user"
                      className="p-2 rounded-lg hover:bg-danger/15 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </button>
                  </div>
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