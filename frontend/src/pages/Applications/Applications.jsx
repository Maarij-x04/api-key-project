import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Pencil, ArrowRight } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null); // null = creating, object = editing
  const [form, setForm] = useState({ name: '', description: '', environment: 'production' });
  const [saving, setSaving] = useState(false);

  async function loadApplications() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const data = await applicationService.list(params);
      setApplications(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [search, status]);

  function openCreateModal() {
    setEditingApp(null);
    setForm({ name: '', description: '', environment: 'production' });
    setShowModal(true);
  }

  function openEditModal(app) {
    setEditingApp(app);
    setForm({ name: app.name, description: app.description || '', environment: app.environment });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingApp) {
        await applicationService.update(editingApp.id, form);
      } else {
        await applicationService.create(form);
      }
      setShowModal(false);
      loadApplications();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this application? Its API keys will stop working immediately.')) return;
    try {
      await applicationService.remove(id);
      loadApplications();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-text-primary">Applications</h1>
          <p className="font-body text-sm text-text-secondary mt-1">
            Manage the applications tied to your API keys
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New application
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search applications…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl glass pl-10 pr-4 py-2.5 text-text-primary font-body placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-shadow"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl glass px-4 py-2.5 text-text-primary font-body focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <p className="text-danger text-sm mb-4 font-body">{error}</p>}

      {loading ? (
        <p className="text-text-secondary font-body">Loading applications…</p>
      ) : applications.length === 0 ? (
        <Card className="text-center py-12">
          <p className="font-body text-text-secondary">No applications yet — create your first one.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {applications.map((app, i) => (
            <Card key={app.id} delay={i * 0.05} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-xl text-text-primary">{app.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-body ${
                      app.status === 'active'
                        ? 'bg-success/15 text-success'
                        : 'bg-text-tertiary/15 text-text-tertiary'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <p className="font-body text-sm text-text-secondary mt-2 line-clamp-2">
                  {app.description || 'No description'}
                </p>
                <p className="font-mono text-xs text-text-tertiary mt-3">{app.environment}</p>
              </div>

              <div className="flex items-center gap-2 mt-5">
                <Link
                  to={`/applications/${app.id}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline font-body"
                >
                  View details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="flex-1" />
                <button
                  onClick={() => openEditModal(app)}
                  className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                >
                  <Pencil className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                  onClick={() => handleDelete(app.id)}
                  className="p-2 rounded-lg hover:bg-danger/15 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-danger" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingApp ? 'Edit application' : 'New application'}
      >
        <form onSubmit={handleSave}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="mb-4">
            <label className="block font-body text-sm text-text-secondary mb-1.5">Environment</label>
            <select
              value={form.environment}
              onChange={(e) => setForm({ ...form, environment: e.target.value })}
              className="w-full rounded-xl glass px-4 py-2.5 text-text-primary font-body focus:outline-none"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : editingApp ? 'Save changes' : 'Create application'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}