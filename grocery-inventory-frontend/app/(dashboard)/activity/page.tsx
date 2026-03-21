'use client';
import React, { useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';
import { ActivityLog } from '@/types';
import { Card, EmptyState, LoadingSpinner } from '@/components/ui';
import { formatRelativeTime } from '@/utils/formatters';

const ACTION_EMOJI: Record<string, string> = {
  item_added: '➕', item_updated: '✏️', item_deleted: '🗑️',
  quantity_updated: '🔄', shopping_item_added: '🛒',
  shopping_item_purchased: '✅', shopping_list_cleared: '🧹',
  member_added: '👤', household_created: '🏠', default: '📝',
};

export default function ActivityPage() {
  const [logs,    setLogs]    = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = (p: number) => {
    setLoading(true);
    apiClient.get('/dashboard/activity', { params: { page: p, limit: 30 } })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((r: any) => {
        const incoming: ActivityLog[] = r.data?.logs ?? r.data ?? [];
        if (p === 1) { setLogs(incoming); } else { setLogs(prev => [...prev, ...incoming]); }
        setHasMore(incoming.length === 30);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const loadMore = () => { const next = page + 1; setPage(next); load(next); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <Card title="Activity Log">
        {loading && logs.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><LoadingSpinner size={32} /></div>
        ) : logs.length === 0 ? (
          <EmptyState icon="🕐" title="No activity yet" message="Actions you take will appear here." />
        ) : (
          <>
            {logs.map(log => (
              <div
                key={log._id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '12px 0', borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                  {ACTION_EMOJI[log.action] ?? ACTION_EMOJI.default}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{log.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {formatRelativeTime(log.createdAt)}
                    {log.userId && typeof log.userId === 'object' && (log.userId as { name?: string }).name
                      ? ` · ${(log.userId as { name?: string }).name}`
                      : ''}
                  </div>
                </div>
              </div>
            ))}
            {hasMore && (
              <div style={{ textAlign: 'center', paddingTop: 16 }}>
                <button
                  onClick={loadMore}
                  disabled={loading}
                  style={{ padding: '8px 24px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'white', fontSize: 14, cursor: 'pointer' }}
                >
                  {loading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
