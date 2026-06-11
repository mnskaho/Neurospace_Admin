import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mapModelRows, type TrainingJob } from '@/lib/admin-training-jobs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('training_jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    models: ((data || []) as TrainingJob[]).flatMap(mapModelRows),
  });
}
