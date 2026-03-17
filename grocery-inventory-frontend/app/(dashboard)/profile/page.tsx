'use client';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchProfile } from '@/store/slices/authSlice';
import authService from '@/services/authService';
import { Card, Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);

  const [name,    setName]    = useState(user?.name ?? '');
  const [saving,  setSaving]  = useState(false);
  const [pwForm,  setPwForm]  = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      await authService.updateProfile({ name });
      await dispatch(fetchProfile());
      toast.success('Profile updated');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPw.length < 8) { toast.error('Min 8 characters'); return; }
    if (!pwForm.current) { toast.error('Current password is required'); return; }
    setPwSaving(true);
    try {
      await authService.changePassword(pwForm.current, pwForm.newPw);
      setPwForm({ current: '', newPw: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password');
    } finally { setPwSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', maxWidth: 560 }}>
      {/* Avatar / info */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--color-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 26,
          }}>
            {user?.avatarInitials ?? user?.name?.slice(0, 2).toUpperCase() ?? '?'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{user?.name}</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 2 }}>{user?.email}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, textTransform: 'capitalize' }}>
              Role: {user?.role}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit name */}
      <Card title="Profile Information">
        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input label="Full name" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Email address" value={user?.email ?? ''} disabled style={{ opacity: 0.65 }} />
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>Email cannot be changed.</p>
          <div>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card title="Change Password">
        <form onSubmit={handlePwChange} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input label="Current password" type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required />
          <Input label="New password" type="password" value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} placeholder="Min 8 characters" required />
          <Input label="Confirm new password" type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
          <div>
            <Button type="submit" loading={pwSaving}>Change Password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
