'use client';

import React from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type TrainingPoint = {
  month: string;
  jobs: number;
};

type TrainingsAreaChartProps = {
  data: TrainingPoint[];
};

function formatMonth(month: string) {
  const [year, value] = month.split('-').map(Number);
  if (!year || !value) return month;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
  }).format(new Date(year, value - 1, 1));
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const jobs = payload[0].value;

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-950/95 px-3.5 py-2.5 shadow-xl backdrop-blur">
      <p className="mb-1 text-[11px] font-medium text-gray-400">
        {label ? formatMonth(label) : 'Training'}
      </p>
      <p className="text-[15px] font-bold tabular-nums text-blue-300">
        {jobs.toLocaleString()} {jobs === 1 ? 'job' : 'jobs'}
      </p>
    </div>
  );
}

export default function TrainingsAreaChart({ data }: TrainingsAreaChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-neutral-800 bg-neutral-950/40 text-[13px] text-gray-500">
        No training activity available yet
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 14, right: 10, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="trainingArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(199 89% 58%)" stopOpacity={0.34} />
              <stop offset="55%" stopColor="hsl(199 89% 58%)" stopOpacity={0.12} />
              <stop offset="100%" stopColor="hsl(199 89% 58%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="hsl(240 4% 18%)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(240 5% 64%)', fontSize: 11 }}
            tickFormatter={formatMonth}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(240 5% 64%)', fontSize: 11 }}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(199 89% 58% / 0.08)' }} />
          <Bar dataKey="jobs" barSize={18} radius={[5, 5, 0, 0]} fill="hsl(199 89% 58% / 0.22)" />
          <Area
            type="monotone"
            dataKey="jobs"
            fill="url(#trainingArea)"
            stroke="hsl(199 89% 68%)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'hsl(199 89% 68%)', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'hsl(199 89% 72%)', stroke: 'hsl(222 47% 11%)', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
