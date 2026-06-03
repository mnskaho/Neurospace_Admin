-- Migration: Admin SELECT policies for profiles, payments, trainings
-- Allows the authenticated admin to read all rows from these tables

-- ============================================================
-- FUNCTION: is_admin_user
-- Checks if the current user is the designated admin via auth metadata
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND email = 'mnskaho@gmail.com'
  )
$$;

-- ============================================================
-- profiles table
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_profiles" ON public.profiles;
CREATE POLICY "admin_select_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "users_manage_own_profiles" ON public.profiles;
CREATE POLICY "users_manage_own_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================
-- payments table
-- ============================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_payments" ON public.payments;
CREATE POLICY "admin_select_payments"
ON public.payments
FOR SELECT
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "admin_update_payments" ON public.payments;
CREATE POLICY "admin_update_payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "users_manage_own_payments" ON public.payments;
CREATE POLICY "users_manage_own_payments"
ON public.payments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- trainings table
-- ============================================================
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_trainings" ON public.trainings;
CREATE POLICY "admin_select_trainings"
ON public.trainings
FOR SELECT
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "users_manage_own_trainings" ON public.trainings;
CREATE POLICY "users_manage_own_trainings"
ON public.trainings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
