'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  BrainCircuit,
  DollarSign,
  Download,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/components/AppLayout';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { formatTrainingTime } from '@/lib/utils/time';

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
  modelUsage: {
    mlp: number;
    qnn: number;
    total: number;
    mlpPercent: number;
    qnnPercent: number;
  };
  averageAccuracyByModel: {
    mlp: number;
    qnn: number;
  };
  averageTrainingTimeSeconds: number;
};

const cyan = 'hsl(var(--primary))';
const violet = 'hsl(var(--accent))';

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: value % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}\u20ac`;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString();
}

function percent(value: number) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function AnalyticsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-5 shadow-sm">
      <h2 className="text-sm font-semibold mb-5">{title}</h2>
      {children}
    </div>
  );
}

function ProgressRows({
  items,
  valueFormatter = formatNumber,
}: {
  items: SeriesItem[];
  valueFormatter?: (value: number) => string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));

  if (items.length === 0) {
    return <p className="text-sm text-gray-400">No data available.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-1.5">
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-gray-300">{item.label}</span>
            <span className="tabular-nums text-gray-300">{valueFormatter(item.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[hsl(var(--primary))]"
              style={{ width: `${Math.max(5, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AccuracyRows({ mlp, qnn }: { mlp: number; qnn: number }) {
  return (
    <ProgressRows
      items={[
        { label: 'MLP', value: mlp },
        { label: 'QNN', value: qnn },
      ]}
      valueFormatter={percent}
    />
  );
}

function ModelUsageDonut({ data }: { data: AnalyticsPayload['modelUsage'] }) {
  const mlpDegrees = data.total > 0 ? (data.mlp / data.total) * 360 : 0;

  return (
    <div className="grid gap-6 md:grid-cols-[190px_1fr] md:items-center">
      <div className="relative mx-auto h-40 w-40 rounded-full">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${cyan} 0deg ${mlpDegrees}deg, ${violet} ${mlpDegrees}deg 360deg)`,
          }}
        />
        <div className="absolute inset-5 rounded-full bg-neutral-950 border border-neutral-900 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums">{data.total}</span>
          <span className="text-xs text-gray-400">Models</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">MLP</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{percent(data.mlpPercent)}</p>
            <p className="text-xs text-gray-400">{data.mlp} models</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[hsl(var(--accent))]" />
            <span className="text-sm font-medium">QNN</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{percent(data.qnnPercent)}</p>
            <p className="text-xs text-gray-400">{data.qnn} models</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Failed to load analytics');

      setAnalytics(payload);
      setUpdatedAt(new Date().toLocaleTimeString());
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
      { label: 'Popular Plan', value: analytics.kpis.popularPlan, icon: BrainCircuit, color: 'text-yellow-300' },
    ];
  }, [analytics]);

  return (
    <AppLayout>
      <div className="space-y-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={22} className="text-[hsl(var(--primary))]" />
              <h1 className="text-2xl font-semibold">Analytics</h1>
            </div>
            <p className="text-sm text-gray-400">Global platform statistics</p>
          </div>

          <div className="flex items-center gap-2">
            {updatedAt && <span className="hidden sm:inline text-xs text-gray-500">Updated {updatedAt}</span>}
            <button
              onClick={load}
              className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg hover:bg-neutral-900 transition"
              aria-label="Refresh analytics"
              title="Refresh analytics"
            >
              <RefreshCw size={14} />
            </button>
            <button
              className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition"
              aria-label="Download analytics"
              title="Download analytics"
              type="button"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4">
                  <Skeleton className="h-3 w-24 mb-4" />
                  <Skeleton className="h-7 w-16" />
                </div>
              ))
            : kpis.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                      </div>
                      <Icon className={`h-5 w-5 opacity-80 ${item.color}`} />
                    </div>
                  </div>
                );
              })}
        </div>

        {loading || !analytics ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-5">
                <Skeleton className="h-4 w-44 mb-6" />
                <Skeleton className="h-44 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <AnalyticsCard title="Average model usage (MLP vs QNN)">
              <ModelUsageDonut data={analytics.modelUsage} />
            </AnalyticsCard>

            <AnalyticsCard title="Average accuracy by model">
              <div className="pt-6">
                <AccuracyRows
                  mlp={analytics.averageAccuracyByModel.mlp}
                  qnn={analytics.averageAccuracyByModel.qnn}
                />
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Most used models">
              <ProgressRows
                items={[
                  { label: 'MLP', value: analytics.modelUsage.mlp },
                  { label: 'QNN', value: analytics.modelUsage.qnn },
                ]}
              />
            </AnalyticsCard>

            <AnalyticsCard title="Job status distribution">
              <ProgressRows items={analytics.jobStatusDistribution} />
            </AnalyticsCard>

            <AnalyticsCard title="Average training time">
              <div className="flex h-32 items-center gap-4">
                <Activity size={30} className="text-[hsl(var(--primary))]" />
                <p className="text-3xl font-semibold tabular-nums">
                  {formatTrainingTime(analytics.averageTrainingTimeSeconds)}
                </p>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Revenue per month">
              <ProgressRows items={analytics.revenuePerMonth} valueFormatter={formatCurrency} />
            </AnalyticsCard>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
