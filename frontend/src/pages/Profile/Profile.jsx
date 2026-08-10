import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, KeyRound, Check } from 'lucide-react';
import { authService } from '../../services/authService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await authService.me();
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-text-secondary font-body px-6 py-10">Loading…</p>;
  }

  if (error) {
    return <p className="text-danger font-body px-6 py-10">{error}</p>;
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-text-primary mb-1">Profile</h1>
      <p className="font-body text-sm text-text-secondary mb-6">
        Your account information and security settings
      </p>

      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl text-text-primary">{user.name}</h2>
            <p className="font-body text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
          <div>
            <p className="font-body text-xs text-text-tertiary uppercase tracking-wide">Role</p>
            <p className="font-body text-sm text-text-primary capitalize">{user.role || 'user'}</p>
          </div>
          <div>
            <p className="font-body text-xs text-text-tertiary uppercase tracking-wide">Joined</p>
            <p className="font-body text-sm text-text-primary">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <KeyRound className="w-5 h-5 text-secondary" />
          <h2 className="font-display text-xl text-text-primary">Change password</h2>
        </div>

        <form onSubmit={handleChangePassword}>
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />

          {passwordError && (
            <p className="text-danger text-sm mb-4 -mt-1 font-body">{passwordError}</p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-success text-sm mb-4 -mt-1 font-body flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Password updated successfully
            </motion.p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}