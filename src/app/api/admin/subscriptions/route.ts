import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPlanPrice, getTrainingLimit, normalizePlan } from '@/lib/utils/plan';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Row = Record<string, any>;

function dateValue(row: Row, fields: string[]) {
  for (const field of fields) {
    if (row?.[field]) return row[field] as string;
  }
  return null;
}

function normalizeStatus(payment?: Row | null): 'active' | 'pending' | 'failed' | 'canceled' {
  const raw = String(
    payment?.status ||
      payment?.payment_status ||
      payment?.subscription_status ||
      payment?.state ||
      ''
  ).toLowerCase();

  if (['active', 'paid', 'completed', 'complete', 'succeeded', 'success'].includes(raw)) {
    return 'active';
  }
  if (['failed', 'error', 'declined'].includes(raw)) return 'failed';
  if (['canceled', 'cancelled', 'inactive', 'disabled'].includes(raw)) return 'canceled';
  if (['pending', 'processing', 'created'].includes(raw)) return 'pending';

  return payment?.created_at || payment?.amount ? 'active' : 'pending';
}

function userLabel(profile: Row, payment?: Row | null) {
  return (
    profile?.email ||
    profile?.name ||
    profile?.full_name ||
    payment?.email ||
    payment?.user_email ||
    payment?.user_name ||
    'Unknown User'
  );
}

function paymentUserKey(payment: Row) {
  return payment.user_id || payment.profile_id || payment.customer_id || payment.email || payment.user_email;
}

function profileUserKey(profile: Row) {
  return profile.id || profile.user_id || profile.email;
}

function isCompletedThisMonth(job: Row, now = new Date()) {
  const status = String(job.status || '').toLowerCase();
  if (!['completed', 'complete', 'success', 'succeeded'].includes(status)) return false;

  const rawDate = dateValue(job, ['completed_at', 'updated_at', 'created_at']);
  if (!rawDate) return false;

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return false;

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

async function fetchProfiles() {
  const profiles = await supabase.from('profiles').select('*');
  if (!profiles.error) return profiles.data || [];

  const userProfiles = await supabase.from('user_profiles').select('*');
  if (!userProfiles.error) return userProfiles.data || [];

  return [];
}

export async function GET() {
  const [profiles, paymentsRes, jobsRes] = await Promise.all([
    fetchProfiles(),
    supabase.from('payments').select('*').order('created_at', { ascending: false }),
    supabase.from('training_jobs').select('*'),
  ]);

  if (paymentsRes.error) {
    return NextResponse.json({ error: paymentsRes.error.message }, { status: 500 });
  }

  if (jobsRes.error) {
    return NextResponse.json({ error: jobsRes.error.message }, { status: 500 });
  }

  const payments = paymentsRes.data || [];
  const jobs = jobsRes.data || [];
  const latestPaymentByUser = new Map<string, Row>();

  payments.forEach((payment) => {
    const key = paymentUserKey(payment);
    if (key && !latestPaymentByUser.has(String(key))) {
      latestPaymentByUser.set(String(key), payment);
    }
  });

  const rowKeys = new Set<string>();
  const sourceProfiles = profiles.length > 0 ? profiles : [];

  const subscriptions = sourceProfiles.map((profile) => {
    const key = String(profileUserKey(profile) || paymentUserKey(profile) || '');
    rowKeys.add(key);
    const payment = latestPaymentByUser.get(key) || null;
    const plan = normalizePlan(payment?.plan || payment?.subscription_plan || profile?.plan);
    const price = Number(payment?.amount ?? payment?.price ?? getPlanPrice(plan));
    const trainingsUsed = jobs.filter(
      (job) => String(job.user_id || job.profile_id || job.email || '') === key && isCompletedThisMonth(job)
    ).length;

    return {
      id: key || payment?.id || profile?.id,
      user: userLabel(profile, payment),
      plan,
      price,
      trainingsLimit: getTrainingLimit(plan),
      trainingsUsed,
      status: normalizeStatus(payment),
      paymentMethod: payment?.payment_method || payment?.provider || '-',
      invoiceNumber: payment?.invoice_number || payment?.invoice_id || '-',
      startDate: dateValue(payment || {}, ['start_date', 'current_period_start', 'created_at']),
      endDate: dateValue(payment || {}, ['end_date', 'current_period_end', 'expires_at', 'subscription_end']),
      history: payments.filter((candidate) => String(paymentUserKey(candidate) || '') === key),
    };
  });

  payments.forEach((payment) => {
    const key = String(paymentUserKey(payment) || payment.id);
    if (rowKeys.has(key)) return;

    const plan = normalizePlan(payment.plan || payment.subscription_plan);
    subscriptions.push({
      id: key,
      user: userLabel({}, payment),
      plan,
      price: Number(payment.amount ?? payment.price ?? getPlanPrice(plan)),
      trainingsLimit: getTrainingLimit(plan),
      trainingsUsed: jobs.filter(
        (job) => String(job.user_id || job.profile_id || job.email || '') === key && isCompletedThisMonth(job)
      ).length,
      status: normalizeStatus(payment),
      paymentMethod: payment.payment_method || payment.provider || '-',
      invoiceNumber: payment.invoice_number || payment.invoice_id || '-',
      startDate: dateValue(payment, ['start_date', 'current_period_start', 'created_at']),
      endDate: dateValue(payment, ['end_date', 'current_period_end', 'expires_at', 'subscription_end']),
      history: payments.filter((candidate) => String(paymentUserKey(candidate) || '') === key),
    });
  });

  return NextResponse.json({ subscriptions });
}
