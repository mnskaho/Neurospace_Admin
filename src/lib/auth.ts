import { supabase, ADMIN_EMAIL } from './supabase';

export async function signInAdmin(email: string, password: string) {
  // Backend integration: Supabase Auth signInWithPassword
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: 'Invalid credentials — use the demo account below to sign in.' };
  }

  if (data.user?.email !== ADMIN_EMAIL) {
    await supabase.auth.signOut();
    return { success: false, error: 'Access denied. This panel is restricted to authorized administrators only.' };
  }

  return { success: true, user: data.user };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return session.user.email === ADMIN_EMAIL;
}