import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[hsl(240_4%_14%)] ${className}`}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 7 }: { cols?: number }) {
  return (
    <tr className="border-b border-[hsl(var(--border))]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={`skeleton-col-${i}`} className="px-4 py-3.5">
          <Skeleton className="h-3.5 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-lg bg-[hsl(240_4%_14%)] w-full"
      style={{ height }}
    />
  );
}