'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Database,
  BrainCircuit,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { signOut } from '@/lib/auth';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';


interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navGroups = [
  {
    label: 'Platform',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Users', href: '/user-management', icon: Users },
      { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },

    ],
  },
  {
    label: 'AI / ML',
    items: [
      { label: 'Datasets', href: '/datasets', icon: Database },
      { label: 'Models', href: '/models', icon: BrainCircuit },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    toast.success('Signed out successfully');
    router.push('/login-screen');
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] transition-all duration-300 ease-in-out flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[hsl(var(--border))] ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={46} />
        {!collapsed && (
          <span className="font-semibold text-[15px] tracking-tight text-[hsl(var(--foreground))]">
            NeuroSpace
          </span>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] z-10 flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-150"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={`group-${group.label}`}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={`nav-${item.href}`}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                        active
                          ? 'bg-[hsl(190_95%_70%/0.12)] text-[hsl(var(--primary))]'
                          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                      } ${collapsed ? 'justify-center px-2' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={17} className="flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[hsl(var(--primary))] rounded-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: admin + logout */}
      <div className={`px-2 py-3 border-t border-[hsl(var(--border))] space-y-1`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[hsl(var(--muted))] mb-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--background))]">
              A
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[hsl(var(--foreground))] truncate">Admin</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">mnskaho@gmail.com</p>
            </div>
            <Zap size={12} className="ml-auto text-[hsl(var(--primary))] flex-shrink-0" />
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(0_72%_51%/0.1)] hover:text-[hsl(var(--destructive))] transition-all duration-150 ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
