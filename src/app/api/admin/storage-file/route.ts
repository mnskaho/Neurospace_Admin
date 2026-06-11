import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseStoragePath(input: string): { bucket: string; objectPath: string } | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.includes('..')) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  const normalized = trimmed.replace(/^\/+/, '');
  const [firstSegment, ...rest] = normalized.split('/');

  if (!firstSegment || rest.length === 0) {
    return { bucket: 'reports', objectPath: normalized };
  }

  return {
    bucket: firstSegment,
    objectPath: rest.join('/'),
  };
}

export async function GET(req: NextRequest) {
  const rawPath = req.nextUrl.searchParams.get('path');

  if (!rawPath) {
    return NextResponse.json({ error: 'Missing storage path' }, { status: 400 });
  }

  if (/^https?:\/\//i.test(rawPath)) {
    return NextResponse.redirect(rawPath);
  }

  const parsed = parseStoragePath(rawPath);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid storage path' }, { status: 400 });
  }

  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.objectPath, 60 * 10);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message || 'Unable to create file URL' },
      { status: 404 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
