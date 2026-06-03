import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'NeuroSpace — AI & Quantum ML Platform Admin',
  description: 'NeuroSpace admin dashboard for monitoring users, revenue, training jobs, and platform health across your AI and quantum ML SaaS.',
  icons: {
    icon: [{ url: '/assets/images/app_logo.png', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('admin-theme') || 'dark';
                document.documentElement.classList.remove('dark', 'light');
                document.documentElement.classList.add(theme === 'light' ? 'light' : 'dark');
              } catch (_) {}
            `,
          }}
        />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(240 10% 7%)',
              border: '1px solid hsl(240 4% 14%)',
              color: 'hsl(0 0% 98%)',
              fontFamily: 'DM Sans, sans-serif',
            },
          }}
        />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fneurospace7324back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}
