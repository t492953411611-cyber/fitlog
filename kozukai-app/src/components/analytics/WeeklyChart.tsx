'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeeklyData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: WeeklyData[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: WeeklyData }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md p-3 text-sm">
      <p className="text-slate-500 text-xs">{d.label}</p>
      <p className="font-semibold text-slate-800">{formatCurrency(d.amount)}</p>
      <p className="text-slate-400">{d.count}件</p>
    </div>
  );
}

export default function WeeklyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="amount" fill="#334155" radius={[6, 6, 0, 0]} barSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
