'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Database, ExternalLink, FileJson, FileText, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import type { DatasetRow } from '@/lib/admin-training-jobs';

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

export default function DatasetsPage() {
  const [rows, setRows] = useState<DatasetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DatasetRow | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/datasets', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load datasets');
      }

      setRows(payload.datasets || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load datasets');
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
      [row.datasetName, row.user, row.status, row.targetColumn]
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
                <Database size={20} className="text-[hsl(var(--primary))]" />
                <h1 className="text-xl font-semibold">Datasets</h1>
              </div>
              <p className="text-sm text-gray-400">{filtered.length} training jobs</p>
            </div>

            <button
              onClick={load}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition"
              aria-label="Refresh datasets"
              title="Refresh datasets"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 w-full">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search datasets, users, status..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead className="bg-neutral-900 text-left text-gray-300">
              <tr>
                <th className="p-3">Dataset Name</th>
                <th className="p-3">User</th>
                <th className="p-3">Samples</th>
                <th className="p-3">Features</th>
                <th className="p-3">Classes</th>
                <th className="p-3">Target Column</th>
                <th className="p-3">Status</th>
                <th className="p-3">Uploaded At</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRowSkeleton key={index} cols={9} />
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    No datasets found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-neutral-800 hover:bg-neutral-900/40 transition">
                    <td className="p-3 font-medium">{row.datasetName}</td>
                    <td className="p-3 text-gray-400">{row.user}</td>
                    <td className="p-3 tabular-nums">{row.samples}</td>
                    <td className="p-3 tabular-nums">{row.features}</td>
                    <td className="p-3 tabular-nums">{row.classes}</td>
                    <td className="p-3 text-gray-300">{row.targetColumn}</td>
                    <td className="p-3">
                      <StatusBadge variant={statusVariant(row.status)} />
                    </td>
                    <td className="p-3 text-gray-400 whitespace-nowrap">{formatDate(row.uploadedAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(row)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-xs hover:bg-neutral-800 transition"
                        >
                          <ExternalLink size={13} />
                          View details
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
                        {row.jsonPath && (
                          <a
                            href={fileHref(row.jsonPath)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-neutral-800 transition"
                            title="Open JSON"
                          >
                            <FileJson size={15} />
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
                  <h2 className="text-lg font-semibold">{selected.datasetName}</h2>
                  <p className="text-sm text-gray-400">{selected.user}</p>
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
