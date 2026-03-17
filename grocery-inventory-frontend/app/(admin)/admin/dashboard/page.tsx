'use client';

import React, { useEffect, useState, useCallback } from 'react';
import adminService, { AdminStats } from '@/services/adminService';
import styles from './dashboard.module.css';

const STAT_CARDS = [
  { key: 'totalUsers',         label: 'Total Users',        icon: '👥', badge: '' },
  { key: 'totalHouseholds',    label: 'Households',          icon: '🏠', badge: '' },
  { key: 'totalInventoryItems',label: 'Inventory Items',     icon: '📦', badge: '' },
  { key: 'totalShoppingItems', label: 'Shopping Items',      icon: '🛒', badge: '' },
  { key: 'totalActivityLogs',  label: 'Activity Logs',       icon: '📋', badge: '' },
  { key: 'newUsersToday',      label: 'New Users Today',     icon: '✨', badge: 'today', badgeGreen: true },
] as const;

function fmt(d: string) {
  return new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch {
      setError('Failed to load stats. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSub}>Overview of all GroceryTracker data</p>
        </div>
        <button className={styles.refreshBtn} onClick={load} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={loading ? { animation: 'spin 0.8s linear infinite' } : undefined}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map(card => (
          <div key={card.key} className={styles.statCard}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>{card.icon}</span>
              {card.badge && (
                <span className={`${styles.statBadge} ${card.badgeGreen ? styles.statBadgeGreen : ''}`}>
                  {card.badge}
                </span>
              )}
            </div>
            <div className={styles.statValue}>
              {loading ? '—' : (stats ? String(stats[card.key as keyof AdminStats] ?? 0) : '0')}
            </div>
            <div className={styles.statLabel}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Recent Activity</span>
          <span className={styles.sectionCount}>
            {stats ? `${stats.recentActivity.length} entries` : ''}
          </span>
        </div>

        {loading ? (
          <div className={styles.loadingState}>Loading activity…</div>
        ) : !stats || stats.recentActivity.length === 0 ? (
          <div className={styles.emptyState}>No recent activity.</div>
        ) : (
          <table className={styles.activityTable}>
            <thead>
              <tr>
                <th className={styles.actTh}>User</th>
                <th className={styles.actTh}>Action</th>
                <th className={styles.actTh}>Details</th>
                <th className={styles.actTh}>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map(log => (
                <tr key={log._id} className={styles.actTr}>
                  <td className={styles.actTd}>
                    <span className={styles.actUser}>
                      {log.userId ? log.userId.name : 'System'}
                    </span>
                    {log.userId && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{log.userId.email}</div>
                    )}
                  </td>
                  <td className={styles.actTd}>
                    <span className={styles.actAction}>{log.action}</span>
                  </td>
                  <td className={styles.actTd}>{log.details || '—'}</td>
                  <td className={styles.actTd} style={{ whiteSpace: 'nowrap' }}>{fmt(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
