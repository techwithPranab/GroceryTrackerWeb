'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout } from '@/store/slices/authSlice';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard',         href: '/dashboard',         icon: '📊' },
  { label: 'Inventory',         href: '/inventory',         icon: '📦' },
  { label: 'Shopping List',     href: '/shopping-list',     icon: '🛒' },
  { label: 'Purchase History',  href: '/purchase-history',  icon: '🧾' },
  { label: 'Expiry Tracker',    href: '/expiry-tracker',    icon: '⏰' },
];

const managementNav: NavItem[] = [
  { label: 'Categories', href: '/categories', icon: '🏷️' },
  { label: 'Locations', href: '/locations', icon: '📍' },
  { label: 'Activity Log', href: '/activity', icon: '📋' },
];

const accountNav: NavItem[] = [
  { label: 'Profile Settings', href: '/profile', icon: '⚙️' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const pendingCount = useAppSelector(
    (state) => state.shoppingList?.items?.filter((i) => i.status === 'pending').length ?? 0
  );

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
        onClick={onClose}
      >
        <span className={styles.navIcon}>{item.icon}</span>
        <span>{item.label}</span>
        {item.label === 'Shopping List' && pendingCount > 0 && (
          <span className={styles.badge}>{pendingCount}</span>
        )}
      </Link>
    ));

  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>🛒</div>
          <div>
            <div className={styles.brandName}>GroceryTracker</div>
            <div className={styles.brandSub}>Smart Home Inventory</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.navSectionLabel}>Main</div>
            {renderNavItems(mainNav)}
          </div>

          <div className={styles.navSection}>
            <div className={styles.navSectionLabel}>Manage</div>
            {renderNavItems(managementNav)}
          </div>

          <div className={styles.navSection}>
            <div className={styles.navSectionLabel}>Account</div>
            {renderNavItems(accountNav)}
          </div>
        </nav>

        {/* User Footer */}
        <div className={styles.footer}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {user?.avatarInitials || user?.name?.[0] || 'U'}
            </div>
            <div>
              <div className={styles.userName}>{user?.name || 'User'}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              ⬅️
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.visible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
}
