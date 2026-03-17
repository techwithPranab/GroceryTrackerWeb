'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchDashboardStats,
  fetchCategoryDistribution,
  fetchTopItems,
} from '@/store/slices/dashboardSlice';
import { StatCard, Card, Badge, EmptyState } from '@/components/ui';
import { formatRelativeTime } from '@/utils/formatters';
import styles from './page.module.css';

// Chart.js lazy-loaded inline to avoid SSR issues
function CategoryChart({ data }: { data: { name: string; count: number; color: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<unknown>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    import('chart.js').then(({ Chart, ArcElement, Tooltip, Legend }) => {
      Chart.register(ArcElement, Tooltip, Legend);
      if (chartRef.current) (chartRef.current as { destroy(): void }).destroy();
      chartRef.current = new Chart(canvasRef.current!, {
        type: 'doughnut',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            data: data.map(d => d.count),
            backgroundColor: data.map(d => d.color || '#818cf8'),
            borderWidth: 2,
            borderColor: '#fff',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { font: { size: 12 }, padding: 12 } },
          },
          cutout: '60%',
        },
      });
    });
    return () => { if (chartRef.current) (chartRef.current as { destroy(): void }).destroy(); };
  }, [data]);

  return <canvas ref={canvasRef} />;
}

function TopItemsChart({ data }: { data: { name: string; accessCount: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<unknown>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    import('chart.js').then(({ Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend }) => {
      Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
      if (chartRef.current) (chartRef.current as { destroy(): void }).destroy();
      chartRef.current = new Chart(canvasRef.current!, {
        type: 'bar',
        data: {
          labels: data.map(d => d.name),
          datasets: [{
            label: 'Activity count',
            data: data.map(d => d.accessCount),
            backgroundColor: '#818cf8',
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { font: { size: 11 } }, grid: { color: '#f1f5f9' } },
            y: { ticks: { font: { size: 12 } }, grid: { display: false } },
          },
        },
      });
    });
    return () => { if (chartRef.current) (chartRef.current as { destroy(): void }).destroy(); };
  }, [data]);

  return <canvas ref={canvasRef} />;
}

const ACTION_EMOJI: Record<string, string> = {
  item_added: '➕', item_updated: '✏️', item_deleted: '🗑️',
  quantity_updated: '🔄', shopping_item_added: '🛒',
  shopping_item_purchased: '✅', shopping_list_cleared: '🧹',
  member_added: '👤', household_created: '🏠', default: '📝',
};

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, categoryDistribution, topItems, isLoading: statsLoading } = useAppSelector(s => s.dashboard);
  const { user } = useAppSelector(s => s.auth);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchCategoryDistribution());
    dispatch(fetchTopItems(8));
  }, [dispatch]);

  if (statsLoading && !stats) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonGrid}>
          {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
        </div>
      </div>
    );
  }

  const greeting = user ? `Hello, ${user.name.split(' ')[0]}! 👋` : 'Dashboard';

  return (
    <div className={styles.page}>
      {/* Greeting */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          {greeting}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Here&apos;s what&apos;s happening with your household groceries today.
        </p>
      </div>

      {/* Stats row */}
      <div className={styles.statsGrid}>
        <StatCard
          icon="📦"
          color="blue"
          label="Total Items"
          value={stats?.totalInventory ?? '—'}
          sub="in your inventory"
        />
        <StatCard
          icon="⚠️"
          color="amber"
          label="Low Stock"
          value={stats?.lowStockItems ?? '—'}
          sub="below threshold"
        />
        <StatCard
          icon="🚨"
          color="red"
          label="Expiring Soon"
          value={stats ? stats.expiringItems.expiringIn3Days + stats.expiringItems.expiringIn7Days : '—'}
          sub={stats ? `${stats.expiringItems.expiringIn3Days} critical · ${stats.expiringItems.expiringIn7Days} this week` : ''}
        />
        <StatCard
          icon="🛒"
          color="green"
          label="Shopping List"
          value={stats?.shoppingList.pending ?? '—'}
          sub={stats ? `${stats.shoppingList.purchased} purchased` : ''}
        />
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <Card title="Category Distribution">
          <div className={styles.chartCanvas}>
            {categoryDistribution.length ? (
              <CategoryChart data={categoryDistribution.map(d => ({ name: d.categoryName, count: d.count, color: d.color }))} />
            ) : (
              <EmptyState icon="🍕" title="No data yet" message="Add inventory items to see distribution." />
            )}
          </div>
        </Card>

        <Card title="Most Active Items">
          <div className={styles.chartCanvas}>
            {topItems.length ? (
              <TopItemsChart data={topItems.map(d => ({ name: d.itemName, accessCount: d.activityCount }))} />
            ) : (
              <EmptyState icon="📊" title="No activity yet" message="Activity will appear here as you use the app." />
            )}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className={styles.chartsGrid}>
        {/* Recent Activity */}
        <Card
          title="Recent Activity"
          action={
            <Link href="/activity" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              View all →
            </Link>
          }
        >
          {stats?.recentActivity?.length ? (
            <div className={styles.activityList}>
              {stats.recentActivity.slice(0, 8).map((log) => (
                <div key={log._id} className={styles.activityItem}>
                  <div className={styles.activityDot}>
                    {ACTION_EMOJI[log.action] ?? ACTION_EMOJI.default}
                  </div>
                  <div className={styles.activityBody}>
                    <div className={styles.activityDesc}>{log.description}</div>
                    <div className={styles.activityTime}>{formatRelativeTime(log.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="🕐" title="No activity yet" />
          )}
        </Card>

        {/* Expiring soon */}
        <Card
          title="Expiring Soon"
          action={
            <Link href="/expiry-tracker" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              View all →
            </Link>
          }
        >
          {stats && (stats.expiringItems.expiringIn3Days + stats.expiringItems.expiringIn7Days) > 0 ? (
            <div>
              <div className={styles.expiryRow}>
                <span className={styles.expiryName}>🚨 Expired or expiring within 3 days</span>
                <Badge variant="danger">{stats.expiringItems.expiringIn3Days}</Badge>
              </div>
              <div className={styles.expiryRow}>
                <span className={styles.expiryName}>⚠️ Expiring within 7 days</span>
                <Badge variant="warning">{stats.expiringItems.expiringIn7Days}</Badge>
              </div>
              <div style={{ marginTop: 12 }}>
                <Link href="/expiry-tracker" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  See expiry details →
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState icon="✅" title="Nothing expiring this week" />
          )}
        </Card>
      </div>
    </div>
  );
}
