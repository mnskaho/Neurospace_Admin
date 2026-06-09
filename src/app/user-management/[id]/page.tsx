'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchPayments, fetchTrainings, fetchAdminLogs } from '@/lib/data';
import { normalizePlan } from '@/lib/utils/plan';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trash2,
  History,
} from 'lucide-react';

type Profile = {
  id: string;
  name: string;
  email: string;
  institution: string;
  created_at: string;
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]); // 🔥 LOGS STATE

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data);

      const [p, t, l] = await Promise.all([
        fetchPayments(),
        fetchTrainings(),
        fetchAdminLogs(userId), // 🔥 LOGS FETCH
      ]);

      setPayments(p.filter((x) => x.user_id === userId));
      setTrainings(t.filter((x) => x.user_id === userId));
      setLogs(l); // 🔥 SET LOGS
    } catch {
      toast.error('Failed to load user');
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const deleteUser = async () => {
    await supabase.from('profiles').delete().eq('id', userId);
    toast.success('User deleted');
    router.push('/user-management');
  };

  if (!profile) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <button
          onClick={() => router.push('/user-management')}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={deleteUser}
            className="px-3 py-2 bg-red-600 rounded flex gap-2 text-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h1 className="text-xl font-semibold">{profile.name}</h1>
        <p className="text-gray-400">{profile.email}</p>

        <div className="mt-3 text-sm text-gray-400 space-y-1">
          <p>🏢 {profile.institution}</p>
          <p>📅 Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PAYMENTS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h2 className="font-semibold mb-3">Payments</h2>

          {payments.length === 0 ? (
            <p className="text-gray-500 text-sm">No payments</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="p-2 bg-neutral-800 rounded text-sm">
                  {p.amount}€ • {normalizePlan(p.plan)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TRAININGS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h2 className="font-semibold mb-3">Trainings</h2>

          {trainings.length === 0 ? (
            <p className="text-gray-500 text-sm">No trainings</p>
          ) : (
            <div className="space-y-2">
              {trainings.map((t) => (
                <div key={t.id} className="p-2 bg-neutral-800 rounded text-sm">
                  {t.dataset_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= LOGS SECTION ================= */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">

        <div className="flex items-center gap-2 mb-3">
          <History size={18} />
          <h2 className="font-semibold">Admin Activity Logs</h2>
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">No admin actions yet</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">

            {logs.map((log) => (
              <div
                key={log.id}
                className="flex justify-between items-center bg-neutral-800 p-2 rounded text-sm"
              >
                <div>
                  <span className="text-gray-300">{log.action}</span>
                  <div className="text-xs text-gray-500">
                    by {log.admin_email}
                  </div>
                </div>

                <span className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}

          </div>
        )}
      </div>

    </div>
  );
}
