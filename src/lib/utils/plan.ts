import type { PlanKey, PlanType } from '@/lib/types';

export const PLAN_LABELS: Record<PlanKey, PlanType> = {
  free: 'Free',
  pro: 'Pro',
  pro_plus: 'Pro+',
};

export const PLAN_PRICES_EUR: Record<PlanKey, number> = {
  free: 0,
  pro: 150,
  pro_plus: 500,
};

export const PLAN_TRAINING_LIMITS: Record<PlanKey, number> = {
  free: 1,
  pro: 5,
  pro_plus: 25,
};

export const PLAN_OPTIONS = [
  {
    key: 'free',
    label: PLAN_LABELS.free,
    price: PLAN_PRICES_EUR.free,
    trainingLimit: PLAN_TRAINING_LIMITS.free,
  },
  {
    key: 'pro',
    label: PLAN_LABELS.pro,
    price: PLAN_PRICES_EUR.pro,
    trainingLimit: PLAN_TRAINING_LIMITS.pro,
  },
  {
    key: 'pro_plus',
    label: PLAN_LABELS.pro_plus,
    price: PLAN_PRICES_EUR.pro_plus,
    trainingLimit: PLAN_TRAINING_LIMITS.pro_plus,
  },
] as const;

export function normalizePlan(plan?: string): PlanType {
  return PLAN_LABELS[normalizePlanKey(plan)];
}

export function normalizePlanKey(plan?: string): PlanKey {
  const p = plan?.toLowerCase().replace(/\s+/g, '_');

  if (p === 'premium' || p === 'pro') return 'pro';
  if (p === 'pro+' || p === 'pro_plus' || p === 'pro-plus' || p === 'entreprise' || p === 'enterprise') {
    return 'pro_plus';
  }

  return 'free';
}

export function toDbPlan(plan?: string): PlanKey {
  return normalizePlanKey(plan);
}

export function isPaidPlan(plan?: string) {
  return normalizePlanKey(plan) !== 'free';
}

export function getPlanPrice(plan?: string) {
  return PLAN_PRICES_EUR[normalizePlanKey(plan)];
}

export function getTrainingLimit(plan?: string) {
  return PLAN_TRAINING_LIMITS[normalizePlanKey(plan)];
}
