import { ExpiryStatus } from '@/types';

// ─── Date helpers ────────────────────────────────────────────────────────────

export function formatDate(
  date: string | Date | null | undefined,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', opts);
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const abs  = Math.abs(diff);
  const future = diff < 0;

  const sec = Math.floor(abs / 1000);
  if (sec < 60) return future ? 'in a moment' : 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return future ? `in ${min}m` : `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return future ? `in ${hr}h` : `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return future ? `in ${day}d` : `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return future ? `in ${mo}mo` : `${mo}mo ago`;
  const yr = Math.floor(mo / 12);
  return future ? `in ${yr}yr` : `${yr}yr ago`;
}

export function daysUntilExpiry(expirationDate: string | Date | null | undefined): number | null {
  if (!expirationDate) return null;
  const exp = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
  const diff = exp.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Expiry helpers ───────────────────────────────────────────────────────────

export function getExpiryStatus(expirationDate: string | Date | null | undefined): ExpiryStatus {
  if (!expirationDate) return 'none';
  const days = daysUntilExpiry(expirationDate);
  if (days === null) return 'none';
  if (days < 0) return 'expired';
  if (days <= 3) return 'critical';
  if (days <= 7) return 'warning';
  return 'ok';
}

export function getExpiryLabel(expirationDate: string | Date | null | undefined): string {
  if (!expirationDate) return 'No expiry';
  const days = daysUntilExpiry(expirationDate);
  if (days === null) return 'No expiry';
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days}d`;
}

export interface ExpiryBadgeInfo {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'neutral';
}

export function getExpiryBadgeInfo(expirationDate: string | Date | null | undefined): ExpiryBadgeInfo {
  const status = getExpiryStatus(expirationDate);
  const label  = getExpiryLabel(expirationDate);
  const variantMap: Record<ExpiryStatus, ExpiryBadgeInfo['variant']> = {
    none:     'neutral',
    ok:       'success',
    warning:  'warning',
    critical: 'danger',
    expired:  'danger',
  };
  return { label, variant: variantMap[status] };
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function truncate(str: string, maxLen = 40): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Merge conditional class names (tiny cn replacement — no tailwind needed). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Number helpers ───────────────────────────────────────────────────────────

export function formatQuantity(qty: number, unit: string): string {
  return `${qty} ${unit}`;
}
