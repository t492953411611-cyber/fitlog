'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CategorySummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: CategorySummary[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: CategorySummary }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md p-3 text-sm">
      <p className="font-semibold text-slate-800">{d.category}</p>
      <p className="text-slate-600">{formatCurrency(d.total)}</p>
      <p className="text-slate-400">{d.count}件 · {d.percentage}%</p>
    </div>
  );
}

export default function CategoryChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-center text-slate-400 py-8 text-sm">データがありません</p>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={data.length * 44 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 60, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            width={90}
            tick={{ fontSize: 13, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={22}>
            {data.map((entry) => (
              <Cell key={entry.category} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Detail table */}
      <div className="mt-3 flex flex-col gap-1">
        {data.map((d) => (
          <div key={d.category} className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="flex-1 text-slate-700">{d.category}</span>
            <span className="font-semibold text-slate-800">{formatCurrency(d.total)}</span>
            <span className="text-slate-400 w-12 text-right">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
