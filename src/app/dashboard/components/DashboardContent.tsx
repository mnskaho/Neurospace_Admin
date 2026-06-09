'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  buildPlanChartData,
  buildRevenueChartData,
  buildTrainingChartData,
  fetchDashboardMetrics,
} from '@/lib/data';
import type { Training } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import MetricsBentoGrid from './MetricsBentoGrid';
import PlanDistributionChart from './PlanDistributionChart';
import RecentTrainingsFeed from './RecentTrainingsFeed';
import RevenueChart from './RevenueChart';
import TrainingsAreaChart from './TrainingsAreaChart';
import { ChartSkeleton, MetricCardSkeleton, Skeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';

export type DashboardMetrics = {
  totalUsers: number;
  activeUsers7d: number;
  paidSubscribers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  uniqueDatasets: number;
  totalModels: number;
  trainingJobs: number;
};

function formatTrainingMonth(month: string) {
  const [year, value] = month.split('-').map(Number);
  if (!year || !value) return month;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, value - 1, 1));
}

export default function DashboardContent() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [planData, setPlanData] = useState<{ plan: string; count: number }[]>([]);
  const [trainingData, setTrainingData] = useState<{ month: string; jobs: number }[]>([]);
  const [recentTrainings, setRecentTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchDashboardMetrics();

      setMetrics({
        totalUsers: data.totalUsers,
        activeUsers7d: data.activeUsers7d,
        paidSubscribers: data.paidSubscribers,
        totalRevenue: data.totalRevenue,
        monthlyGrowth: data.monthlyGrowth,
        uniqueDatasets: data.uniqueDatasets,
        totalModels: data.totalModels,
        trainingJobs: data.trainingJobs,
      });

      setRevenueData(buildRevenueChartData(data.payments));
      setPlanData(buildPlanChartData(data.payments));
      setTrainingData(buildTrainingChartData(data.trainings));
      setRecentTrainings(data.trainings.slice(0, 8));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const paymentsChannel = supabase
      .channel('dashboard-payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, load)
      .subscribe();

    const trainingsChannel = supabase
      .channel('dashboard-trainings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trainings' }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(trainingsChannel);
    };
  }, [load]);

  const trainingStats = useMemo(() => {
    if (!trainingData.length) return null;

    const total = trainingData.reduce((sum, item) => sum + item.jobs, 0);
    const avg = total / trainingData.length;
    const maxMonth = trainingData.reduce(
      (max, item) => (item.jobs > max.jobs ? item : max),
      trainingData[0]
    );
    const minMonth = trainingData.reduce(
      (min, item) => (item.jobs < min.jobs ? item : min),
      trainingData[0]
    );
    const currentMonthJobs = trainingData[trainingData.length - 1].jobs;
    const previousMonthJobs =
      trainingData.length >= 2 ? trainingData[trainingData.length - 2].jobs : 0;
    const trend = currentMonthJobs - previousMonthJobs;
    const percentChange =
      previousMonthJobs > 0 ? (trend / previousMonthJobs) * 100 : trend > 0 ? 100 : 0;

    return {
      total,
      avg: avg.toFixed(1),
      maxMonth,
      minMonth,
      trend,
      percentChange,
      firstMonth: trainingData[0].month,
      lastMonth: trainingData[trainingData.length - 1].month,
      monthsTracked: trainingData.length,
    };
  }, [trainingData]);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold">Platform Overview</h1>
          <p className="text-[13px] text-gray-400">Real-time metrics from your AI platform</p>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && <span className="text-xs text-gray-400">Updated {lastUpdated}</span>}
          <button
            onClick={load}
            className="rounded bg-neutral-900 p-2 transition-colors hover:bg-neutral-800"
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            className="rounded bg-blue-600 p-2 transition-colors hover:bg-blue-700"
            aria-label="Export dashboard"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))}
        </div>
      ) : metrics ? (
        <MetricsBentoGrid metrics={metrics} />
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl bg-neutral-900 p-5 lg:col-span-2">
          {loading ? <ChartSkeleton height={240} /> : <RevenueChart data={revenueData} />}
        </div>

        <div className="rounded-xl bg-neutral-900 p-5">
          {loading ? <ChartSkeleton height={240} /> : <PlanDistributionChart data={planData} />}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
        <div className="flex flex-col gap-4 border-b border-neutral-800 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Training Activity</h3>
              <p className="text-xs text-gray-400">Monthly executed training jobs</p>
            </div>
          </div>

          {trainingStats && (
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-4">
              <div className="rounded-lg bg-neutral-950/60 px-3 py-2 text-left sm:text-right">
                <p className="text-xs text-gray-400">Total jobs</p>
                <p className="text-xl font-bold text-white">{trainingStats.total}</p>
              </div>
              <div className="hidden h-8 w-px bg-neutral-700 sm:block" />
              <div className="rounded-lg bg-neutral-950/60 px-3 py-2 text-left sm:text-right">
                <p className="text-xs text-gray-400">Monthly avg</p>
                <p className="text-xl font-bold text-white">{trainingStats.avg}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5 p-5">
          {trainingStats && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400">Peak Month</span>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-white">
                  {formatTrainingMonth(trainingStats.maxMonth.month)}
                </p>
                <p className="mt-1 text-xs text-gray-400">{trainingStats.maxMonth.jobs} jobs</p>
              </div>

              <div
                className={`rounded-lg border p-3 ${
                  trainingStats.trend >= 0
                    ? 'border-blue-500/20 bg-blue-500/10'
                    : 'border-orange-500/20 bg-orange-500/10'
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-300">Monthly Trend</span>
                  {trainingStats.trend >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-orange-400" />
                  )}
                </div>
                <p
                  className={`text-lg font-bold ${
                    trainingStats.trend >= 0 ? 'text-blue-400' : 'text-orange-400'
                  }`}
                >
                  {trainingStats.trend >= 0 ? '+' : ''}
                  {trainingStats.trend}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {Math.abs(trainingStats.percentChange).toFixed(1)}% vs last month
                </p>
              </div>

              <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-violet-400">Period</span>
                  <Calendar className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <p className="text-sm font-semibold text-white">
                  {formatTrainingMonth(trainingStats.firstMonth)} -{' '}
                  {formatTrainingMonth(trainingStats.lastMonth)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {trainingStats.monthsTracked} months tracked
                </p>
              </div>
            </div>
          )}

          {trainingStats && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-950/45 p-3">
              <div className="mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-300">Performance Insights</span>
              </div>
              <div className="grid gap-2 text-xs md:grid-cols-3">
                <span className="text-gray-400">
                  Best:{' '}
                  <span className="font-medium text-emerald-400">
                    {formatTrainingMonth(trainingStats.maxMonth.month)}
                  </span>{' '}
                  ({trainingStats.maxMonth.jobs} jobs)
                </span>
                <span className="text-gray-400">
                  Lowest:{' '}
                  <span className="font-medium text-orange-400">
                    {formatTrainingMonth(trainingStats.minMonth.month)}
                  </span>{' '}
                  ({trainingStats.minMonth.jobs} jobs)
                </span>
                <span className="text-gray-400">
                  Average: <span className="font-medium text-blue-400">{trainingStats.avg}</span> /
                  month
                </span>
              </div>
            </div>
          )}

          {loading ? <ChartSkeleton height={300} /> : <TrainingsAreaChart data={trainingData} />}
        </div>
      </div>

      <div className="rounded-xl bg-neutral-900 p-5">
        <h3 className="mb-3 font-semibold">Recent Training Jobs</h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <RecentTrainingsFeed trainings={recentTrainings} />
        )}
      </div>
    </div>
  );
}
