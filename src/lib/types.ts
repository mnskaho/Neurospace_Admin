// export type PlanType = 'Free' | 'Pro' | 'Entreprise';

// /* ================= PROFILE ================= */
// export type Profile = {
//   id: string;
//   name: string | null;
//   email: string | null;
//   institution: string | null;
//   created_at: string;
//   updated_at: string | null;
// };
// /* ================= PAYMENT ================= */
// export type Payment = {
//   id: string;
//   user_id: string;
//   plan: string; // brut DB (on normalise après)
//   amount?: number;
//   created_at: string;
// };

// /* ================= TRAINING ================= */
// export type Training = {
//   id: string;
//   user_id: string;
//   dataset_name?: string;
//   created_at: string;
// };


export type PlanType = 'Free' | 'Pro' | 'Entreprise';

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
  plan: 'Free' | 'Pro' | 'Entreprise' | 'Premium'; // compat DB
  created_at: string;
};

/* ================= TRAINING ================= */
export type Training = {
  id: string;
  user_id: string;
  dataset_name: string;
  created_at: string;
};