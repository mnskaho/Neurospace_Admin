import React from 'react';
import { Cpu, Zap, Shield, Activity } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';


const platformStats = [
  { label: 'Models Trained', value: '12,847', icon: Cpu },
  { label: 'Quantum Circuits', value: '4,291', icon: Zap },
  { label: 'Uptime SLA', value: '99.97%', icon: Shield },
  { label: 'Active Sessions', value: '1,034', icon: Activity },
];

export default function LoginBrand() {
  return (
    <div className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[560px] bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] p-10 xl:p-14 relative overflow-hidden transition-colors">
      {/* Background mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl" />
        <div className="absolute bottom-32 right-8 w-48 h-48 rounded-full bg-[hsl(var(--accent)/0.09)] blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(190 95% 70%)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      {/* Top: Logo + tagline */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <AppLogo size={40} />
          <span className="text-xl font-semibold tracking-tight">NeuroSpace</span>
        </div>
        <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-4 text-[hsl(var(--foreground))]">
          NeuroSpace Admin{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
            Platform
          </span>
        </h1>
        <p className="text-[14px] text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xs">
          Admin dashboard to monitor AI training workflows, user activity, dataset management, and revenue performance in real time across the NeuroSpace platform.
        </p>
      </div>
      {/* Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {platformStats?.map((stat) => {
          const Icon = stat?.icon;
          return (
            <div
              key={`brand-stat-${stat?.label}`}
              className="bg-[hsl(var(--background)/0.58)] border border-[hsl(var(--border))] rounded-xl p-4 shadow-sm backdrop-blur transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-[hsl(var(--primary))]" />
                <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  {stat?.label}
                </span>
              </div>
              <p className="text-[22px] font-bold tabular-nums text-[hsl(var(--foreground))]">{stat?.value}</p>
            </div>
          );
        })}
      </div>
      {/* Bottom badge */}
      <div className="relative z-10 flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
        <Shield size={12} className="text-[hsl(var(--primary))]" />
        <span>Admin access only — unauthorized entry is logged and reported</span>
      </div>
    </div>
  );
}
