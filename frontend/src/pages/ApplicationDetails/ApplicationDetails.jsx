import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Copy, RotateCw, Ban, RefreshCcw, Trash2, Check } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { apiKeyService } from '../../services/apiKeyService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyForm, setKeyForm] = useState({ name: '', rateLimit: 60 });
  const [creating, setCreating] = useState(false);
  const [newRawKey, setNewRawKey] = useState(null);
  const [copied, setCopied] = useState(false);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [appData, keysData] = await Promise.all([
        applicationService.getOne(id),
        apiKeyService.listForApplication(id),
      ]);
      setApp(appData.application);
      setKeys(keysData.apiKeys);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleCreateKey(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const data = await apiKeyService.create(id, keyForm);
      setNewRawKey(data.apiKey);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    setNewRawKey(null);
    setKeyForm({ name: '', rateLimit: 60 });
  }

  function copyKey() {
    navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleRevoke(keyId) {
    try {
      await apiKeyService.revoke(keyId);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRestore(keyId) {
    try {
      await apiKeyService.restore(keyId);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRotate(keyId) {
    if (!confirm('Rotate this key? The old key will stop working immediately.')) return;
    try {
      const data = await apiKeyService.rotate(keyId);
      setNewRawKey(data.apiKey);
      setShowCreateModal(true);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteKey(keyId) {
    if (!confirm('Permanently delete this key?')) return;
    try {
      await apiKeyService.remove(keyId);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p className="text-text-secondary font-body px-6 py-10">Loading…</p>;
  }

  if (!app) {
    return <p className="text-danger font-body px-6 py-10">Application not found.</p>;
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <Link
        to="/applications"
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 font-body w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to applications
      </Link>

      <Card className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl text-text-primary">{app.name}</h1>
            <p className="font-body text-sm text-text-secondary mt-1">
              {app.description || 'No description'}
            </p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-body ${
              app.status === 'active' ? 'bg-success/15 text-success' : 'bg-text-tertiary/15 text-text-tertiary'
            }`}
          >
            {app.status}
          </span>
        </div>
        <p className="font-mono text-xs text-text-tertiary mt-4">
          {app.environment} · created {new Date(app.created_at).toLocaleDateString()}
        </p>
      </Card>

      {error && <p className="text-danger text-sm mb-4 font-body">{error}</p>}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-text-primary">API Keys</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate key
        </Button>
      </div>

      {keys.length === 0 ? (
        <Card className="text-center py-10">
          <p className="font-body text-text-secondary">No API keys yet for this application.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key, i) => {
            const isRevoked = !!key.revoked_at;
            return (
              <Card key={key.id} delay={i * 0.05}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-body font-medium text-text-primary">{key.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-body ${
                          isRevoked ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
                        }`}
                      >
                        {isRevoked ? 'Revoked' : 'Active'}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-text-tertiary mt-1">{key.key_prefix}</p>
                    <p className="font-body text-xs text-text-secondary mt-1">
                      {key.rate_limit} req/min · scopes: {key.scopes?.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRotate(key.id)}
                      title="Rotate"
                      className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                    >
                      <RotateCw className="w-4 h-4 text-text-secondary" />
                    </button>
                    {isRevoked ? (
                      <button
                        onClick={() => handleRestore(key.id)}
                        title="Restore"
                        className="p-2 rounded-lg hover:bg-success/15 transition-colors"
                      >
                        <RefreshCcw className="w-4 h-4 text-success" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRevoke(key.id)}
                        title="Revoke"
                        className="p-2 rounded-lg hover:bg-secondary/15 transition-colors"
                      >
                        <Ban className="w-4 h-4 text-secondary" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      title="Delete"
                      className="p-2 rounded-lg hover:bg-danger/15 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={closeCreateModal} title={newRawKey ? 'Save your key' : 'Generate API key'}>
        {!newRawKey ? (
          <form onSubmit={handleCreateKey}>
            <Input
              label="Key name"
              placeholder="e.g. Production key"
              value={keyForm.name}
              onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
              required
            />
            <div className="mb-4">
              <label className="block font-body text-sm text-text-secondary mb-1.5">
                Rate limit (requests/min)
              </label>
              <input
                type="number"
                min="1"
                value={keyForm.rateLimit}
                onChange={(e) => setKeyForm({ ...keyForm, rateLimit: Number(e.target.value) })}
                className="w-full rounded-xl glass px-4 py-2.5 text-text-primary font-body focus:outline-none"
              />
            </div>
            <Button type="submit" disabled={creating} className="w-full">
              {creating ? 'Generating…' : 'Generate key'}
            </Button>
          </form>
        ) : (
          <>
            <p className="font-body text-sm text-text-secondary mb-3">
              This is the only time you'll see the full key. Copy it now.
            </p>
            <div className="glass rounded-xl p-3 font-mono text-sm text-text-primary break-all mb-4">
              {newRawKey}
            </div>
            <div className="flex gap-2">
              <Button onClick={copyKey} className="flex-1 flex items-center justify-center gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy key'}
              </Button>
              <Button variant="secondary" onClick={closeCreateModal}>
                Done
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}