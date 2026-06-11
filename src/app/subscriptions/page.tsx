'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, History, Pencil, Power, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/components/AppLayout';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';

type SubscriptionRow = {
  user?: string | null;
  email?: string | null;
  plan?: 'Free' | 'Pro' | 'Pro+' | string | null;
  price?: number | null;
  trainingsLimit?: number | null;
  trainingsUsed?: number | null;
  status?: 'active' | 'pending' | 'failed' | 'canceled' | string | null;
  paymentMethod?: string | null;
  invoiceNumber?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

const statusStyles: Record<string, string> = {
  active: 'bg-[hsl(142_71%_45%/0.12)] text-[hsl(142_71%_55%)] border-[hsl(142_71%_45%/0.3)]',
  pending: 'bg-[hsl(38_92%_50%/0.12)] text-[hsl(38_92%_65%)] border-[hsl(38_92%_50%/0.3)]',
  failed: 'bg-[hsl(0_72%_51%/0.12)] text-[hsl(0_72%_65%)] border-[hsl(0_72%_51%/0.3)]',
  canceled: 'bg-[hsl(240_4%_16%)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
};

function display(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

function formatPrice(value?: number | null) {
  return `${Number(value || 0).toLocaleString()}\u20ac`;
}

function normalizedStatus(status?: string | null) {
  const value = status || 'pending';
  return ['active', 'pending', 'failed', 'canceled'].includes(value) ? value : 'pending';
}

export default function SubscriptionsPage() {
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SubscriptionRow | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscriptions', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || 'Failed to load subscriptions');

      setRows(payload.subscriptions || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) =>
      [row.user, row.email, row.plan, row.status, row.paymentMethod, row.invoiceNumber]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  return (
    <AppLayout>
      <div className="space-y-6 text-white">
        <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-md border border-neutral-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-[hsl(var(--primary))]" />
                <h1 className="text-xl font-semibold">Subscriptions</h1>
              </div>
              <p className="text-sm text-gray-400">{filtered.length} subscriptions</p>
            </div>

            <button
              onClick={load}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition"
              aria-label="Refresh subscriptions"
              title="Refresh subscriptions"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 w-full">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users, plans, invoices..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[1380px] text-sm">
            <thead className="bg-neutral-900 text-left text-gray-300">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Price</th>
                <th className="p-3">Trainings Limit</th>
                <th className="p-3">Trainings Used</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Invoice Number</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRowSkeleton key={index} cols={11} />
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-gray-400">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filtered.map((row, index) => {
                  const status = normalizedStatus(row.status);

                  return (
                  <tr key={`${row.email || row.user || 'subscription'}-${index}`} className="border-t border-neutral-800 hover:bg-neutral-900/40 transition">
                    <td className="p-3 font-medium">
                      {display(row.user)}
                      <div className="text-xs text-gray-500">{display(row.email)}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs bg-neutral-800 rounded border border-neutral-700">
                        {display(row.plan)}
                      </span>
                    </td>
                    <td className="p-3 tabular-nums">{formatPrice(row.price)}</td>
                    <td className="p-3 tabular-nums">{display(row.trainingsLimit)}</td>
                    <td className="p-3 tabular-nums">
                      {display(row.trainingsUsed)} / {display(row.trainingsLimit)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold capitalize ${statusStyles[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400">{display(row.paymentMethod)}</td>
                    <td className="p-3 text-gray-400">{display(row.invoiceNumber)}</td>
                    <td className="p-3 text-gray-400 whitespace-nowrap">{formatDate(row.startDate)}</td>
                    <td className="p-3 text-gray-400 whitespace-nowrap">{formatDate(row.endDate)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(row)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-neutral-800 transition"
                          title="View payment history"
                        >
                          <History size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-neutral-800 transition"
                          title="Change plan"
                          type="button"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-neutral-800 transition"
                          title={status === 'canceled' ? 'Reactivate subscription' : 'Disable subscription'}
                          type="button"
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Payment History</h2>
                  <p className="text-sm text-gray-400">{display(selected.user)}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sm hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>
              <pre className="max-h-[60vh] overflow-auto rounded-lg bg-black/40 border border-neutral-800 p-4 text-xs text-gray-300">
                {JSON.stringify(selected, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
