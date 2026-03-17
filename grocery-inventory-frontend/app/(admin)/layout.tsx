'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout } from '@/store/slices/authSlice';
import styles from './admin.module.css';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard',   icon: '📊' },
  { href: '/admin/users',     label: 'Users',        icon: '👥' },
  { href: '/admin/households',label: 'Households',   icon: '🏠' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted,     setMounted]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch   = useAppDispatch();
  const router     = useRouter();
  const pathname   = usePathname();
  const { user, isAuthenticated } = useAppSelector(s => s.auth);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || isLoginPage) return;
    if (!isAuthenticated || user?.role !== 'superadmin') {
      router.replace('/admin/login');
    }
  }, [mounted, isAuthenticated, user, router, isLoginPage]);

  // On the login page — always render children directly (no shell)
  if (isLoginPage) return <>{children}</>;

  // For protected pages, wait until mounted and authenticated as superadmin
  if (!mounted || !isAuthenticated || user?.role !== 'superadmin') return null;

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/admin/login');
  };

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandIcon}>🛒</span>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>GroceryTracker</span>
            <span className={styles.brandSub}>Admin Console</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>Management</div>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className={styles.topbarTitle}>Admin Console</span>
          </div>
          <div className={styles.topbarUser}>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.topbarName}>{user.name}</div>
              <div className={styles.topbarRole}>Superadmin</div>
            </div>
            <div className={styles.avatar}>{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
