import React from 'react';
import {
  Users,
  Activity,
  Crown,
  DollarSign,
  TrendingUp,
  Database,
  BrainCircuit,
  Zap,
  TrendingDown,
} from 'lucide-react';
import type { DashboardMetrics } from './DashboardContent';
import Icon from '@/components/ui/AppIcon';


interface MetricsBentoGridProps {
  metrics: DashboardMetrics;
}

function formatCurrency(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k€`;
  return `${value.toFixed(0)}€`;
}

function formatGrowth(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export default function MetricsBentoGrid({ metrics }: MetricsBentoGridProps) {
  const isGrowthPositive = metrics.monthlyGrowth >= 0;

  // 8 cards → grid-cols-4, row1: 4 cards, row2: 4 cards
  const cards = [
    {
      id: 'total-users',
      label: 'Total Users',
      value: metrics.totalUsers.toLocaleString(),
      sub: 'All registered accounts',
      icon: Users,
      accent: 'cyan',
      alert: false,
    },
    {
      id: 'active-users',
      label: 'Active Users (7d)',
      value: metrics.activeUsers7d.toLocaleString(),
      sub: 'New signups last 7 days',
      icon: Activity,
      accent: 'green',
      alert: metrics.activeUsers7d === 0,
    },
    {
      id: 'premium-subs',
      label: 'Paid Subscribers',
      value: metrics.paidSubscribers.toLocaleString(),
      sub: 'Paid plan users',
      icon: Crown,
      accent: 'violet',
      alert: false,
    },
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      sub: 'All-time payments sum',
      icon: DollarSign,
      accent: 'cyan',
      alert: false,
      hero: true,
    },
    {
      id: 'monthly-growth',
      label: 'Monthly Revenue Growth',
      value: formatGrowth(metrics.monthlyGrowth),
      sub: 'vs. previous month',
      icon: isGrowthPositive ? TrendingUp : TrendingDown,
      accent: isGrowthPositive ? 'green' : 'red',
      alert: !isGrowthPositive,
    },
    {
      id: 'datasets',
      label: 'Unique Datasets',
      value: metrics.uniqueDatasets.toLocaleString(),
      sub: 'Distinct dataset names',
      icon: Database,
      accent: 'violet',
      alert: false,
    },
    {
      id: 'models',
      label: 'Models Trained',
      value: metrics.totalModels.toLocaleString(),
      sub: 'Total training records',
      icon: BrainCircuit,
      accent: 'cyan',
      alert: false,
    },
    {
      id: 'training-jobs',
      label: 'Training Jobs',
      value: metrics.trainingJobs.toLocaleString(),
      sub: 'Jobs executed on platform',
      icon: Zap,
      accent: 'violet',
      alert: false,
    },
  ];

  const accentMap: Record<string, { bg: string; icon: string; border: string }> = {
    cyan: {
      bg: 'bg-[hsl(190_95%_70%/0.1)]',
      icon: 'text-[hsl(var(--primary))]',
      border: 'border-[hsl(190_95%_70%/0.15)]',
    },
    green: {
      bg: 'bg-[hsl(142_71%_45%/0.1)]',
      icon: 'text-[hsl(142_71%_55%)]',
      border: 'border-[hsl(142_71%_45%/0.15)]',
    },
    violet: {
      bg: 'bg-[hsl(263_70%_74%/0.1)]',
      icon: 'text-[hsl(var(--accent))]',
      border: 'border-[hsl(263_70%_74%/0.15)]',
    },
    red: {
      bg: 'bg-[hsl(0_72%_51%/0.1)]',
      icon: 'text-[hsl(0_72%_65%)]',
      border: 'border-[hsl(0_72%_51%/0.2)]',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const a = accentMap[card.accent];
        return (
          <div
            key={`metric-${card.id}`}
            className={`relative bg-[hsl(var(--card))] border rounded-xl p-5 transition-all duration-200 hover:border-[hsl(240_4%_20%)] ${
              card.alert
                ? 'border-[hsl(0_72%_51%/0.3)] bg-[hsl(0_72%_51%/0.04)]'
                : a.border
            } ${card.hero ? 'glow-cyan' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11.5px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                {card.label}
              </p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.bg}`}>
                <Icon size={15} className={a.icon} />
              </div>
            </div>
            <p className={`text-[28px] font-bold tabular-nums leading-none mb-1.5 ${card.hero ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
              {card.value}
            </p>
            <p className="text-[12px] text-[hsl(var(--muted-foreground))]">{card.sub}</p>
            {card.alert && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[hsl(var(--destructive))] animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}
