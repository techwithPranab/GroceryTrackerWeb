'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { Input } from '@/components/ui';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router   = useRouter();
  const { isLoading: loading, error } = useAppSelector(s => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [validationErr, setValidationErr] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearError());
    setValidationErr('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setValidationErr('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setValidationErr('Password must be at least 8 characters.');
      return;
    }
    const result = await dispatch(registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
    }));
    if (registerUser.fulfilled.match(result)) {
      router.push('/dashboard');
    }
  };

  const displayError = validationErr || error;

  return (
    <div className={styles.formBox}>
      <h2 className={styles.formTitle}>Create your account</h2>
      <p className={styles.formSubtitle}>Start tracking your household groceries — it&apos;s free.</p>

      {displayError && <div className={styles.errorAlert}>{displayError}</div>}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Full name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Alice Johnson"
          autoComplete="name"
          required
        />
        <Input
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="alice@example.com"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Min 8 characters"
          autoComplete="new-password"
          required
        />
        <Input
          label="Confirm password"
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          placeholder="Repeat password"
          autoComplete="new-password"
          required
        />

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Creating account…
            </>
          ) : 'Create Account'}
        </button>
      </form>

      <div className={styles.divider}>or</div>

      <div className={styles.switchLink}>
        Already have an account?{' '}
        <Link href="/login">Sign in</Link>
      </div>
    </div>
  );
}
