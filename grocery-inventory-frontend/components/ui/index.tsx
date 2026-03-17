'use client';
import React from 'react';
import styles from './index.module.css';
import { cn } from '@/utils/formatters';

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'auto';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize    = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(styles.btn, styles[variant], size !== 'md' ? styles[size] : undefined, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <LoadingSpinner size={16} color="currentColor" /> : null}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className, ...rest }, ref) => (
    <div className={styles.inputGroup}>
      {label && (
        <label className={cn(styles.label, required ? styles.required : undefined)}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(styles.input, error ? styles.inputError : undefined, className)}
        {...rest}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, options, placeholder, className, ...rest }, ref) => (
    <div className={styles.inputGroup}>
      {label && (
        <label className={cn(styles.label, required ? styles.required : undefined)}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(styles.select, error ? styles.inputError : undefined, className)}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
);
Select.displayName = 'Select';

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, className, ...rest }, ref) => (
    <div className={styles.inputGroup}>
      {label && (
        <label className={cn(styles.label, required ? styles.required : undefined)}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={cn(styles.textarea, error ? styles.inputError : undefined, className)}
        {...rest}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}

export function Modal({ open, onClose, title, children, footer, maxWidth = 520 }: ModalProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.modalHeader}>
          <span id="modal-title" className={styles.modalTitle}>{title}</span>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 24, color = 'var(--color-primary)' }: SpinnerProps) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', title, message, action }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyTitle}>{title}</div>
      {message && <p className={styles.emptyText}>{message}</p>}
      {action}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height }}
    />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ title, action, children, className, style }: CardProps) {
  return (
    <div className={cn(styles.card, className)} style={style}>
      {(title || action) && (
        <div className={styles.cardHeader}>
          {title && <span className={styles.cardTitle}>{title}</span>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

type StatCardColor = 'blue' | 'amber' | 'red' | 'green';

interface StatCardProps {
  icon: string;
  color?: StatCardColor;
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ icon, color = 'blue', label, value, sub }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={cn(styles.statIcon, styles[color])}>{icon}</div>
      <div className={styles.statBody}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
        {sub && <div className={styles.statSub}>{sub}</div>}
      </div>
    </div>
  );
}
