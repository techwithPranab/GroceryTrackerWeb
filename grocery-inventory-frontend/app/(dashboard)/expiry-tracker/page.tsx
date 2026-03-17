'use client';
import React, { useEffect, useState } from 'react';
import inventoryService from '@/services/inventoryService';
import { InventoryItem } from '@/types';
import { Badge, Card, EmptyState, LoadingSpinner } from '@/components/ui';
import { getExpiryBadgeInfo, formatDate, daysUntilExpiry } from '@/utils/formatters';

export default function ExpiryTrackerPage() {
  const [items, setItems]   = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays]     = useState(30);

  useEffect(() => {
    setLoading(true);
    inventoryService.getExpiring(days)
      .then(r => setItems(r.data?.items ?? []))
      .finally(() => setLoading(false));
  }, [days]);

  const expired  = items.filter(i => (daysUntilExpiry(i.expirationDate) ?? 1) < 0);
  const critical = items.filter(i => { const d = daysUntilExpiry(i.expirationDate); return d !== null && d >= 0 && d <= 3; });
  const warning  = items.filter(i => { const d = daysUntilExpiry(i.expirationDate); return d !== null && d > 3 && d <= 7; });
  const upcoming = items.filter(i => { const d = daysUntilExpiry(i.expirationDate); return d !== null && d > 7; });

  const Section = ({ title, data, color }: { title: string; data: InventoryItem[]; color: string }) => (
    data.length > 0 ? (
      <Card title={`${title} (${data.length})`} style={{ borderTop: `3px solid ${color}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Item', 'Category', 'Qty', 'Expires', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(item => {
              const badge = getExpiryBadgeInfo(item.expirationDate);
              return (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.itemName}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)', fontSize: 13 }}>{(item as InventoryItem & { category?: { name: string } }).category?.name ?? '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{item.quantity} {item.unit}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{formatDate(item.expirationDate)}</td>
                  <td style={{ padding: '10px 12px' }}><Badge variant={badge.variant}>{badge.label}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    ) : null
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <span style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Show items expiring within:</span>
        {[7, 14, 30, 60].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={{
              padding: '7px 16px',
              border: `1px solid ${days === d ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-full)',
              background: days === d ? 'var(--color-primary)' : 'white',
              color: days === d ? 'white' : 'var(--color-text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {d} days
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <LoadingSpinner size={36} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="✅" title="Nothing expiring" message={`No items expiring in the next ${days} days.`} />
      ) : (
        <>
          <Section title="🚨 Already Expired" data={expired} color="#ef4444" />
          <Section title="🔴 Critical — Expires in 3 days" data={critical} color="#f97316" />
          <Section title="🟡 Warning — Expires in 7 days" data={warning} color="#f59e0b" />
          <Section title="📅 Upcoming" data={upcoming} color="#10b981" />
        </>
      )}
    </div>
  );
}
