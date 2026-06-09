import type { Profile, Payment, Training, PlanType } from '@/lib/types';
import { normalizePlan } from '@/lib/utils/plan';

export type UserRow = {
  id: string;
  name: string;
  email: string;
  institution: string;
  plan: PlanType;
  joinDate: string;
  lastActivity: string;
  trainingCount: number;
  banned: boolean;
};

export function buildUserRows(
  profiles: Profile[],
  payments: Payment[],
  trainings: Training[]
): UserRow[] {
  const paymentMap = new Map<string, Payment>();

  payments.forEach((p) => {
    paymentMap.set(p.user_id, p);
  });

  const trainingCount = new Map<string, number>();

  trainings.forEach((t) => {
    trainingCount.set(
      t.user_id,
      (trainingCount.get(t.user_id) || 0) + 1
    );
  });

  return profiles.map((p) => {
    const payment = paymentMap.get(p.id);

    const plan = normalizePlan(payment?.plan);

    return {
  id: p.id,
  name: p.name ?? '—',
  email: p.email ?? '—',
  institution: p.institution ?? '—',
  plan,
  joinDate: p.created_at,
  lastActivity: p.updated_at ?? p.created_at,
  trainingCount: trainingCount.get(p.id) ?? 0,
  banned: p.banned ?? false, 
};
  });
}
