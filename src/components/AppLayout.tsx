'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main
        className="flex-1 overflow-y-auto scrollbar-thin transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        <div className="min-h-full w-full max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}