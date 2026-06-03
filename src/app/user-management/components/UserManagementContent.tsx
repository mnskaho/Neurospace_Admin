// 'use client';
// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import {
//   Search,
//   Filter,
//   Download,
//   RefreshCw,
//   ChevronUp,
//   ChevronDown,
//   ChevronsUpDown,
//   ChevronLeft,
//   ChevronRight,
//   MoreHorizontal,
//   Trash2,
//   Ban,
//   CheckCircle,
//   Crown,
//   ArrowDownCircle,
//   Eye,
//   Users,
// } from 'lucide-react';
// import { fetchProfiles, fetchPayments, fetchTrainings, updatePaymentPlan, deleteUserProfile } from '@/lib/data';
// import { supabase } from '@/lib/supabase';
// import type { Profile, Payment, Training } from '@/lib/supabase';
// import StatusBadge from '@/components/ui/StatusBadge';
// import ConfirmModal from '@/components/ui/ConfirmModal';
// import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
// import { toast } from 'sonner';

// type SortKey = 'name' | 'email' | 'institution' | 'plan' | 'joinDate' | 'lastActivity' | 'trainings';
// type SortDir = 'asc' | 'desc';

// type UserRow = {
//   id: string;
//   name: string;
//   email: string;
//   institution: string;
//   plan: 'Free' | 'Premium';
//   joinDate: string;
//   lastActivity: string;
//   trainingCount: number;
//   banned: boolean;
// };

// function buildUserRows(
//   profiles: Profile[],
//   payments: Payment[],
//   trainings: Training[]
// ): UserRow[] {
//   const paymentMap = new Map<string, Payment>();
//   payments.forEach((p) => {
//     if (!paymentMap.has(p.user_id)) paymentMap.set(p.user_id, p);
//   });

//   const trainingCount = new Map<string, number>();
//   trainings.forEach((t) => {
//     trainingCount.set(t.user_id, (trainingCount.get(t.user_id) || 0) + 1);
//   });

//   return profiles.map((p) => {
//     const payment = paymentMap.get(p.id);
//     return {
//       id: p.id,
//       name: p.name || '—',
//       email: p.email || '—',
//       institution: p.institution || '—',
//       plan: payment?.plan || 'Free',
//       joinDate: p.created_at,
//       lastActivity: p.created_at,
//       trainingCount: trainingCount.get(p.id) || 0,
//       banned: false,
//     };
//   });
// }

// function exportToCSV(rows: UserRow[]) {
//   const headers = ['Name', 'Email', 'Institution', 'Plan', 'Join Date', 'Training Jobs'];
//   const csvRows = rows.map((r) => [
//     r.name, r.email, r.institution, r.plan,
//     new Date(r.joinDate).toLocaleDateString(),
//     r.trainingCount,
//   ]);
//   const csv = [headers, ...csvRows].map((row) => row.join(',')).join('\n');
//   const blob = new Blob([csv], { type: 'text/csv' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = `neurospace-users-${Date.now()}.csv`;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// export default function UserManagementContent() {
//   const [rows, setRows] = useState<UserRow[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [planFilter, setPlanFilter] = useState<'All' | 'Free' | 'Premium'>('All');
//   const [sortKey, setSortKey] = useState<SortKey>('joinDate');
//   const [sortDir, setSortDir] = useState<SortDir>('desc');
//   const [selected, setSelected] = useState<Set<string>>(new Set());
//   const [page, setPage] = useState(1);
//   const [perPage, setPerPage] = useState(10);
//   const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [planChanging, setPlanChanging] = useState<string | null>(null);
//   const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
//   const [bannedIds, setBannedIds] = useState<Set<string>>(new Set());

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       // Backend integration: Fetch all three tables from Supabase
//       const [profiles, payments, trainings] = await Promise.all([
//         fetchProfiles(),
//         fetchPayments(),
//         fetchTrainings(),
//       ]);
//       setRows(buildUserRows(profiles, payments, trainings));
//     } catch {
//       toast.error('Failed to load users. Check your Supabase connection.');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();

//     // Backend integration: Real-time subscription on profiles table
//     const channel = supabase
//       .channel('users-profiles')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
//         load();
//       })
//       .subscribe();

//     return () => { supabase.removeChannel(channel); };
//   }, [load]);

//   const handleSort = (key: SortKey) => {
//     if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
//     else { setSortKey(key); setSortDir('asc'); }
//   };

//   const filtered = useMemo(() => {
//     let data = rows;
//     if (planFilter !== 'All') data = data.filter((r) => r.plan === planFilter);
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       data = data.filter(
//         (r) =>
//           r.name.toLowerCase().includes(q) ||
//           r.email.toLowerCase().includes(q) ||
//           r.institution.toLowerCase().includes(q)
//       );
//     }
//     data = [...data].sort((a, b) => {
//       let av: string | number = a[sortKey as keyof UserRow] as string | number;
//       let bv: string | number = b[sortKey as keyof UserRow] as string | number;
//       if (sortKey === 'joinDate' || sortKey === 'lastActivity') {
//         av = new Date(av as string).getTime();
//         bv = new Date(bv as string).getTime();
//       }
//       if (av < bv) return sortDir === 'asc' ? -1 : 1;
//       if (av > bv) return sortDir === 'asc' ? 1 : -1;
//       return 0;
//     });
//     return data;
//   }, [rows, search, planFilter, sortKey, sortDir]);

//   const totalPages = Math.ceil(filtered.length / perPage);
//   const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

//   const toggleSelect = (id: string) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };

//   const toggleSelectAll = () => {
//     if (selected.size === pageRows.length) setSelected(new Set());
//     else setSelected(new Set(pageRows.map((r) => r.id)));
//   };

//   const handlePlanChange = async (userId: string, plan: 'Free' | 'Premium') => {
//     setPlanChanging(userId);
//     setOpenActionMenu(null);
//     try {
//       // Backend integration: Update payments.plan in Supabase
//       await updatePaymentPlan(userId, plan);
//       setRows((prev) =>
//         prev.map((r) => (r.id === userId ? { ...r, plan } : r))
//       );
//       toast.success(`Plan updated to ${plan}`);
//     } catch {
//       toast.error('Failed to update plan. Try again.');
//     } finally {
//       setPlanChanging(null);
//     }
//   };

//   const handleBanToggle = (userId: string, currentlyBanned: boolean) => {
//     setBannedIds((prev) => {
//       const next = new Set(prev);
//       currentlyBanned ? next.delete(userId) : next.add(userId);
//       return next;
//     });
//     setOpenActionMenu(null);
//     toast.success(currentlyBanned ? 'User unbanned' : 'User banned');
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleteLoading(true);
//     try {
//       // Backend integration: Delete profile from Supabase
//       await deleteUserProfile(deleteTarget.id);
//       setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
//       toast.success(`${deleteTarget.name} removed from platform`);
//     } catch {
//       toast.error('Failed to delete user. Try again.');
//     } finally {
//       setDeleteLoading(false);
//       setDeleteTarget(null);
//     }
//   };

//   const handleBulkDelete = async () => {
//     const ids = Array.from(selected);
//     try {
//       await Promise.all(ids.map((id) => deleteUserProfile(id)));
//       setRows((prev) => prev.filter((r) => !selected.has(r.id)));
//       setSelected(new Set());
//       toast.success(`${ids.length} users removed`);
//     } catch {
//       toast.error('Bulk delete failed. Try again.');
//     }
//   };

//   const SortIcon = ({ k }: { k: SortKey }) => {
//     if (sortKey !== k) return <ChevronsUpDown size={13} className="text-[hsl(var(--muted-foreground))] opacity-50" />;
//     return sortDir === 'asc'
//       ? <ChevronUp size={13} className="text-[hsl(var(--primary))]" />
//       : <ChevronDown size={13} className="text-[hsl(var(--primary))]" />;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-[22px] font-semibold text-[hsl(var(--foreground))] mb-1">User Management</h1>
//           <p className="text-[13px] text-[hsl(var(--muted-foreground))]">
//             {filtered.length} users from profiles + payments
//           </p>
//         </div>
//         <div className="flex items-center gap-2.5">
//           <button
//             onClick={load}
//             disabled={loading}
//             className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[hsl(240_4%_14%)] hover:bg-[hsl(240_4%_18%)] text-[13px] font-medium text-[hsl(var(--foreground))] transition-all duration-150 active:scale-95 disabled:opacity-50"
//           >
//             <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
//             Refresh
//           </button>
//           <button
//             onClick={() => exportToCSV(filtered)}
//             className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[hsl(var(--primary)/0.1)] hover:bg-[hsl(var(--primary)/0.15)] text-[13px] font-medium text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)] transition-all duration-150 active:scale-95"
//           >
//             <Download size={14} />
//             Export CSV
//           </button>
//         </div>
//       </div>

//       {/* Filters bar */}
//       <div className="flex flex-wrap items-center gap-3">
//         <div className="relative flex-1 min-w-[220px] max-w-xs">
//           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
//           <input
//             type="text"
//             placeholder="Search by name, email, institution…"
//             value={search}
//             onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             className="w-full bg-[hsl(240_4%_10%)] border border-[hsl(var(--border))] rounded-lg pl-9 pr-4 py-2 text-[13px] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
//           />
//         </div>

//         <div className="flex items-center gap-1.5">
//           <Filter size={13} className="text-[hsl(var(--muted-foreground))]" />
//           {(['All', 'Free', 'Premium'] as const).map((f) => (
//             <button
//               key={`filter-${f}`}
//               onClick={() => { setPlanFilter(f); setPage(1); }}
//               className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
//                 planFilter === f
//                   ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.25)]'
//                   : 'bg-[hsl(240_4%_10%)] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]'
//               }`}
//             >
//               {f}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
//         <div className="overflow-x-auto scrollbar-thin">
//           <table className="w-full min-w-[900px]">
//             <thead>
//               <tr className="border-b border-[hsl(var(--border))] bg-[hsl(240_10%_5%)]">
//                 <th className="w-10 px-4 py-3.5">
//                   <input
//                     type="checkbox"
//                     checked={selected.size === pageRows.length && pageRows.length > 0}
//                     onChange={toggleSelectAll}
//                     className="w-3.5 h-3.5 rounded border-[hsl(var(--border))] bg-[hsl(240_4%_10%)] accent-[hsl(var(--primary))]"
//                   />
//                 </th>
//                 {(
//                   [
//                     { key: 'name', label: 'Name' },
//                     { key: 'email', label: 'Email' },
//                     { key: 'institution', label: 'Institution' },
//                     { key: 'plan', label: 'Plan' },
//                     { key: 'joinDate', label: 'Joined' },
//                     { key: 'lastActivity', label: 'Last Activity' },
//                     { key: 'trainings', label: 'Training Jobs' },
//                   ] as { key: SortKey; label: string }[]
//                 ).map((col) => (
//                   <th
//                     key={`th-${col.key}`}
//                     onClick={() => handleSort(col.key)}
//                     className="px-4 py-3.5 text-left cursor-pointer select-none"
//                   >
//                     <div className="flex items-center gap-1.5">
//                       <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
//                         {col.label}
//                       </span>
//                       <SortIcon k={col.key} />
//                     </div>
//                   </th>
//                 ))}
//                 <th className="px-4 py-3.5 text-right">
//                   <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
//                     Actions
//                   </span>
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading
//                 ? Array.from({ length: 8 }).map((_, i) => (
//                     <TableRowSkeleton key={`row-skeleton-${i}`} cols={9} />
//                   ))
//                 : pageRows.length === 0
//                 ? (
//                   <tr>
//                     <td colSpan={9} className="py-20">
//                       <div className="flex flex-col items-center gap-3 text-center">
//                         <Users size={36} className="text-[hsl(var(--muted-foreground))]" />
//                         <p className="text-[14px] font-semibold text-[hsl(var(--foreground))]">
//                           No users match your filters
//                         </p>
//                         <p className="text-[12.5px] text-[hsl(var(--muted-foreground))]">
//                           Try adjusting your search or plan filter
//                         </p>
//                         <button
//                           onClick={() => { setSearch(''); setPlanFilter('All'); }}
//                           className="mt-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[12.5px] font-medium border border-[hsl(var(--primary)/0.2)] hover:bg-[hsl(var(--primary)/0.15)] transition-colors"
//                         >
//                           Clear Filters
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )
//                 : pageRows.map((row) => {
//                   const isBanned = bannedIds.has(row.id);
//                   const isSelected = selected.has(row.id);
//                   const isChangingPlan = planChanging === row.id;
//                   const menuOpen = openActionMenu === row.id;

//                   return (
//                     <tr
//                       key={`row-${row.id}`}
//                       className={`border-b border-[hsl(var(--border))] transition-colors duration-100 group ${
//                         isSelected
//                           ? 'bg-[hsl(190_95%_70%/0.05)]'
//                           : 'hover:bg-[hsl(240_4%_8%)]'
//                       } ${isBanned ? 'opacity-50' : ''}`}
//                     >
//                       <td className="px-4 py-3.5">
//                         <input
//                           type="checkbox"
//                           checked={isSelected}
//                           onChange={() => toggleSelect(row.id)}
//                           className="w-3.5 h-3.5 rounded border-[hsl(var(--border))] bg-[hsl(240_4%_10%)] accent-[hsl(var(--primary))]"
//                         />
//                       </td>

//                       {/* Name */}
//                       <td className="px-4 py-3.5">
//                         <div className="flex items-center gap-2.5">
//                           <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--primary)/0.6)] to-[hsl(var(--accent)/0.6)] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
//                             {row.name !== '—' ? row.name[0].toUpperCase() : '?'}
//                           </div>
//                           <span className="text-[13.5px] font-medium text-[hsl(var(--foreground))] truncate max-w-[120px]">
//                             {row.name}
//                           </span>
//                         </div>
//                       </td>

//                       {/* Email */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-[12.5px] text-[hsl(var(--muted-foreground))] font-mono truncate max-w-[160px] block">
//                           {row.email}
//                         </span>
//                       </td>

//                       {/* Institution */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-[13px] text-[hsl(var(--foreground))] truncate max-w-[120px] block">
//                           {row.institution}
//                         </span>
//                       </td>

//                       {/* Plan */}
//                       <td className="px-4 py-3.5">
//                         {isChangingPlan ? (
//                           <div className="flex items-center gap-1.5">
//                             <svg className="animate-spin w-3 h-3 text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none">
//                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
//                             </svg>
//                             <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Updating…</span>
//                           </div>
//                         ) : (
//                           <StatusBadge variant={row.plan === 'Premium' ? 'premium' : 'free'} />
//                         )}
//                       </td>

//                       {/* Join Date */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-[12.5px] text-[hsl(var(--muted-foreground))] font-mono">
//                           {new Date(row.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                         </span>
//                       </td>

//                       {/* Last Activity */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-[12.5px] text-[hsl(var(--muted-foreground))] font-mono">
//                           {new Date(row.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                         </span>
//                       </td>

//                       {/* Training count */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-[13px] font-semibold tabular-nums text-[hsl(var(--foreground))]">
//                           {row.trainingCount}
//                         </span>
//                       </td>

//                       {/* Actions */}
//                       <td className="px-4 py-3.5 text-right">
//                         <div className="relative inline-block">
//                           <button
//                             onClick={() => setOpenActionMenu(menuOpen ? null : row.id)}
//                             className="flex items-center justify-center w-7 h-7 rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(240_4%_14%)] hover:text-[hsl(var(--foreground))] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
//                             aria-label="User actions"
//                           >
//                             <MoreHorizontal size={15} />
//                           </button>

//                           {menuOpen && (
//                             <div className="absolute right-0 top-8 z-20 w-52 bg-[hsl(240_10%_7%)] border border-[hsl(var(--border))] rounded-xl shadow-2xl py-1.5 animate-fade-in">
//                               <button
//                                 onClick={() => { toast.info(`Viewing ${row.name}`); setOpenActionMenu(null); }}
//                                 className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-[hsl(var(--foreground))] hover:bg-[hsl(240_4%_12%)] transition-colors"
//                               >
//                                 <Eye size={13} className="text-[hsl(var(--muted-foreground))]" />
//                                 View Profile
//                               </button>

//                               {row.plan === 'Free' ? (
//                                 <button
//                                   onClick={() => handlePlanChange(row.id, 'Premium')}
//                                   className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-[hsl(263_70%_80%)] hover:bg-[hsl(240_4%_12%)] transition-colors"
//                                 >
//                                   <Crown size={13} />
//                                   Upgrade to Premium
//                                 </button>
//                               ) : (
//                                 <button
//                                   onClick={() => handlePlanChange(row.id, 'Free')}
//                                   className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-[hsl(38_92%_65%)] hover:bg-[hsl(240_4%_12%)] transition-colors"
//                                 >
//                                   <ArrowDownCircle size={13} />
//                                   Downgrade to Free
//                                 </button>
//                               )}

//                               <button
//                                 onClick={() => handleBanToggle(row.id, isBanned)}
//                                 className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] hover:bg-[hsl(240_4%_12%)] transition-colors text-[hsl(38_92%_65%)]"
//                               >
//                                 {isBanned ? (
//                                   <><CheckCircle size={13} />Unban User</>
//                                 ) : (
//                                   <><Ban size={13} />Ban User</>
//                                 )}
//                               </button>

//                               <div className="my-1 border-t border-[hsl(var(--border))]" />

//                               <button
//                                 onClick={() => { setDeleteTarget(row); setOpenActionMenu(null); }}
//                                 className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] text-[hsl(var(--destructive))] hover:bg-[hsl(0_72%_51%/0.08)] transition-colors"
//                               >
//                                 <Trash2 size={13} />
//                                 Delete User
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {!loading && filtered.length > 0 && (
//           <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-[hsl(var(--border))] bg-[hsl(240_10%_5%)]">
//             <div className="flex items-center gap-2">
//               <span className="text-[12px] text-[hsl(var(--muted-foreground))]">Rows per page:</span>
//               <select
//                 value={perPage}
//                 onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
//                 className="bg-[hsl(240_4%_10%)] border border-[hsl(var(--border))] rounded-md px-2 py-1 text-[12px] text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
//               >
//                 {[10, 25, 50].map((n) => (
//                   <option key={`per-page-${n}`} value={n}>{n}</option>
//                 ))}
//               </select>
//               <span className="text-[12px] text-[hsl(var(--muted-foreground))]">
//                 {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
//               </span>
//             </div>

//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className="w-7 h-7 flex items-center justify-center rounded-lg bg-[hsl(240_4%_10%)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] disabled:opacity-40 transition-colors"
//               >
//                 <ChevronLeft size={14} />
//               </button>

//               {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
//                 const pageNum = i + 1;
//                 return (
//                   <button
//                     key={`page-${pageNum}`}
//                     onClick={() => setPage(pageNum)}
//                     className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium transition-colors ${
//                       page === pageNum
//                         ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.25)]'
//                         : 'bg-[hsl(240_4%_10%)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
//                     }`}
//                   >
//                     {pageNum}
//                   </button>
//                 );
//               })}

//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages || totalPages === 0}
//                 className="w-7 h-7 flex items-center justify-center rounded-lg bg-[hsl(240_4%_10%)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] disabled:opacity-40 transition-colors"
//               >
//                 <ChevronRight size={14} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Bulk action bar */}
//       <div
//         className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-250 ${
//           selected.size > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
//         }`}
//       >
//         <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[hsl(240_10%_7%)] border border-[hsl(var(--border))] shadow-2xl">
//           <span className="text-[13px] font-medium text-[hsl(var(--foreground))]">
//             {selected.size} selected
//           </span>
//           <div className="w-px h-4 bg-[hsl(var(--border))]" />
//           <button
//             onClick={handleBulkDelete}
//             className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))] text-[12.5px] font-medium border border-[hsl(var(--destructive)/0.25)] hover:bg-[hsl(var(--destructive)/0.25)] transition-colors active:scale-95"
//           >
//             <Trash2 size={13} />
//             Delete Selected
//           </button>
//           <button
//             onClick={() => setSelected(new Set())}
//             className="px-3.5 py-1.5 rounded-lg bg-[hsl(240_4%_14%)] text-[hsl(var(--muted-foreground))] text-[12.5px] font-medium hover:bg-[hsl(240_4%_18%)] transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>

//       {/* Delete confirm modal */}
//       <ConfirmModal
//         open={deleteTarget !== null}
//         title="Delete User"
//         description={`This will permanently remove ${deleteTarget?.name ?? 'this user'} and all associated profile data from NeuroSpace. This action cannot be undone.`}
//         confirmLabel="Delete User"
//         destructive
//         loading={deleteLoading}
//         onConfirm={handleDelete}
//         onCancel={() => setDeleteTarget(null)}
//       />

//       {/* Close action menu on outside click */}
//       {openActionMenu && (
//         <div
//           className="fixed inset-0 z-10"
//           onClick={() => setOpenActionMenu(null)}
//         />
//       )}
//     </div>
//   );
// }

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
import type { Profile } from '@/lib/types';
import { buildUserRows } from '@/lib/mappers/user.mapper';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';

/* ================= TYPES ================= */

type PlanType = 'Free' | 'Pro' | 'Entreprise';

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
            <option value="Entreprise">Entreprise</option>
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
