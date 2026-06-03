// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
//   auth: {
//     persistSession: true,
//     autoRefreshToken: true,
//     detectSessionInUrl: false,
//   },
// });

// export const ADMIN_EMAIL = 'mnskaho@gmail.com';

// export type Profile = {
//   id: string;
//   name: string | null;
//   institution: string | null;
//   email: string | null;
//   created_at: string;
// };

// export type Payment = {
//   id: string;
//   user_id: string;
//   email: string | null;
//   amount: number;
//   currency: string;
//   payment_method: string | null;
//   invoice_number: string | null;
//   plan: 'Free' | 'Premium';
//   created_at: string;
// };

// export type Training = {
//   id: string;
//   user_id: string;
//   dataset_name: string;
//   created_at: string;
// };

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export const ADMIN_EMAIL = 'mnskaho@gmail.com';