'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService, { AdminUser } from '@/services/adminService';
import styles from './users.module.css';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const ROLES = ['admin', 'member', 'superadmin'] as const;
type Role = typeof ROLES[number];

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function roleCls(role: string) {
  if (role === 'superadmin') return styles.roleSuperadmin;
  if (role === 'admin')      return styles.roleAdmin;
  return styles.roleMember;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function buildPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [];
  pages.push(1);
  if (current > 3) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
interface EditModalProps {
  user: AdminUser;
  onClose: () => void;
  onSaved: (u: AdminUser) => void;
}
function EditModal({ user, onClose, onSaved }: EditModalProps) {
  const [name,    setName]    = useState(user.name);
  const [role,    setRole]    = useState<Role>(user.role as Role);
  const [saving,  setSaving]  = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await adminService.updateUser(user._id, { name: name.trim(), role });
      onSaved(updated);
      toast.success('User updated');
      onClose();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Edit User</h2>
        <p className={styles.modalSub}>{user.email}</p>

        <label className={styles.fieldLabel}>Name</label>
        <input
          className={styles.fieldInput}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Full name"
        />

        <label className={styles.fieldLabel}>Role</label>
        <select className={styles.fieldSelect} value={role} onChange={e => setRole(e.target.value as Role)}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.confirmBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
interface DeleteModalProps {
  user: AdminUser;
  onClose: () => void;
  onDeleted: (id: string) => void;
}
function DeleteModal({ user, onClose, onDeleted }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteUser(user._id);
      onDeleted(user._id);
      toast.success('User deleted');
      onClose();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalDanger}`} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Delete User</h2>
        <p className={styles.deleteMessage}>
          Are you sure you want to permanently delete{' '}
          <span className={styles.deleteHighlight}>{user.name}</span> ({user.email})?
          This action cannot be undone.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={`${styles.confirmBtn} ${styles.confirmDangerBtn}`}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,      setUsers]      = useState<AdminUser[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(10);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [editUser,   setEditUser]   = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        page, limit: pageSize, search: search || undefined, role: roleFilter || undefined,
      });
      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, roleFilter, pageSize]);

  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Users</h1>
          <p className={styles.pageSub}>Manage all registered users</p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.roleFilter} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <select className={styles.pageSizeSelect} value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>User</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Household</th>
                <th className={styles.th}>Joined</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={6}>Loading users…</td>
                </tr>
              ) : users.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={6}>No users found.</td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u._id} className={styles.tr}>
                    <td className={styles.td} style={{ color: '#64748b', width: 40 }}>{start + idx}</td>
                    <td className={styles.td}>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{initials(u.name)}</div>
                        <div>
                          <div className={styles.userName}>{u.name}</div>
                          <div className={styles.userEmail}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.roleBadge} ${roleCls(u.role)}`}>{u.role}</span>
                    </td>
                    <td className={styles.td}>
                      {u.householdId ? u.householdId.name : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>{fmtDate(u.createdAt)}</td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => setEditUser(u)}>Edit</button>
                        <button
                          className={`${styles.actionBtn} ${styles.dangerBtn}`}
                          onClick={() => setDeleteUser(u)}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className={styles.footer}>
          <span className={styles.footerInfo}>
            {total === 0 ? 'No users' : `Showing ${start}–${end} of ${total} users`}
          </span>
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {buildPages(page, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className={styles.pageBtn} style={{ cursor: 'default', opacity: 0.5 }}>…</span>
              ) : (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(p)}
                >{p}</button>
              )
            )}
            <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editUser   && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={updated => setUsers(prev => prev.map(u => u._id === updated._id ? updated : u))}
        />
      )}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={id => { setUsers(prev => prev.filter(u => u._id !== id)); setTotal(t => t - 1); }}
        />
      )}
    </div>
  );
}
