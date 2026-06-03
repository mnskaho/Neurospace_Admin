import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  const { userId } = await req.json();

  // 1. delete profile
  await supabase.from('profiles').delete().eq('id', userId);

  // 2. delete payments
  await supabase.from('payments').delete().eq('user_id', userId);

  // 3. delete trainings
  await supabase.from('trainings').delete().eq('user_id', userId);

  // 4. delete auth user (IMPORTANT)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}