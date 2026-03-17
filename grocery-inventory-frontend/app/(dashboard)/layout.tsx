'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAppSelector } from '@/hooks/useAppStore';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Wait for the client to mount before rendering anything.
  // This prevents a hydration mismatch because the server always sees
  // isAuthenticated=false (empty Redux store), while the client may have
  // a persisted token and render the full shell.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // Render nothing until client has mounted — both server and initial client
  // render agree on this empty output, avoiding the <aside>-in-<div> mismatch.
  if (!mounted || !isAuthenticated) return null;

  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.main}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
