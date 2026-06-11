import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizePlan } from '@/lib/utils/plan';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Row = Record<string, any>;

function monthKey(value?: string | null) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function addToMap(map: Map<string, number>, key: string, value = 1) {
  map.set(key, (map.get(key) || 0) + value);
}

function mapToSeries(map: Map<string, number>) {
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

function statusBucket(status?: string | null) {
  const normalized = String(status || 'queued').toLowerCase();
  if (normalized.includes('complete') || normalized.includes('success')) return 'completed';
  if (normalized.includes('fail') || normalized.includes('error')) return 'failed';
  if (normalized.includes('process') || normalized.includes('running') || normalized.includes('train')) return 'processing';
  return 'queued';
}

function numberValue(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function positiveNumberValue(value: unknown) {
  const numeric = numberValue(value);
  return numeric !== null && numeric > 0 ? numeric : null;
}

function average(values: number[]) {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function paymentUserKey(payment: Row) {
  return payment.user_id || payment.email || payment.id;
}

async function fetchProfiles() {
  const profiles = await supabase.from('profiles').select('id, email, created_at');
  if (!profiles.error) return profiles.data || [];

  const userProfiles = await supabase.from('user_profiles').select('*');
  if (!userProfiles.error) return userProfiles.data || [];

  return [];
}

function collectQnnAccuracies(results: Row) {
  return [
    results.qrnn?.accuracy,
    results.qrnn?.clean?.accuracy,
    results.qrnn?.noisy?.accuracy,
    results.qrnn?.mitigated?.accuracy,
  ]
    .map(numberValue)
    .filter((value): value is number => value !== null)
    .map((value) => (value <= 1 ? value * 100 : value));
}

function collectTrainingTimes(results: Row) {
  const times = [
    results.rnn?.training_time_seconds,
    results.qrnn?.training_time_seconds,
    results.qrnn?.clean?.training_time_seconds,
    results.qrnn?.noisy?.training_time_seconds,
    results.qrnn?.mitigated?.training_time_seconds,
    results.training_times?.rnn?.training_time_seconds,
    results.training_times?.qrnn?.training_time_seconds,
    results.training_times?.qrnn_clean?.training_time_seconds,
    results.training_times?.qrnn_noisy?.training_time_seconds,
    results.training_times?.qrnn_mitigated?.training_time_seconds,
  ];

  return times
    .map(positiveNumberValue)
    .filter((value): value is number => value !== null);
}

export async function GET() {
  const [profiles, jobsRes, paymentsRes] = await Promise.all([
    fetchProfiles(),
    supabase.from('training_jobs').select('*').order('created_at', { ascending: false }),
    supabase.from('payments').select('*').order('created_at', { ascending: false }),
  ]);

  if (jobsRes.error) {
    return NextResponse.json({ error: jobsRes.error.message }, { status: 500 });
  }

  if (paymentsRes.error) {
    return NextResponse.json({ error: paymentsRes.error.message }, { status: 500 });
  }

  const jobs = jobsRes.data || [];
  const payments = paymentsRes.data || [];
  const trainingsByMonth = new Map<string, number>();
  const revenueByMonth = new Map<string, number>();
  const statusDistribution = new Map<string, number>([
    ['completed', 0],
    ['failed', 0],
    ['processing', 0],
    ['queued', 0],
  ]);
  const modelCounts = { mlp: 0, qnn: 0 };
  const mlpAccuracies: number[] = [];
  const qnnAccuracies: number[] = [];
  const trainingTimes: number[] = [];

  jobs.forEach((job) => {
    const bucket = statusBucket(job.status);
    const results = job.results || {};

    addToMap(trainingsByMonth, monthKey(job.created_at));
    addToMap(statusDistribution, bucket);

    if (bucket === 'completed' || results.rnn || results.qrnn) {
      if (results.rnn) modelCounts.mlp += 1;
      if (results.qrnn) modelCounts.qnn += 1;
    }

    const mlpAccuracy = numberValue(results.rnn?.accuracy);
    if (mlpAccuracy !== null) {
      mlpAccuracies.push(mlpAccuracy <= 1 ? mlpAccuracy * 100 : mlpAccuracy);
    }

    qnnAccuracies.push(...collectQnnAccuracies(results));
    trainingTimes.push(...collectTrainingTimes(results));
  });

  payments.forEach((payment) => {
    addToMap(revenueByMonth, monthKey(payment.created_at), Number(payment.amount || 0));
  });

  const latestPaymentByUser = new Map<string, Row>();
  payments.forEach((payment) => {
    const key = String(paymentUserKey(payment));
    if (!latestPaymentByUser.has(key)) latestPaymentByUser.set(key, payment);
  });

  const planDistribution = new Map<string, number>([
    ['Free', 0],
    ['Pro', 0],
    ['Pro+', 0],
  ]);
  latestPaymentByUser.forEach((payment) => {
    addToMap(planDistribution, normalizePlan(payment.plan));
  });
  addToMap(planDistribution, 'Free', Math.max(0, profiles.length - latestPaymentByUser.size));

  const popularPlan =
    Array.from(planDistribution.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Free';
  const modelTotal = modelCounts.mlp + modelCounts.qnn;
  const revenue = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const completedJobs = jobs.filter((job) => statusBucket(job.status) === 'completed').length;
  const failedJobs = jobs.filter((job) => statusBucket(job.status) === 'failed').length;

  return NextResponse.json({
    kpis: {
      totalUsers: profiles.length,
      totalTrainings: jobs.length,
      completedJobs,
      failedJobs,
      revenue,
      popularPlan,
    },
    trainingsPerMonth: mapToSeries(trainingsByMonth),
    revenuePerMonth: mapToSeries(revenueByMonth),
    planDistribution: mapToSeries(planDistribution),
    jobStatusDistribution: mapToSeries(statusDistribution),
    modelUsage: {
      mlp: modelCounts.mlp,
      qnn: modelCounts.qnn,
      total: modelTotal,
      mlpPercent: modelTotal > 0 ? (modelCounts.mlp / modelTotal) * 100 : 0,
      qnnPercent: modelTotal > 0 ? (modelCounts.qnn / modelTotal) * 100 : 0,
    },
    averageAccuracyByModel: {
      mlp: average(mlpAccuracies),
      qnn: average(qnnAccuracies),
    },
    averageTrainingTimeSeconds: average(trainingTimes),
  });
}
