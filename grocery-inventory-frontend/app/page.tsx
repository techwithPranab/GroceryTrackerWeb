import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './(home)/home.module.css';

export const metadata: Metadata = {
  title: 'GroceryTracker — Smart Household Grocery & Shopping List Manager',
  description:
    'Stop wasting food and money. GroceryTracker helps your household manage inventory, track expiry dates, and maintain a shared shopping list — all in one place.',
};

const FEATURES = [
  {
    icon: '📦',
    color: '#eef2ff',
    iconColor: '#4f46e5',
    title: 'Smart Inventory',
    desc: 'Track every item with quantity, unit, brand, category, and storage location. Get instant low-stock alerts.',
  },
  {
    icon: '🚨',
    color: '#fef2f2',
    iconColor: '#ef4444',
    title: 'Expiry Tracking',
    desc: 'Never throw away food again. Visual alerts warn you days before items expire so you can use them in time.',
  },
  {
    icon: '🛒',
    color: '#f0fdf4',
    iconColor: '#10b981',
    title: 'Shared Shopping List',
    desc: 'Collaborative shopping lists with priority levels. Items are auto-added when inventory hits minimum stock.',
  },
  {
    icon: '👨‍👩‍👧',
    color: '#fdf4ff',
    iconColor: '#9333ea',
    title: 'Household Members',
    desc: 'Invite your family or housemates. Share a single inventory with role-based permissions.',
  },
  {
    icon: '📊',
    color: '#fffbeb',
    iconColor: '#f59e0b',
    title: 'Analytics Dashboard',
    desc: 'Visual charts for category distribution and most-used items. Stay on top of your grocery habits.',
  },
  {
    icon: '🗂️',
    color: '#f0f9ff',
    iconColor: '#0ea5e9',
    title: 'Categories & Locations',
    desc: 'Organise with custom categories (with colour & emoji) and storage locations like fridge, pantry, or freezer.',
  },
];

const STEPS = [
  {
    num: '1',
    title: 'Create your household',
    desc: 'Sign up free and create or join a household in under 60 seconds.',
  },
  {
    num: '2',
    title: 'Add your inventory',
    desc: 'Quickly log grocery items with quantity, expiry date, and storage location.',
  },
  {
    num: '3',
    title: 'Get smart alerts',
    desc: 'Receive warnings for low stock and expiring items before they become a problem.',
  },
  {
    num: '4',
    title: 'Shop smarter together',
    desc: 'Tick items off the shared shopping list in real-time with your household.',
  },
];

const TESTIMONIALS = [
  {
    text: '"We used to throw away so much food every week. Since using GroceryTracker we\'ve cut food waste by over 60%. The expiry alerts are a game changer."',
    name: 'Sarah M.',
    role: 'Family of 4, London',
    initials: 'SM',
    color: '#4f46e5',
  },
  {
    text: '"My flatmates and I always argued about who forgot to buy what. Now we all use the shared shopping list and it\'s completely stress-free."',
    name: 'James K.',
    role: 'Student household, Edinburgh',
    initials: 'JK',
    color: '#10b981',
  },
  {
    text: '"The dashboard charts helped me realise we were spending too much on snacks and not enough on staples. Really eye-opening and beautifully designed."',
    name: 'Priya R.',
    role: 'Working professional, Manchester',
    initials: 'PR',
    color: '#f59e0b',
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>🛒</div>
            <span className={styles.logoText}>
              Grocery<span>Tracker</span>
            </span>
          </Link>

          <ul className={styles.navLinks}>
            <li><a href="#features" className={styles.navLink}>Features</a></li>
            <li><a href="#how-it-works" className={styles.navLink}>How it works</a></li>
            <li><a href="#testimonials" className={styles.navLink}>Reviews</a></li>
          </ul>

          <div className={styles.navCta}>
            <Link href="/login" className={styles.btnOutline}>Sign in</Link>
            <Link href="/register" className={styles.btnPrimary}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroBlobA} />
          <div className={styles.heroBlobB} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            ✨ Free for all households
          </div>

          <h1 className={styles.heroTitle}>
            Stop wasting food.<br />
            <span>Shop smarter together.</span>
          </h1>

          <p className={styles.heroSub}>
            GroceryTracker is the all-in-one household app for managing your grocery inventory,
            tracking expiry dates, and keeping a shared shopping list — so nothing goes to waste.
          </p>

          <div className={styles.heroActions}>
            <Link href="/register" className={styles.heroBtnPrimary}>
              Start for free →
            </Link>
            <Link href="/login" className={styles.heroBtnSecondary}>
              Sign in to your account
            </Link>
          </div>

          <p className={styles.heroNote}>No credit card required &nbsp;·&nbsp; Set up in 60 seconds</p>
        </div>
      </section>

      {/* ── Social Proof Bar ── */}
      <div className={styles.proofBar}>
        <div className={styles.proofInner}>
          <div className={styles.proofStat}>
            <div className={styles.proofNum}>10,000+</div>
            <div className={styles.proofLabel}>Households</div>
          </div>
          <div className={styles.proofDivider} />
          <div className={styles.proofStat}>
            <div className={styles.proofNum}>2M+</div>
            <div className={styles.proofLabel}>Items tracked</div>
          </div>
          <div className={styles.proofDivider} />
          <div className={styles.proofStat}>
            <div className={styles.proofNum}>60%</div>
            <div className={styles.proofLabel}>Less food waste</div>
          </div>
          <div className={styles.proofDivider} />
          <div className={styles.proofStat}>
            <div className={styles.proofNum}>4.9 ★</div>
            <div className={styles.proofLabel}>Average rating</div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>Features</span>
          <h2 className={styles.sectionTitle}>Everything your household needs</h2>
          <p className={styles.sectionSub}>
            Designed to replace the sticky notes, WhatsApp groups and forgotten receipts with one
            clean, intelligent app.
          </p>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div
                  className={styles.featureIcon}
                  style={{ background: f.color }}
                >
                  {f.icon}
                </div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>How it works</span>
          <h2 className={styles.sectionTitle}>Up and running in minutes</h2>
          <p className={styles.sectionSub}>
            No complicated setup. Just sign up, add your household, and start tracking.
          </p>

          <div className={styles.stepsGrid}>
            {STEPS.map((s) => (
              <div key={s.num} className={styles.stepItem}>
                <div className={styles.stepNum}>{s.num}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className={styles.testimonials}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>Reviews</span>
          <h2 className={styles.sectionTitle}>Loved by households everywhere</h2>
          <p className={styles.sectionSub}>
            Real families and flatmates using GroceryTracker every day.
          </p>

          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>★★★★★</div>
                <p className={styles.testimonialText}>{t.text}</p>
                <div className={styles.testimonialAuthor}>
                  <div
                    className={styles.testimonialAvatar}
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className={styles.ctaTitle}>Ready to take control of your groceries?</h2>
          <p className={styles.ctaSub}>
            Join thousands of households already saving money and reducing food waste with GroceryTracker.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/register" className={styles.ctaBtnWhite}>
              Create free account
            </Link>
            <Link href="/login" className={styles.ctaBtnGhost}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            {/* Brand */}
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.footerLogo}>
                <div className={styles.footerLogoIcon}>🛒</div>
                <span className={styles.footerLogoText}>
                  Grocery<span>Tracker</span>
                </span>
              </Link>
              <p className={styles.footerDesc}>
                The smart household grocery management app. Track inventory, reduce food waste, and
                shop together — all from one intuitive dashboard.
              </p>
            </div>

            {/* Product */}
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>Product</div>
              <ul className={styles.footerLinks}>
                <li><a href="#features" className={styles.footerLink}>Features</a></li>
                <li><a href="#how-it-works" className={styles.footerLink}>How it works</a></li>
                <li><a href="#testimonials" className={styles.footerLink}>Reviews</a></li>
                <li><Link href="/register" className={styles.footerLink}>Sign up free</Link></li>
              </ul>
            </div>

            {/* App */}
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>App</div>
              <ul className={styles.footerLinks}>
                <li><Link href="/dashboard" className={styles.footerLink}>Dashboard</Link></li>
                <li><Link href="/inventory" className={styles.footerLink}>Inventory</Link></li>
                <li><Link href="/shopping-list" className={styles.footerLink}>Shopping List</Link></li>
                <li><Link href="/expiry-tracker" className={styles.footerLink}>Expiry Tracker</Link></li>
              </ul>
            </div>

            {/* Account */}
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>Account</div>
              <ul className={styles.footerLinks}>
                <li><Link href="/login" className={styles.footerLink}>Sign in</Link></li>
                <li><Link href="/register" className={styles.footerLink}>Register</Link></li>
                <li><Link href="/profile" className={styles.footerLink}>Profile</Link></li>
                <li><Link href="/household" className={styles.footerLink}>Household</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>
              © {new Date().getFullYear()} GroceryTracker. Built with ❤️ for households everywhere.
            </p>
            <div className={styles.footerBadges}>
              <span className={styles.footerBadge}>Next.js 14</span>
              <span className={styles.footerBadge}>Node.js</span>
              <span className={styles.footerBadge}>MongoDB</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
