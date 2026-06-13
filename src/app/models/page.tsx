'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BrainCircuit, ExternalLink, FileText, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import type { ModelRow } from '@/lib/admin-training-jobs';

type StatusVariant = 'running' | 'completed' | 'failed' | 'queued';

function statusVariant(status: string): StatusVariant {
  const normalized = status.toLowerCase();
  if (normalized.includes('complete') || normalized.includes('success')) return 'completed';
  if (normalized.includes('fail') || normalized.includes('error')) return 'failed';
  if (normalized.includes('process') || normalized.includes('running') || normalized.includes('train')) return 'running';
  return 'queued';
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function fileHref(path: string) {
  return `/api/admin/storage-file?path=${encodeURIComponent(path)}`;
}

export default function ModelsPage() {
  const [rows, setRows] = useState<ModelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ModelRow | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/models', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load models');
      }

      setRows(payload.models || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load models');
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
      [row.model, row.backend, row.dataset, row.user, row.status]
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
                <BrainCircuit size={20} className="text-[hsl(var(--primary))]" />
                <h1 className="text-xl font-semibold">Models</h1>
              </div>
              <p className="text-sm text-gray-400">{filtered.length} model rows</p>
            </div>

            <button
              onClick={load}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition"
              aria-label="Refresh models"
              title="Refresh models"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 w-full">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search models, datasets, users..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[1320px] text-sm">
            <thead className="bg-neutral-900 text-left text-gray-300">
              <tr>
                <th className="p-3">Model</th>
                <th className="p-3">Backend</th>
                <th className="p-3">Dataset</th>
                <th className="p-3">User</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Precision</th>
                <th className="p-3">Recall</th>
                <th className="p-3">F1 Score</th>
                <th className="p-3">Training Time</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRowSkeleton key={index} cols={12} />
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-gray-400">
                    No models found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-neutral-800 hover:bg-neutral-900/40 transition">
                    <td className="p-3 font-medium">{row.model}</td>
                    <td className="p-3 text-gray-400">{row.backend}</td>
                    <td className="p-3 text-gray-300">{row.dataset}</td>
                    <td className="p-3 text-gray-400">{row.user}</td>
                    <td className="p-3 tabular-nums">{row.accuracy}</td>
                    <td className="p-3 tabular-nums">{row.precision}</td>
                    <td className="p-3 tabular-nums">{row.recall}</td>
                    <td className="p-3 tabular-nums">{row.f1Score}</td>
                    <td className="p-3 whitespace-nowrap">{row.trainingTime}</td>
                    <td className="p-3">
                      <StatusBadge variant={statusVariant(row.status)} />
                    </td>
                    <td className="p-3 text-gray-400 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(row)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-xs hover:bg-neutral-800 transition"
                        >
                          <ExternalLink size={13} />
                          View results
                        </button>
                        {row.pdfPath && (
                          <a
                            href={fileHref(row.pdfPath)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-neutral-800 transition"
                            title="Open PDF"
                          >
                            <FileText size={15} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{selected.model}</h2>
                  <p className="text-sm text-gray-400">{selected.dataset}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sm hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>
              <pre className="max-h-[60vh] overflow-auto rounded-lg bg-black/40 border border-neutral-800 p-4 text-xs text-gray-300">
                {JSON.stringify(selected.raw, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
