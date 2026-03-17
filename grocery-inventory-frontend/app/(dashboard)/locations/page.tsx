'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { locationService } from '@/services/householdService';
import { Location } from '@/types';
import { Modal, Button, Input, Textarea, EmptyState, LoadingSpinner } from '@/components/ui';
import toast from 'react-hot-toast';
import styles from './page.module.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const LOCATION_ICONS: Array<[string, string]> = [
  ['refrigerat', '🧊'], ['fridge', '🧊'], ['freezer', '❄️'], ['pantry', '🗄️'],
  ['cabinet', '🚪'], ['cupboard', '🚪'], ['counter', '🍽️'], ['shelf', '📚'],
  ['drawer', '🗃️'], ['basket', '🧺'], ['garage', '🏠'], ['cellar', '🍷'],
  ['laundry', '🧺'], ['bathroom', '🪥'],
];

const getIcon = (name: string): string => {
  const lower = name.toLowerCase();
  for (const [key, icon] of LOCATION_ICONS) {
    if (lower.includes(key)) return icon;
  }
  return '📍';
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  // Pagination
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit,    setIsEdit]    = useState(false);
  const [editId,    setEditId]    = useState('');
  const [name,      setName]      = useState('');
  const [desc,      setDesc]      = useState('');
  const [saving,    setSaving]    = useState(false);

  // Delete confirm
  const [delTarget, setDelTarget] = useState<Location | null>(null);

  const load = () => {
    setLoading(true);
    locationService.getAll()
      .then(r => setLocations(r.data?.locations ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(l =>
      l.name.toLowerCase().includes(q) ||
      (l.description ?? '').toLowerCase().includes(q)
    );
  }, [locations, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => { setPage(1); }, [search, pageSize]);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setIsEdit(false); setEditId(''); setName(''); setDesc(''); setShowModal(true);
  };

  const openEdit = (loc: Location) => {
    setIsEdit(true); setEditId(loc._id);
    setName(loc.name); setDesc(loc.description ?? ''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await locationService.update(editId, { name, description: desc });
        toast.success('Location updated');
      } else {
        await locationService.create({ name, description: desc });
        toast.success('Location created');
      }
      setShowModal(false); load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (loc: Location) => {
    try {
      await locationService.delete(loc._id);
      toast.success('Deleted'); setDelTarget(null); load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className={styles.page}>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="🔍  Search locations…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.toolbarRight}>
          <span className={styles.totalLabel}>
            {filtered.length} location{filtered.length === 1 ? '' : 's'}
          </span>
          <Button onClick={openAdd}>＋ New Location</Button>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className={styles.centered}><LoadingSpinner size={32} /></div>
      ) : locations.length === 0 ? (
        <EmptyState
          icon="📍"
          title="No locations yet"
          message="Create storage locations like Fridge, Pantry, Freezer."
          action={<Button onClick={openAdd}>Create Location</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No results" message={`No locations match "${search}".`} />
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} style={{ width: 52 }}>#</th>
                  <th className={styles.th} style={{ width: 48 }}>Icon</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Description</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Items</th>
                  <th className={styles.th}>Created By</th>
                  <th className={styles.th} style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((loc, idx) => (
                  <tr key={loc._id} className={styles.tr}>
                    <td className={styles.td} style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                      {(safePage - 1) * pageSize + idx + 1}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.iconCell}>{getIcon(loc.name)}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.locName}>{loc.name}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.descCell}>{loc.description || '—'}</span>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <span className={styles.countBadge}>{loc.itemCount ?? 0}</span>
                    </td>
                    <td className={styles.td} style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                      {loc.createdBy?.name ?? '—'}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => openEdit(loc)} title="Edit">✏️</button>
                        <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => setDelTarget(loc)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className={styles.pagination}>
            <div className={styles.pageLeft}>
              <span className={styles.pageInfo}>
                Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
              </span>
              <select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} / page</option>)}
              </select>
            </div>
            <div className={styles.pageRight}>
              <button className={styles.pageBtn} onClick={() => setPage(1)} disabled={safePage === 1} title="First">«</button>
              <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} title="Prev">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…'
                    ? <span key={`e${i}`} className={styles.ellipsis}>…</span>
                    : <button key={p} className={`${styles.pageBtn} ${p === safePage ? styles.activePage : ''}`} onClick={() => setPage(p as number)}>{p}</button>
                )}
              <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} title="Next">›</button>
              <button className={styles.pageBtn} onClick={() => setPage(totalPages)} disabled={safePage === totalPages} title="Last">»</button>
            </div>
          </div>
        </>
      )}

      {/* ── Add / Edit modal ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={isEdit ? 'Edit Location' : 'New Location'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{isEdit ? 'Save Changes' : 'Create'}</Button>
          </>
        }
        maxWidth={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fridge, Pantry" required />
          <Textarea label="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Top shelf of the kitchen fridge" />
        </div>
      </Modal>

      {/* ── Delete confirm ── */}
      <Modal
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        title="Delete Location"
        maxWidth={380}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDelTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => delTarget && handleDelete(delTarget)}>Delete</Button>
          </>
        }
      >
        <p style={{ fontSize: 15, color: 'var(--color-text-secondary)' }}>
          Delete <strong>{delTarget?.name}</strong>?{' '}
          {(delTarget?.itemCount ?? 0) > 0
            ? `${delTarget?.itemCount} item(s) stored here won't be deleted, just unlinked.`
            : "Inventory items stored here won't be affected."}
        </p>
      </Modal>
    </div>
  );
}
