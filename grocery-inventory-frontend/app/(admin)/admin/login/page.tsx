'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { loginUser, logout, clearError } from '@/store/slices/authSlice';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const router   = useRouter();
  const { isLoading, error, user, isAuthenticated } = useAppSelector(s => s.auth);

  const [form,      setForm]      = useState({ email: '', password: '' });
  const [localErr,  setLocalErr]  = useState('');
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // If already logged-in as superadmin, go straight to admin dashboard
  useEffect(() => {
    if (mounted && isAuthenticated && user?.role === 'superadmin') {
      router.replace('/admin/dashboard');
    }
  }, [mounted, isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearError());
    setLocalErr('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr('');
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const loggedInUser = result.payload.user;
      if (loggedInUser.role !== 'superadmin') {
        // Not a superadmin — kick them out immediately
        dispatch(logout());
        setLocalErr('Access denied. This console is for superadmins only.');
        return;
      }
      router.replace('/admin/dashboard');
    }
  };

  const displayError = localErr || error;

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🛒</span>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>GroceryTracker</span>
            <span className={styles.logoSub}>Admin Console</span>
          </div>
        </div>

        <h1 className={styles.heading}>Admin Sign In</h1>
        <p className={styles.sub}>Superadmin access only</p>

        {displayError && (
          <div className={styles.errorAlert}>
            <span>⚠️</span>
            {displayError}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div>
            <label className={styles.fieldLabel} htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.fieldInput}
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className={styles.fieldLabel} htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.fieldInput}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Signing in…
              </>
            ) : 'Sign In to Admin Console'}
          </button>
        </form>

        <Link href="/login" className={styles.backLink}>
          ← Back to user login
        </Link>
      </div>
    </div>
  );
}
