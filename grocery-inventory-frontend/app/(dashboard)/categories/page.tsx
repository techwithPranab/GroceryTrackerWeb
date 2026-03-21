'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { categoryService } from '@/services/householdService';
import { Category } from '@/types';
import { Modal, Button, Input, EmptyState, LoadingSpinner } from '@/components/ui';
import toast from 'react-hot-toast';
import styles from './page.module.css';

const COLOR_PRESETS = [
  '#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16',
];

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export default function CategoriesPage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');

  // Pagination
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEdit,    setIsEdit]   = useState(false);
  const [editId,    setEditId]   = useState('');
  const [name,      setName]     = useState('');
  const [color,     setColor]    = useState(COLOR_PRESETS[0]);
  const [icon,      setIcon]     = useState('📦');
  const [saving,    setSaving]   = useState(false);

  // Delete confirm
  const [delTarget, setDelTarget] = useState<Category | null>(null);

  const load = () => {
    setLoading(true);
    categoryService.getAll()
      .then(r => setCategories(r.data?.categories ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Reset to page 1 whenever filter changes
  useEffect(() => { setPage(1); }, [search, pageSize]);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setIsEdit(false); setEditId('');
    setName(''); setColor(COLOR_PRESETS[0]); setIcon('📦');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setIsEdit(true); setEditId(cat._id);
    setName(cat.name); setColor(cat.color ?? COLOR_PRESETS[0]); setIcon(cat.icon ?? '📦');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await categoryService.update(editId, { name, color, icon });
        toast.success('Category updated');
      } else {
        await categoryService.create({ name, color, icon });
        toast.success('Category created');
      }
      setShowModal(false); load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cat: Category) => {
    try {
      await categoryService.delete(cat._id);
      toast.success('Deleted'); setDelTarget(null); load();
    } catch { toast.error('Failed to delete'); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="🔍  Search categories…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.toolbarRight}>
          <span className={styles.totalLabel}>
            {filtered.length} categor{filtered.length === 1 ? 'y' : 'ies'}
          </span>
          {isAdmin && <Button onClick={openAdd}>＋ New Category</Button>}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className={styles.centered}><LoadingSpinner size={32} /></div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No categories yet"
          message="Create categories to organise your inventory."
          action={isAdmin ? <Button onClick={openAdd}>Create Category</Button> : undefined}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No results" message={`No categories match "${search}".`} />
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} style={{ width: 52 }}>#</th>
                  <th className={styles.th} style={{ width: 52 }}>Icon</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Color</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Items</th>
                  <th className={styles.th}>Created By</th>
                  {isAdmin && <th className={styles.th} style={{ width: 120 }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginated.map((cat, idx) => (
                  <tr key={cat._id} className={styles.tr}>
                    <td className={styles.td} style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                      {(safePage - 1) * pageSize + idx + 1}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.iconBadge} style={{ background: cat.color ?? '#6366f1' }}>
                        {cat.icon ?? '📦'}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.catName}>{cat.name}</span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.colorCell}>
                        <span className={styles.colorSwatch} style={{ background: cat.color ?? '#6366f1' }} />
                        <span className={styles.colorHex}>{cat.color ?? '—'}</span>
                      </div>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <span className={styles.countBadge}>{cat.itemCount ?? 0}</span>
                    </td>
                    <td className={styles.td} style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                      {cat.createdBy?.name ?? '—'}
                    </td>
                    {isAdmin && (
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => openEdit(cat)} title="Edit">
                          ✏️
                        </button>
                        <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => setDelTarget(cat)} title="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                    )}
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
                {PAGE_SIZE_OPTIONS.map(s => (
                  <option key={s} value={s}>{s} / page</option>
                ))}
              </select>
            </div>
            <div className={styles.pageRight}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage(1)}
                disabled={safePage === 1}
                title="First page"
              >«</button>
              <button
                className={styles.pageBtn}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                title="Previous page"
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                  ) : (
                    <button
                      key={p}
                      className={`${styles.pageBtn} ${p === safePage ? styles.activePage : ''}`}
                      onClick={() => setPage(p as number)}
                    >{p}</button>
                  )
                )
              }
              <button
                className={styles.pageBtn}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                title="Next page"
              >›</button>
              <button
                className={styles.pageBtn}
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
                title="Last page"
              >»</button>
            </div>
          </div>
        </>
      )}

      {/* ── Add / Edit modal (admin only) ── */}
      {isAdmin && (
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={isEdit ? 'Edit Category' : 'New Category'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{isEdit ? 'Save Changes' : 'Create'}</Button>
          </>
        }
        maxWidth={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dairy" required />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Icon (emoji)</label>
            <input
              style={{ width: 60, fontSize: 24, border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px', textAlign: 'center' }}
              value={icon}
              onChange={e => setIcon(e.target.value)}
              maxLength={2}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map(c => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: color === c ? '3px solid #1e293b' : '2px solid transparent',
                    outline: color === c ? '2px solid white' : 'none',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', borderRadius: 6 }}
                title="Pick a custom colour"
              />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>or pick a custom colour</span>
            </div>
          </div>
        </div>
      </Modal>
      )}

      {/* ── Delete confirm modal (admin only) ── */}
      {isAdmin && (
      <Modal
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        title="Delete Category"
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
            ? `This category has ${delTarget?.itemCount} inventory item(s). They won't be deleted, just unlinked.`
            : "This won't affect any inventory items."}
        </p>
      </Modal>
      )}
    </div>
  );
}
