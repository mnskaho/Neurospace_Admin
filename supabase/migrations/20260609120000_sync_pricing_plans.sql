-- Synchronize stored subscription plan names with the client-side pricing model.
-- Legacy enterprise/entreprise subscriptions are preserved and renamed to pro_plus.

UPDATE public.payments
SET plan = 'pro_plus'
WHERE lower(plan) IN ('enterprise', 'entreprise', 'pro+', 'pro-plus', 'pro plus');

UPDATE public.payments
SET plan = 'pro'
WHERE lower(plan) = 'premium';

UPDATE public.payments
SET plan = 'free'
WHERE plan IS NULL OR lower(plan) = 'free';
