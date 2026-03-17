import type { Metadata } from 'next';
import React from 'react';
import Providers from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'GroceryTracker', template: '%s | GroceryTracker' },
  description: 'Smart Household Grocery Inventory & Shopping List Manager',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
