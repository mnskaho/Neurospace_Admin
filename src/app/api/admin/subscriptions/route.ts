import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTrainingLimit, normalizePlan } from '@/lib/utils/plan';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Payment = {
  id: string;
  user_id: string | null;
  email: string | null;
  amount: number | null;
  currency: string | null;
  payment_method: string | null;
  invoice_number: string | null;
  created_at: string | null;
  plan: string | null;
};

type Profile = {
  id: string;
  name: string | null;
  institution: string | null;
  email: string | null;
  created_at: string | null;
  updated_at: string | null;
  banned: boolean | null;
  deleted_at: string | null;
};

type TrainingJob = {
  id: string;
  user_id: string | null;
  status: string | null;
  completed_at: string | null;
  updated_at: string | null;
};

function isCompletedThisMonth(job: TrainingJob, now = new Date()) {
  if (String(job.status || '').toLowerCase() !== 'completed') return false;

  const rawDate = job.completed_at || job.updated_at;
  if (!rawDate) return false;

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return false;

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function countTrainingsUsed(jobs: TrainingJob[], userId: string | null) {
  if (!userId) return 0;

  return jobs.filter((job) => job.user_id === userId && isCompletedThisMonth(job)).length;
}

function profileLabel(profile?: Profile | null) {
  return profile?.email || profile?.name || 'Unknown User';
}

export async function GET() {
  const [paymentsRes, profilesRes, jobsRes] = await Promise.all([
    supabase
      .from('payments')
      .select('id, user_id, email, amount, currency, payment_method, invoice_number, created_at, plan')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, name, institution, email, created_at, updated_at, banned, deleted_at'),
    supabase
      .from('training_jobs')
      .select('id, user_id, status, completed_at, updated_at'),
  ]);

  if (paymentsRes.error) {
    return NextResponse.json({ error: paymentsRes.error.message }, { status: 500 });
  }

  if (profilesRes.error) {
    return NextResponse.json({ error: profilesRes.error.message }, { status: 500 });
  }

  if (jobsRes.error) {
    return NextResponse.json({ error: jobsRes.error.message }, { status: 500 });
  }

  const payments = (paymentsRes.data || []) as Payment[];
  const profiles = (profilesRes.data || []) as Profile[];
  const jobs = (jobsRes.data || []) as TrainingJob[];

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const latestPaymentByUser = new Map<string, Payment>();

  payments.forEach((payment) => {
    if (!payment.user_id) return;
    if (!latestPaymentByUser.has(payment.user_id)) {
      latestPaymentByUser.set(payment.user_id, payment);
    }
  });

  const subscriptions = Array.from(latestPaymentByUser.entries()).map(([userId, payment]) => {
    const profile = profileById.get(userId);
    const plan = normalizePlan(payment.plan || 'Free');

    return {
      user: payment.email || profileLabel(profile),
      email: payment.email || profile?.email || '-',
      plan,
      price: Number(payment.amount || 0),
      trainingsLimit: getTrainingLimit(plan),
      trainingsUsed: countTrainingsUsed(jobs, userId),
      status: 'active',
      paymentMethod: payment.payment_method || '-',
      invoiceNumber: payment.invoice_number || '-',
      startDate: payment.created_at,
      endDate: null,
    };
  });

  profiles.forEach((profile) => {
    if (latestPaymentByUser.has(profile.id)) return;

    subscriptions.push({
      user: profileLabel(profile),
      email: profile.email || '-',
      plan: 'Free',
      price: 0,
      trainingsLimit: 1,
      trainingsUsed: countTrainingsUsed(jobs, profile.id),
      status: 'active',
      paymentMethod: '-',
      invoiceNumber: '-',
      startDate: profile.created_at,
      endDate: null,
    });
  });

  return NextResponse.json({ subscriptions });
}
