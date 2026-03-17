'use client';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppStore';
import householdService from '@/services/householdService';
import { HouseholdMember } from '@/types';
import { Card, Modal, Button, Input, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

export default function HouseholdPage() {
  const { user } = useAppSelector(s => s.auth);
  const [members,      setMembers]      = useState<HouseholdMember[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [houseName,    setHouseName]    = useState('');
  const [hasHousehold, setHasHousehold] = useState(true);

  // Create-household form
  const [createModal,  setCreateModal]  = useState(false);
  const [newHouseName, setNewHouseName] = useState('');
  const [creating,     setCreating]     = useState(false);

  // Invite modal
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole,  setInviteRole]  = useState<'admin' | 'member'>('member');
  const [inviting,    setInviting]    = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [hRes, mRes] = await Promise.all([
        householdService.get().catch(() => null),
        householdService.getMembers().catch(() => ({ members: [] })),
      ]);
      const h = (hRes as { household?: { name?: string } | null } | null)?.household;
      if (!h) {
        setHasHousehold(false);
        setHouseName('');
        setMembers([]);
      } else {
        setHasHousehold(true);
        setHouseName(h.name ?? '');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMembers((mRes as any)?.members ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newHouseName.trim()) { toast.error('Household name is required'); return; }
    setCreating(true);
    try {
      await householdService.create(newHouseName.trim());
      toast.success('Household created!');
      setCreateModal(false);
      setNewHouseName('');
      load();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create');
    } finally { setCreating(false); }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast.error('Email required'); return; }
    setInviting(true);
    try {
      await householdService.invite(inviteEmail);
      toast.success('Invitation sent!');
      setInviteModal(false); setInviteEmail(''); load();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to invite');
    } finally { setInviting(false); }
  };

  const handleRoleChange = async (memberId: string, role: 'admin' | 'member') => {
    try {
      await householdService.updateMemberRole(memberId, role);
      toast.success('Role updated'); load();
    } catch { toast.error('Failed to update role'); }
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <LoadingSpinner size={36} />
      </div>
    );
  }

  // ── No household yet ─────────────────────────────────────────────────────────
  if (!hasHousehold) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <Card>
          <EmptyState
            icon="🏠"
            title="No Household Yet"
            message="Create a household to start tracking groceries with your family or housemates."
            action={
              <Button onClick={() => setCreateModal(true)}>＋ Create Household</Button>
            }
          />
        </Card>

        <Modal
          open={createModal}
          onClose={() => setCreateModal(false)}
          title="Create Household"
          maxWidth={400}
          footer={
            <>
              <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} loading={creating}>Create</Button>
            </>
          }
        >
          <Input
            label="Household name"
            value={newHouseName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHouseName(e.target.value)}
            placeholder="e.g. Smith Family"
            required
          />
        </Modal>
      </div>
    );
  }

  // ── Has household ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Household info */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{houseName || 'Your Household'}</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setInviteModal(true)}>＋ Invite Member</Button>
          )}
        </div>
      </Card>

      {/* Members list */}
      <Card title="Members">
        {members.length === 0 ? (
          <EmptyState icon="👤" title="No members yet" />
        ) : (
          <div>
            {members.map((m, idx) => (
              <div
                key={m.userId._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  padding: '12px 0',
                  borderBottom: idx < members.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--color-primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {(m.userId.name ?? m.userId.email ?? '?').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{m.userId.name ?? '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {m.userId.email} · Joined {formatDate(m.joinedAt)}
                  </div>
                </div>
                {isAdmin && m.userId._id !== user?._id ? (
                  <select
                    value={m.role}
                    onChange={e => handleRoleChange(m.userId._id, e.target.value as 'admin' | 'member')}
                    style={{ padding: '5px 10px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 13 }}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <Badge variant={m.role === 'admin' ? 'info' : 'neutral'}>{m.role}</Badge>
                )}
                {m.userId._id === user?._id && <Badge variant="success">You</Badge>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      <Modal
        open={inviteModal}
        onClose={() => setInviteModal(false)}
        title="Invite Member"
        maxWidth={400}
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button onClick={handleInvite} loading={inviting}>Send Invite</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input
            label="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
            placeholder="member@example.com"
            required
          />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Role</label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as 'admin' | 'member')}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14 }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
