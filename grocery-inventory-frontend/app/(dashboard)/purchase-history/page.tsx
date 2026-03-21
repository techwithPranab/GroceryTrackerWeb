'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import shoppingListService from '@/services/shoppingListService';
import type { ShoppingListItem } from '@/types';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { formatRelativeTime } from '@/utils/formatters';
import styles from './page.module.css';

interface PurchaseGroup {
  date: string;
  items: ShoppingListItem[];
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function PurchaseHistoryPage() {
  const [groups,     setGroups]     = useState<PurchaseGroup[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(10);
  const [totalDates, setTotalDates] = useState(0);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback((p: number, ps: number, q: string) => {
    setLoading(true);
    shoppingListService
      .getPurchaseHistory({ page: p, limit: ps, search: q })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((r: any) => {
        const data = r?.data ?? r;
        setGroups(data?.groups ?? []);
        setTotalDates(data?.totalDates ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(1, pageSize, debouncedSearch); setPage(1); }, [debouncedSearch, pageSize, load]);
  useEffect(() => { load(page, pageSize, debouncedSearch); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(totalDates / pageSize));

  // Total items across visible groups (for "showing" label)
  const totalItems = useMemo(() => groups.reduce((acc, g) => acc + g.items.length, 0), [groups]);

  return (
    <div className={styles.page}>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="🔍  Search purchased items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className={styles.totalLabel}>
          {totalDates} purchase day{totalDates === 1 ? '' : 's'} · {totalItems} item{totalItems === 1 ? '' : 's'}
        </span>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className={styles.centered}><LoadingSpinner size={32} /></div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No purchase history yet"
          message="Items you mark as purchased on your shopping list will appear here."
        />
      ) : (
        <>
          {groups.map(group => (
            <div key={group.date} className={styles.group}>
              {/* Day header */}
              <div className={styles.groupHeader}>
                <span>🗓️</span>
                <span className={styles.groupDate}>{formatDate(group.date)}</span>
                <span className={styles.groupCount}>{group.items.length} item{group.items.length === 1 ? '' : 's'}</span>
              </div>

              {/* Items table */}
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>#</th>
                      <th className={styles.th}>Item</th>
                      <th className={styles.th}>Category</th>
                      <th className={styles.th} style={{ textAlign: 'right' }}>Qty</th>
                      <th className={styles.th}>Unit</th>
                      <th className={styles.th}>Time</th>
                      <th className={styles.th}>Purchased By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, idx) => (
                      <tr key={item._id} className={styles.tr}>
                        <td className={styles.td} style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                          {idx + 1}
                        </td>
                        <td className={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={styles.purchasedBadge}>✅ {item.itemName}</span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          {item.categoryId ? (
                            <span
                              className={styles.catBadge}
                              style={{ background: item.categoryId.color ?? '#6366f1' }}
                            >
                              {item.categoryId.icon} {item.categoryId.name}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>—</span>
                          )}
                        </td>
                        <td className={styles.td} style={{ textAlign: 'right', fontWeight: 600 }}>
                          {item.quantityNeeded}
                        </td>
                        <td className={styles.td} style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                          {item.unitSize ? `${item.unitSize} ${item.unit}` : item.unit}
                        </td>
                        <td className={styles.td} style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                          {formatTime(item.purchasedAt)}
                        </td>
                        <td className={styles.td} style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                          {item.purchasedBy
                            ? `${item.purchasedBy.avatarInitials ?? ''} ${item.purchasedBy.name ?? ''}`.trim()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* ── Pagination ── */}
          <div className={styles.pagination}>
            <div className={styles.pageLeft}>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} days / page</option>)}
              </select>
            </div>
            <div className={styles.pageRight}>
              <button className={styles.pageBtn} onClick={() => setPage(1)} disabled={page === 1} title="First">«</button>
              <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Prev">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…'
                    ? <span key={`e${i}`} className={styles.ellipsis}>…</span>
                    : <button key={p} className={`${styles.pageBtn} ${p === page ? styles.activePage : ''}`} onClick={() => setPage(p as number)}>{p}</button>
                )}
              <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="Next">›</button>
              <button className={styles.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Last">»</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
