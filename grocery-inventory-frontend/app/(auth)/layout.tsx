import type { Metadata } from 'next';
import styles from './auth.module.css';

export const metadata: Metadata = {
  title: 'GroceryTracker — Sign In',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.authShell}>
      {/* Left branding panel */}
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🛒</span>
          <span className={styles.logoText}>GroceryTracker</span>
        </div>
        <h1 className={styles.tagline}>
          Never waste food<br />
          <span className={styles.taglineAccent}>or run out again.</span>
        </h1>
        <p className={styles.description}>
          A smart household grocery inventory that tracks what you have, alerts you before
          things expire, and automatically builds your shopping list.
        </p>
        <div className={styles.featureList}>
          {[
            'Real-time inventory across your household',
            'Expiry alerts — critical, warning, ok',
            'Auto shopping list when stock runs low',
            'Category & location organisation',
            'Multi-member household support',
          ].map(f => (
            <div key={f} className={styles.featureItem}>
              <span className={styles.featureDot} />
              {f}
            </div>
          ))}
        </div>
      </div>
      {/* Right form panel — injected by child pages */}
      <div className={styles.rightPanel}>
        {children}
      </div>
    </div>
  );
}
