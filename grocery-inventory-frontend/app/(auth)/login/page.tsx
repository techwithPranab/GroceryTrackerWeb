'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Input } from '@/components/ui';
import styles from '../auth.module.css';

export default function LoginPage() {
  const dispatch   = useAppDispatch();
  const router     = useRouter();
  const { isLoading: loading, error } = useAppSelector(s => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearError());
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      router.push('/dashboard');
    }
  };

  return (
    <div className={styles.formBox}>
      <h2 className={styles.formTitle}>Welcome back</h2>
      <p className={styles.formSubtitle}>Sign in to your GroceryTracker account</p>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Signing in…
            </>
          ) : 'Sign In'}
        </button>
      </form>

      <div className={styles.divider}>or</div>

      <div className={styles.switchLink}>
        Don&apos;t have an account?{' '}
        <Link href="/register">Create one for free</Link>
      </div>
    </div>
  );
}
