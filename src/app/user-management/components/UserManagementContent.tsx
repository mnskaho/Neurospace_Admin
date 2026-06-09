'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

import {
  fetchProfiles,
  fetchPayments,
  fetchTrainings,
} from '@/lib/data';

import { supabase } from '@/lib/supabase';
import type { PlanType, Profile } from '@/lib/types';
import { buildUserRows } from '@/lib/mappers/user.mapper';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';

/* ================= TYPES ================= */

type UserRow = {
  id: string;
  name: string;
  email: string;
  institution: string;
  plan: PlanType;
  joinDate: string;
  lastActivity: string;
  trainingCount: number;
};

/* ================= COMPONENT ================= */

export default function UserManagementContent() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | PlanType>('All');

  const [page, setPage] = useState(1);
  const perPage = 10;

  /* ================= LOAD ================= */

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [profiles, payments, trainings] = await Promise.all([
        fetchProfiles(),
        fetchPayments(),
        fetchTrainings(),
      ]);

      setRows(buildUserRows(profiles, payments, trainings));
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('users')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updated = payload.new as Profile;

          setRows((prev) =>
            prev.map((u) =>
              u.id === updated.id
                ? {
                    ...u,
                    name: updated.name || u.name,
                    email: updated.email || u.email,
                    institution: updated.institution || u.institution,
                  }
                : u
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    let data = [...rows];

    // plan filter
    if (planFilter !== 'All') {
      data = data.filter((r) => r.plan === planFilter);
    }

    // search filter
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.institution.toLowerCase().includes(q)
      );
    }

    return data;
  }, [rows, search, planFilter]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  /* ================= UI ================= */

  return (
    <div className="space-y-6 text-white">

      {/* HEADER + CONTROLS */}
      <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-md border border-neutral-800 rounded-xl p-4 space-y-4">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">User Management</h1>
            <p className="text-sm text-gray-400">
              {filtered.length} users
            </p>
          </div>

          <button
            onClick={load}
            className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-3">

          {/* SEARCH */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 w-full">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* FILTER PLAN */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All plans</option>
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Pro+">Pro+</option>
          </select>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-neutral-900">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Trainings</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={5} />
              ))
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-800 hover:bg-neutral-900/40 transition">

                  <td className="p-3">
                    <Link
                      href={`/user-management/${r.id}`}
                      className="hover:underline font-medium"
                    >
                      {r.name}
                    </Link>
                    <div className="text-xs text-gray-400">{r.institution}</div>
                  </td>

                  <td className="p-3 text-gray-400">{r.email}</td>

                  <td className="p-3">
                    <span className="px-2 py-1 text-xs bg-neutral-800 rounded">
                      {r.plan}
                    </span>
                  </td>

                  <td className="p-3">{r.trainingCount}</td>

                  <td className="p-3">
                    <button className="text-gray-400 hover:text-white">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">

        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="p-2 bg-neutral-900 rounded"
        >
          <ChevronLeft />
        </button>

        <span className="text-gray-400 text-sm">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="p-2 bg-neutral-900 rounded"
        >
          <ChevronRight />
        </button>

      </div>

    </div>
  );
}
