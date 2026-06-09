export type PlanType = 'Free' | 'Pro' | 'Pro+';
export type PlanKey = 'free' | 'pro' | 'pro_plus';
export type DbPlanType = PlanType | PlanKey | (string & {});

/* ================= PROFILE ================= */
export type Profile = {
  id: string;
  name: string | null;
  institution: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  banned: boolean; 
  deleted_at?: string | null; 
};

/* ================= PAYMENT ================= */
export type Payment = {
  id: string;
  user_id: string;
  email: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  invoice_number: string | null;
  plan: DbPlanType; // compat DB: legacy plan values normalize before display
  created_at: string;
};

/* ================= TRAINING ================= */
export type Training = {
  id: string;
  user_id: string;
  dataset_name: string;
  created_at: string;
};
