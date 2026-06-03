// export function createClient(...args) {
//   // eslint-disable-next-line no-console
//   console.warn('Placeholder: createClient is not implemented yet.', args);
//   return null;
// }


import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}