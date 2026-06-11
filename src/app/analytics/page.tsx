'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, BrainCircuit, DollarSign, RefreshCw, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/components/AppLayout';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

type SeriesItem = {
  label: string;
  value: number;
};

type AnalyticsPayload = {
  kpis: {
    totalUsers: number;
    totalTrainings: number;
    completedJobs: number;
    failedJobs: number;
    revenue: number;
    popularPlan: string;
  };
  trainingsPerMonth: SeriesItem[];
  revenuePerMonth: SeriesItem[];
  planDistribution: SeriesItem[];
  jobStatusDistribution: SeriesItem[];
  mostUsedModels: SeriesItem[];
  mostUsedDatasets: SeriesItem[];
  averageTrainingTime: number;
  averageAccuracyByModel: SeriesItem[];
};

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString()}\u20ac`;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString();
}

function BarList({ items, suffix = '' }: { items: SeriesItem[]; suffix?: string }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  if (items.length === 0) {
    return <p className="text-sm text-gray-400">No data available.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-gray-300 truncate">{item.label}</span>
            <span className="text-gray-400 tabular-nums">{item.value.toFixed(item.value % 1 ? 2 : 0)}{suffix}</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[hsl(var(--primary))]"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Failed to load analytics');

      setAnalytics(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: 'Total Users', value: formatNumber(analytics.kpis.totalUsers), icon: Users, color: 'text-cyan-300' },
      { label: 'Total Trainings', value: formatNumber(analytics.kpis.totalTrainings), icon: Activity, color: 'text-violet-300' },
      { label: 'Completed Jobs', value: formatNumber(analytics.kpis.completedJobs), icon: BarChart3, color: 'text-green-300' },
      { label: 'Failed Jobs', value: formatNumber(analytics.kpis.failedJobs), icon: XCircle, color: 'text-red-300' },
      { label: 'Revenue', value: formatCurrency(analytics.kpis.revenue), icon: DollarSign, color: 'text-emerald-300' },
      { label: 'Popular Plan', value: analytics.kpis.popularPlan, icon: CreditPlanIcon, color: 'text-yellow-300' },
    ];
  }, [analytics]);

  return (
    <AppLayout>
      <div className="space-y-6 text-white">
        <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-md border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-[hsl(var(--primary))]" />
                <h1 className="text-xl font-semibold">Analytics</h1>
              </div>
              <p className="text-sm text-gray-400">Global platform statistics</p>
            </div>

            <button
              onClick={load}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition"
              aria-label="Refresh analytics"
              title="Refresh analytics"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))
            : kpis.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-2xl font-semibold mt-1">{item.value}</p>
                      </div>
                      <Icon className={`w-6 h-6 opacity-70 ${item.color}`} />
                    </div>
                  </div>
                );
              })}
        </div>

        {loading || !analytics ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-neutral-950 border border-neutral-800 rounded-xl p-5">
                <Skeleton className="h-4 w-36 mb-5" />
                <Skeleton className="h-40 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Trainings per month">
              <BarList items={analytics.trainingsPerMonth} />
            </ChartCard>
            <ChartCard title="Revenue per month">
              <BarList items={analytics.revenuePerMonth} suffix="\u20ac" />
            </ChartCard>
            <ChartCard title="Plan distribution">
              <BarList items={analytics.planDistribution} />
            </ChartCard>
            <ChartCard title="Job status distribution">
              <BarList items={analytics.jobStatusDistribution} />
            </ChartCard>
            <ChartCard title="Most used models">
              <BarList items={analytics.mostUsedModels} />
            </ChartCard>
            <ChartCard title="Most used datasets">
              <BarList items={analytics.mostUsedDatasets} />
            </ChartCard>
            <ChartCard title="Average training time">
              <div className="flex items-center gap-3">
                <Activity size={26} className="text-[hsl(var(--primary))]" />
                <p className="text-3xl font-semibold tabular-nums">
                  {analytics.averageTrainingTime.toFixed(1)}s
                </p>
              </div>
            </ChartCard>
            <ChartCard title="Average accuracy by model">
              <BarList items={analytics.averageAccuracyByModel} suffix="%" />
            </ChartCard>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function CreditPlanIcon({ className }: { className?: string }) {
  return <BrainCircuit className={className} />;
}
