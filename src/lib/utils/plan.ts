export type PlanType = 'Free' | 'Pro' | 'Entreprise';

export function normalizePlan(plan?: string): PlanType {
  const p = plan?.toLowerCase();

  if (p === 'premium' || p === 'pro') return 'Pro';
  if (p === 'entreprise') return 'Entreprise';

  return 'Free';
}