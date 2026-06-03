// // import { supabase } from './supabase';
// // import type { Profile, Payment, Training } from './supabase';

// // // Backend integration: All queries hit Supabase REST API via supabase-js

// // export async function fetchProfiles(): Promise<Profile[]> {
// //   const { data, error } = await supabase
// //     .from('profiles')
// //     .select('*')
// //     .order('created_at', { ascending: false });
// //   if (error) {
// //     console.error('[fetchProfiles] Supabase error:', error);
// //     throw new Error(error.message);
// //   }
// //   return data ?? [];
// // }

// // export async function fetchPayments(): Promise<Payment[]> {
// //   const { data, error } = await supabase
// //     .from('payments')
// //     .select('*')
// //     .order('created_at', { ascending: false });
// //   if (error) {
// //     console.error('[fetchPayments] Supabase error:', error);
// //     throw new Error(error.message);
// //   }
// //   return data ?? [];
// // }

// // export async function fetchTrainings(): Promise<Training[]> {
// //   const { data, error } = await supabase
// //     .from('trainings')
// //     .select('*')
// //     .order('created_at', { ascending: false });
// //   if (error) {
// //     console.error('[fetchTrainings] Supabase error:', error);
// //     throw new Error(error.message);
// //   }
// //   return data ?? [];
// // }

// // export async function updatePaymentPlan(userId: string, plan: 'Free' | 'Premium') {
// //   // Backend integration: Update payments.plan for given user_id
// //   const { error } = await supabase
// //     .from('payments')
// //     .update({ plan })
// //     .eq('user_id', userId);
// //   if (error) {
// //     console.error('[updatePaymentPlan] Supabase error:', error);
// //     throw new Error(error.message);
// //   }
// // }

// // export async function deleteUserProfile(userId: string) {
// //   // Backend integration: Delete profile record (auth user deletion requires service role key)
// //   const { error } = await supabase
// //     .from('profiles')
// //     .delete()
// //     .eq('id', userId);
// //   if (error) {
// //     console.error('[deleteUserProfile] Supabase error:', error);
// //     throw new Error(error.message);
// //   }
// // }

// // export async function fetchDashboardMetrics() {
// //   const [profiles, payments, trainings] = await Promise.all([
// //     fetchProfiles(),
// //     fetchPayments(),
// //     fetchTrainings(),
// //   ]);

// //   const now = new Date();
// //   const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
// //   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
// //   const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
// //   const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

// //   const totalUsers = profiles.length;
// //   const activeUsers7d = profiles.filter(
// //     (p) => new Date(p.created_at) >= sevenDaysAgo
// //   ).length;

// //   const premiumPayments = payments.filter((p) => p.plan === 'Premium');
// //   const premiumSubscribers = premiumPayments.length;
// //   const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

// //   const currentMonthRevenue = payments
// //     .filter((p) => new Date(p.created_at) >= startOfMonth)
// //     .reduce((sum, p) => sum + (p.amount || 0), 0);

// //   const lastMonthRevenue = payments
// //     .filter((p) => {
// //       const d = new Date(p.created_at);
// //       return d >= startOfLastMonth && d <= endOfLastMonth;
// //     })
// //     .reduce((sum, p) => sum + (p.amount || 0), 0);

// //   const monthlyGrowth =
// //     lastMonthRevenue === 0
// //       ? 100
// //       : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

// //   const uniqueDatasets = new Set(trainings.map((t) => t.dataset_name)).size;
// //   const totalModels = trainings.length;
// //   const trainingJobs = trainings.length;

// //   return {
// //     totalUsers,
// //     activeUsers7d,
// //     premiumSubscribers,
// //     totalRevenue,
// //     monthlyGrowth,
// //     uniqueDatasets,
// //     totalModels,
// //     trainingJobs,
// //     profiles,
// //     payments,
// //     trainings,
// //   };
// // }

// // export function buildRevenueChartData(payments: Payment[]) {
// //   if (!payments.length) return [];
// //   const map: Record<string, number> = {};
// //   payments.forEach((p) => {
// //     const date = new Date(p.created_at);
// //     const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
// //     map[key] = (map[key] || 0) + (p.amount || 0);
// //   });
// //   return Object.entries(map)
// //     .sort(([a], [b]) => a.localeCompare(b))
// //     .map(([month, revenue]) => ({ month, revenue }));
// // }

// // export function buildPlanChartData(payments: Payment[]) {
// //   const free = payments.filter((p) => p.plan === 'Free').length;
// //   const premium = payments.filter((p) => p.plan === 'Premium').length;
// //   return [
// //     { plan: 'Free', count: free },
// //     { plan: 'Premium', count: premium },
// //   ];
// // }

// // export function buildTrainingChartData(trainings: Training[]) {
// //   if (!trainings.length) return [];
// //   const map: Record<string, number> = {};
// //   trainings.forEach((t) => {
// //     const date = new Date(t.created_at);
// //     const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
// //     map[key] = (map[key] || 0) + 1;
// //   });
// //   return Object.entries(map)
// //     .sort(([a], [b]) => a.localeCompare(b))
// //     .map(([month, jobs]) => ({ month, jobs }));
// // }

// import { supabase } from './supabase';
// import type { Profile, Payment, Training } from './supabase';

// // =============================
// // 🔹 Helpers (logique métier)
// // =============================

// export function isPremium(plan?: string) {
//   return ['pro', 'entreprise'].includes(plan?.toLowerCase() || '');
// }

// // =============================
// // 🔹 Fetchers
// // =============================

// export async function fetchProfiles(): Promise<Profile[]> {
//   const { data, error } = await supabase
//     .from('profiles')
//     .select('*')
//     .order('created_at', { ascending: false });

//   if (error) throw new Error(error.message);
//   return data ?? [];
// }

// export async function fetchPayments(): Promise<Payment[]> {
//   const { data, error } = await supabase
//     .from('payments')
//     .select('*')
//     .order('created_at', { ascending: false });

//   if (error) throw new Error(error.message);
//   return data ?? [];
// }

// export async function fetchTrainings(): Promise<Training[]> {
//   const { data, error } = await supabase
//     .from('trainings')
//     .select('*')
//     .order('created_at', { ascending: false });

//   if (error) throw new Error(error.message);
//   return data ?? [];
// }

// // =============================
// // 🔹 Dashboard Metrics
// // =============================

// export async function fetchDashboardMetrics() {
//   const [profiles, payments, trainings] = await Promise.all([
//     fetchProfiles(),
//     fetchPayments(),
//     fetchTrainings(),
//   ]);

//   const now = new Date();
//   const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//   const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//   const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

//   // =============================
//   // 🔹 Users
//   // =============================

//   const totalUsers = profiles.length;

//   const activeUsers7d = profiles.filter(
//     (p) => new Date(p.created_at) >= sevenDaysAgo
//   ).length;

  

//   // =============================
//   // 🔹 Premium Subscribers (UNIQUE USERS)
//   // =============================

//   const premiumUsers = new Set(
//     payments
//       .filter((p) => isPremium(p.plan))
//       .map((p) => p.user_id)
//   );

//   const premiumSubscribers = premiumUsers.size;

//   // =============================
//   // 🔹 Revenue
//   // =============================

//   const totalRevenue = payments.reduce(
//     (sum, p) => sum + (p.amount || 0),
//     0
//   );

//   const currentMonthRevenue = payments
//     .filter((p) => new Date(p.created_at) >= startOfMonth)
//     .reduce((sum, p) => sum + (p.amount || 0), 0);

//   const lastMonthRevenue = payments
//     .filter((p) => {
//       const d = new Date(p.created_at);
//       return d >= startOfLastMonth && d <= endOfLastMonth;
//     })
//     .reduce((sum, p) => sum + (p.amount || 0), 0);

//   const monthlyGrowth =
//     lastMonthRevenue === 0
//       ? 100
//       : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

//   // =============================
//   // 🔹 Trainings
//   // =============================

//   const uniqueDatasets = new Set(
//     trainings.map((t) => t.dataset_name)
//   ).size;

//   const totalModels = trainings.length;
//   const trainingJobs = trainings.length;

//   return {
//     totalUsers,
//     activeUsers7d,
//     premiumSubscribers,
//     totalRevenue,
//     monthlyGrowth,
//     uniqueDatasets,
//     totalModels,
//     trainingJobs,
//     profiles,
//     payments,
//     trainings,
//   };
// }

// // =============================
// // 🔹 Charts
// // =============================

// // 📊 Revenue chart
// export function buildRevenueChartData(payments: Payment[]) {
//   if (!payments.length) return [];

//   const map: Record<string, number> = {};

//   payments.forEach((p) => {
//     const date = new Date(p.created_at);
//     const key = `${date.getFullYear()}-${String(
//       date.getMonth() + 1
//     ).padStart(2, '0')}`;

//     map[key] = (map[key] || 0) + (p.amount || 0);
//   });

//   return Object.entries(map)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([month, revenue]) => ({ month, revenue }));
// }

// // 📊 Plan Distribution (FREE / PRO / ENTREPRISE)
// export function buildPlanChartData(payments: Payment[]) {
//   const freeUsers = new Set<string>();
//   const proUsers = new Set<string>();
//   const entrepriseUsers = new Set<string>();

//   payments.forEach((p) => {
//     const plan = p.plan?.toLowerCase();

//     if (plan === 'free') {
//       freeUsers.add(p.user_id);
//     } else if (plan === 'pro') {
//       proUsers.add(p.user_id);
//     } else if (plan === 'entreprise') {
//       entrepriseUsers.add(p.user_id);
//     }
//   });

//   return [
//     { plan: 'Free', count: freeUsers.size },
//     { plan: 'Pro', count: proUsers.size },
//     { plan: 'Entreprise', count: entrepriseUsers.size },
//   ];
// }

// // 📊 Training chart
// export function buildTrainingChartData(trainings: Training[]) {
//   if (!trainings.length) return [];

//   const map: Record<string, number> = {};

//   trainings.forEach((t) => {
//     const date = new Date(t.created_at);
//     const key = `${date.getFullYear()}-${String(
//       date.getMonth() + 1
//     ).padStart(2, '0')}`;

//     map[key] = (map[key] || 0) + 1;
//   });

//   return Object.entries(map)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([month, jobs]) => ({ month, jobs }));
// }


import { supabase } from './supabase';

import type { Profile, Payment, Training, PlanType } from '@/lib/types';

/* =========================================================
   🔹 HELPERS
========================================================= */

export function normalizePlan(plan?: string): PlanType {
  const p = plan?.toLowerCase() || 'free';

  if (p === 'pro' || p === 'premium') return 'Pro';
  if (p === 'entreprise' || p === 'enterprise') return 'Entreprise';

  return 'Free';
}

export function isPremium(plan?: string) {
  const p = normalizePlan(plan);
  return p === 'Pro' || p === 'Entreprise';
}

/* =========================================================
   🔹 FETCHERS
========================================================= */

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchTrainings(): Promise<Training[]> {
  const { data, error } = await supabase
    .from('trainings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAdminLogs(userId?: string) {
  let query = supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}
/* =========================================================
   🔹 UPDATE USER PLAN
========================================================= */

export async function updatePaymentPlan(
  userId: string,
  plan: PlanType
) {
  const { error } = await supabase
    .from('payments')
    .update({ plan })
    .eq('user_id', userId);

  if (error) {
    console.error('[updatePaymentPlan]', error);
    throw new Error(error.message);
  }
}

/* =========================================================
   🔹 DELETE USER (FULL CLEANUP)
========================================================= */

export async function deleteUserProfile(userId: string) {
  // delete payments
  const { error: paymentError } = await supabase
    .from('payments')
    .delete()
    .eq('user_id', userId);

  if (paymentError) {
    console.error('[deleteUserProfile:payments]', paymentError);
    throw new Error(paymentError.message);
  }

  // delete trainings
  const { error: trainingError } = await supabase
    .from('trainings')
    .delete()
    .eq('user_id', userId);

  if (trainingError) {
    console.error('[deleteUserProfile:trainings]', trainingError);
    throw new Error(trainingError.message);
  }

  // delete profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    console.error('[deleteUserProfile:profiles]', profileError);
    throw new Error(profileError.message);
  }
}

/* =========================================================
   🔹 DASHBOARD METRICS
========================================================= */

export async function fetchDashboardMetrics() {
  const [profiles, payments, trainings] = await Promise.all([
    fetchProfiles(),
    fetchPayments(),
    fetchTrainings(),
  ]);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  /* =========================
     USERS
  ========================= */

  const totalUsers = profiles.length;

  const activeUsers7d = profiles.filter(
    (p) => new Date(p.created_at) >= sevenDaysAgo
  ).length;

  /* =========================
     PREMIUM USERS (UNIQUE)
  ========================= */

  const premiumSubscribers = new Set(
    payments
      .filter((p) => isPremium(p.plan))
      .map((p) => p.user_id)
  ).size;

  /* =========================
     REVENUE
  ========================= */

  const totalRevenue = payments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  const currentMonthRevenue = payments
    .filter((p) => new Date(p.created_at) >= startOfMonth)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const lastMonthRevenue = payments
    .filter((p) => {
      const d = new Date(p.created_at);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const monthlyGrowth =
    lastMonthRevenue === 0
      ? 100
      : ((currentMonthRevenue - lastMonthRevenue) /
          lastMonthRevenue) *
        100;

  /* =========================
     TRAININGS
  ========================= */

  const uniqueDatasets = new Set(
    trainings.map((t) => t.dataset_name)
  ).size;

  const totalModels = trainings.length;

  return {
    totalUsers,
    activeUsers7d,
    premiumSubscribers,
    totalRevenue,
    monthlyGrowth,
    uniqueDatasets,
    totalModels,
    trainingJobs: trainings.length,
    profiles,
    payments,
    trainings,
  };
}

/* =========================================================
   🔹 CHARTS
========================================================= */

export function buildRevenueChartData(payments: Payment[]) {
  const map: Record<string, number> = {};

  payments.forEach((p) => {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}`;

    map[key] = (map[key] || 0) + (p.amount || 0);
  });

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      month,
      revenue,
    }));
}

/* =========================
   PLAN DISTRIBUTION
========================= */

export function buildPlanChartData(payments: Payment[]) {
  const free = new Set<string>();
  const pro = new Set<string>();
  const entreprise = new Set<string>();

  payments.forEach((p) => {
    const plan = normalizePlan(p.plan);

    if (plan === 'Free') free.add(p.user_id);
    else if (plan === 'Pro') pro.add(p.user_id);
    else if (plan === 'Entreprise') entreprise.add(p.user_id);
  });

  return [
    { plan: 'Free', count: free.size },
    { plan: 'Pro', count: pro.size },
    { plan: 'Entreprise', count: entreprise.size },
  ];
}

/* =========================
   TRAINING CHART
========================= */

export function buildTrainingChartData(trainings: Training[]) {
  const map: Record<string, number> = {};

  trainings.forEach((t) => {
    if (!t.created_at) return;

    const d = new Date(t.created_at);

    if (isNaN(d.getTime())) return; // 🔥 skip invalid dates

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, jobs]) => ({
      month,
      jobs,
    }));
}

export async function banUserById(userId: string, banned: boolean) {
  // 1. update user ban status
  const { error } = await supabase
    .from('profiles')
    .update({
      banned,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;

  // 2. admin log
  const { error: logError } = await supabase.from('admin_logs').insert({
    admin_email: 'admin@system.com',
    user_id: userId,
    action: banned ? 'BAN_USER' : 'UNBAN_USER',
  });

  if (logError) {
    console.error('[ADMIN LOG ERROR]', logError.message);
  }
}

export async function deleteUserById(userId: string) {
  // 1. delete payments
  const { error: payErr } = await supabase
    .from('payments')
    .delete()
    .eq('user_id', userId);

  if (payErr) throw new Error(payErr.message);

  // 2. delete trainings
  const { error: trainErr } = await supabase
    .from('trainings')
    .delete()
    .eq('user_id', userId);

  if (trainErr) throw new Error(trainErr.message);

  // 3. delete profile
  const { error: profErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profErr) throw new Error(profErr.message);

  // 4. admin log
  const { error: logError } = await supabase.from('admin_logs').insert({
    admin_email: 'admin@system.com',
    user_id: userId,
    action: 'DELETE_USER',
  });

  if (logError) {
    console.error('[ADMIN LOG ERROR]', logError.message);
  }
}

