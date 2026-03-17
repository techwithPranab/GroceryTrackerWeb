'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { useAppSelector } from '@/hooks/useAppStore';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory',
  '/shopping-list': 'Shopping List',
  '/expiry-tracker': 'Expiry Tracker',
  '/categories': 'Categories',
  '/locations': 'Storage Locations',
  '/household': 'Household',
  '/activity': 'Activity Log',
  '/profile': 'Profile Settings',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? 'GroceryTracker';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>

      <div className={styles.right}>
        {user?.householdId && (
          <div className={styles.householdBadge}>
            🏠 <span>My Household</span>
          </div>
        )}

        <button className={styles.iconBtn} aria-label="Notifications">
          🔔
          <span className={styles.notifDot} />
        </button>

        <div className={styles.userMenu}>
          <div className={styles.avatar}>
            {user?.avatarInitials || user?.name?.[0] || 'U'}
          </div>
          <span className={styles.userName}>{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
