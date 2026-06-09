'use client';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[hsl(240_10%_7%)] border border-[hsl(var(--border))] rounded-lg px-3.5 py-2.5 shadow-xl">
      <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] mb-1">{label}</p>
      <p className="text-[15px] font-bold text-[hsl(var(--primary))] tabular-nums">
        {payload[0].value.toLocaleString()}€
      </p>
    </div>
  );
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[240px] text-[13px] text-[hsl(var(--muted-foreground))]">
        No payment data available yet
      </div>
    );
  }

  const avg = data.reduce((s, d) => s + d.revenue, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(190 95% 70%)" />
            <stop offset="100%" stopColor="hsl(263 70% 74%)" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 14%)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: 'hsl(240 5% 55%)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'hsl(240 5% 55%)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}€`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={avg} stroke="hsl(240 5% 35%)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="url(#revenueGrad)"
          strokeWidth={2.5}
          dot={{ fill: 'hsl(190 95% 70%)', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: 'hsl(190 95% 70%)', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
