'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PlanDistributionChartProps {
  data: { plan: string; count: number }[];
}

const COLORS = ['hsl(240 5% 40%)', 'hsl(263 70% 74%)'];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[hsl(240_10%_7%)] border border-[hsl(var(--border))] rounded-lg px-3.5 py-2.5 shadow-xl">
      <p className="text-[12px] font-semibold text-[hsl(var(--foreground))]">{payload[0].name}</p>
      <p className="text-[14px] font-bold tabular-nums" style={{ color: payload[0].name === 'Premium' ? 'hsl(263 70% 74%)' : 'hsl(240 5% 70%)' }}>
        {payload[0].value} users
      </p>
    </div>
  );
}

export default function PlanDistributionChart({ data }: PlanDistributionChartProps) {
  if (!data.length || data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-[240px] text-[13px] text-[hsl(var(--muted-foreground))]">
        No subscription data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={90}
          dataKey="count"
          nameKey="plan"
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.plan}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: 'hsl(240 5% 65%)', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}