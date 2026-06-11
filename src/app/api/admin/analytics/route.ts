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

function datasetName(job: Row) {
  return job.dataset_name || job.dataset_info?.dataset_name || job.filename || 'Unknown Dataset';
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

function collectResultTrainingTimes(job: Row) {
  const results = job.results || {};
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

function fallbackDurationFromDates(job: Row) {
  if (!job.started_at || !job.completed_at) return null;

  const started = new Date(job.started_at).getTime();
  const completed = new Date(job.completed_at).getTime();
  if (!Number.isFinite(started) || !Number.isFinite(completed)) return null;

  const seconds = (completed - started) / 1000;
  return seconds > 0 ? seconds : null;
}

function collectAccuracy(job: Row) {
  const pairs: { model: 'MLP' | 'QNN'; accuracy: number }[] = [];
  const rnn = numberValue(job.results?.rnn?.accuracy);
  if (rnn !== null) pairs.push({ model: 'MLP', accuracy: rnn <= 1 ? rnn * 100 : rnn });

  const qrnn = job.results?.qrnn;
  const qValues = [qrnn?.clean?.accuracy, qrnn?.noisy?.accuracy, qrnn?.mitigated?.accuracy, qrnn?.accuracy]
    .map(numberValue)
    .filter((value): value is number => value !== null);

  qValues.forEach((value) => {
    pairs.push({ model: 'QNN', accuracy: value <= 1 ? value * 100 : value });
  });

  return pairs;
}

async function fetchProfiles() {
  const profiles = await supabase.from('profiles').select('*');
  if (!profiles.error) return profiles.data || [];

  const userProfiles = await supabase.from('user_profiles').select('*');
  if (!userProfiles.error) return userProfiles.data || [];

  return [];
}

function paymentUserKey(payment: Row) {
  return payment.user_id || payment.profile_id || payment.customer_id || payment.email || payment.user_email || payment.id;
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
  const modelUsage = new Map<string, number>([
    ['MLP', 0],
    ['QNN', 0],
  ]);
  const datasets = new Map<string, number>();
  const trainingTimes: number[] = [];
  const accuracyByModel = new Map<string, number[]>();

  jobs.forEach((job) => {
    addToMap(trainingsByMonth, monthKey(job.created_at));
    addToMap(statusDistribution, statusBucket(job.status));
    addToMap(datasets, datasetName(job));

    if (job.results?.rnn) addToMap(modelUsage, 'MLP');
    if (job.results?.qrnn) addToMap(modelUsage, 'QNN');

    const resultTimes = collectResultTrainingTimes(job);
    if (resultTimes.length > 0) {
      trainingTimes.push(...resultTimes);
    } else {
      const fallbackTime = fallbackDurationFromDates(job);
      if (fallbackTime !== null) trainingTimes.push(fallbackTime);
    }

    collectAccuracy(job).forEach(({ model, accuracy }) => {
      const values = accuracyByModel.get(model) || [];
      values.push(accuracy);
      accuracyByModel.set(model, values);
    });
  });

  payments.forEach((payment) => {
    addToMap(revenueByMonth, monthKey(payment.created_at), Number(payment.amount || payment.price || 0));
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
    addToMap(planDistribution, normalizePlan(payment.plan || payment.subscription_plan));
  });
  const usersWithoutPayments = Math.max(0, profiles.length - latestPaymentByUser.size);
  addToMap(planDistribution, 'Free', usersWithoutPayments);

  const popularPlan =
    Array.from(planDistribution.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Free';

  const revenue = payments.reduce((sum, payment) => sum + Number(payment.amount || payment.price || 0), 0);
  const completedJobs = jobs.filter((job) => statusBucket(job.status) === 'completed').length;
  const failedJobs = jobs.filter((job) => statusBucket(job.status) === 'failed').length;
  const averageTrainingTime =
    trainingTimes.length > 0
      ? trainingTimes.reduce((sum, value) => sum + value, 0) / trainingTimes.length
      : 0;

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
    mostUsedModels: mapToSeries(modelUsage),
    mostUsedDatasets: mapToSeries(datasets)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    averageTrainingTime,
    averageAccuracyByModel: Array.from(accuracyByModel.entries()).map(([label, values]) => ({
      label,
      value: values.reduce((sum, value) => sum + value, 0) / values.length,
    })),
  });
}
