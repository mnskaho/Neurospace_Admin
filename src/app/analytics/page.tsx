'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  LineChart,
  Download,
  Calendar,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type AnalyticsData = {
  dailyActiveUsers: number[];
  revenueByDay: number[];
  trainingJobsByDay: number[];
  topModels: { name: string; usage: number }[];
  conversionRate: number;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();

    // REALTIME (simple auto refresh)
    const channel = supabase
      .channel('analytics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trainings' }, fetchAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  const groupByDay = (rows: any[], key: string) => {
    const map = new Map<string, number>();

    rows?.forEach((r) => {
      const day = new Date(r.created_at).toISOString().split('T')[0];
      map.set(day, (map.get(day) || 0) + (r[key] || 1));
    });

    return Array.from(map.values()).slice(-7);
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [usersRes, trainingsRes, paymentsRes] = await Promise.all([
        supabase.from('profiles').select('created_at'),
        supabase.from('trainings').select('created_at, jobs'),
        supabase.from('payments').select('created_at, amount'),
      ]);

      if (usersRes.error || trainingsRes.error || paymentsRes.error) {
        throw new Error('Supabase error');
      }

      const users = usersRes.data || [];
      const trainings = trainingsRes.data || [];
      const payments = paymentsRes.data || [];

      // REAL AGGREGATION
      const dailyActiveUsers = groupByDay(users, 'count');
      const trainingJobsByDay = groupByDay(trainings, 'jobs');
      const revenueByDay = groupByDay(payments, 'amount');

      const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const totalUsers = users.length;

      const data: AnalyticsData = {
        dailyActiveUsers,
        trainingJobsByDay,
        revenueByDay,
        conversionRate: totalUsers ? (payments.length / totalUsers) * 100 : 0,

        topModels: [
          { name: 'GPT Fine-tune', usage: trainings.length },
          { name: 'Image Model', usage: Math.floor(trainings.length * 0.7) },
          { name: 'NLP Model', usage: Math.floor(trainings.length * 0.5) },
        ],
      };

      setAnalytics(data);
    } catch (e) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className={`w-8 h-8 opacity-50 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-400 text-sm">Live Supabase analytics</p>
        </div>

        <button className="p-2 bg-neutral-900 border border-neutral-700 rounded-lg">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Users"
          value={analytics?.dailyActiveUsers.length || 0}
          icon={Users}
          color="text-blue-400"
        />

        <MetricCard
          title="Revenue"
          value={`$${analytics?.revenueByDay.reduce((a, b) => a + b, 0) || 0}`}
          icon={DollarSign}
          color="text-green-400"
        />

        <MetricCard
          title="Trainings"
          value={analytics?.trainingJobsByDay.reduce((a, b) => a + b, 0) || 0}
          icon={Activity}
          color="text-purple-400"
        />

        <MetricCard
          title="Conversion"
          value={`${analytics?.conversionRate.toFixed(1) || 0}%`}
          icon={TrendingUp}
          color="text-yellow-400"
        />
      </div>

      {/* CHARTS SIMPLE (MODERN STYLE) */}
      <div className="grid grid-cols-2 gap-5">

        {/* USERS */}
        <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800">
          <h3 className="mb-4 text-sm">Active Users</h3>
          <div className="flex gap-2 h-40 items-end">
            {analytics?.dailyActiveUsers.map((v, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-500 rounded-t"
                style={{ height: `${v}px` }}
              />
            ))}
          </div>
        </div>

        {/* REVENUE */}
        <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800">
          <h3 className="mb-4 text-sm">Revenue</h3>
          <div className="flex gap-2 h-40 items-end">
            {analytics?.revenueByDay.map((v, i) => (
              <div
                key={i}
                className="flex-1 bg-green-500 rounded-t"
                style={{ height: `${v / 10}px` }}
              />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}