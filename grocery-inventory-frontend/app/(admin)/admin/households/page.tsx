'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService, { AdminHousehold } from '@/services/adminService';
import styles from './households.module.css';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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

// ── Delete Modal ──────────────────────────────────────────────────────────────
interface DeleteModalProps {
  household: AdminHousehold;
  onClose: () => void;
  onDeleted: (id: string) => void;
}
function DeleteModal({ household, onClose, onDeleted }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteHousehold(household._id);
      onDeleted(household._id);
      toast.success('Household deleted');
      onClose();
    } catch {
      toast.error('Failed to delete household');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalDanger}`} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Delete Household</h2>
        <p className={styles.deleteMessage}>
          Are you sure you want to permanently delete{' '}
          <span className={styles.deleteHighlight}>{household.name}</span>?
          {' '}This will remove the household and all its data. This action cannot be undone.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={`${styles.confirmBtn} ${styles.confirmDangerBtn}`}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete Household'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminHouseholdsPage() {
  const [households,   setHouseholds]   = useState<AdminHousehold[]>([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminHousehold | null>(null);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getHouseholds({
        page, limit: pageSize, search: search || undefined,
      });
      setHouseholds(data.households);
      setTotal(data.pagination.total);
    } catch {
      toast.error('Failed to load households');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, pageSize]);

  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Households</h1>
          <p className={styles.pageSub}>Manage all registered households</p>
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
            placeholder="Search by household name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
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
                <th className={styles.th}>Household</th>
                <th className={styles.th}>Created By</th>
                <th className={styles.th}>Members</th>
                <th className={styles.th}>Inventory</th>
                <th className={styles.th}>Created</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={7}>Loading households…</td>
                </tr>
              ) : households.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={7}>No households found.</td>
                </tr>
              ) : (
                households.map((h, idx) => (
                  <tr key={h._id} className={styles.tr}>
                    <td className={styles.td} style={{ color: '#64748b', width: 40 }}>{start + idx}</td>
                    <td className={styles.td}>
                      <div className={styles.householdName}>
                        <span className={styles.householdIcon}>🏠</span>
                        {h.name}
                      </div>
                    </td>
                    <td className={styles.td}>
                      {h.createdBy ? (
                        <div>
                          <div style={{ color: '#0f172a', fontWeight: 500, fontSize: 13 }}>{h.createdBy.name}</div>
                          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 1 }}>{h.createdBy.email}</div>
                        </div>
                      ) : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.countBadge}>{h.members.length}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.countBadge}>{h.inventoryCount}</span>
                    </td>
                    <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>{fmtDate(h.createdAt)}</td>
                    <td className={styles.td}>
                      <button
                        className={`${styles.actionBtn} ${styles.dangerBtn}`}
                        onClick={() => setDeleteTarget(h)}
                      >Delete</button>
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
            {total === 0 ? 'No households' : `Showing ${start}–${end} of ${total} households`}
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

      {deleteTarget && (
        <DeleteModal
          household={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={id => { setHouseholds(prev => prev.filter(h => h._id !== id)); setTotal(t => t - 1); }}
        />
      )}
    </div>
  );
}
