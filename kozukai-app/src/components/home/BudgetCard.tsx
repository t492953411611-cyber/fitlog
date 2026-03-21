'use client';
import { formatCurrency } from '@/lib/utils';

interface Props {
  budget: number;
  total: number;
  count: number;
  year: number;
  month: number;
}

export default function BudgetCard({ budget, total, count, year, month }: Props) {
  const remaining = budget - total;
  const rate = budget > 0 ? Math.min(100, Math.round((total / budget) * 100)) : 0;
  const isOver = remaining < 0;
  const isWarning = !isOver && rate >= 80;

  return (
    <div className="bg-slate-800 text-white rounded-2xl p-5 mx-4 mt-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-slate-400 text-sm">{year}年{month}月の小遣い</p>
          <p className="text-3xl font-bold tracking-tight mt-1">{formatCurrency(budget)}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-xs">今月の件数</p>
          <p className="text-xl font-bold">{count}件</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-slate-600 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isOver ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-slate-400 text-xs">使用額</p>
          <p className="text-lg font-semibold">{formatCurrency(total)}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-xs">{isOver ? '超過額' : '残り'}</p>
          <p className={`text-lg font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOver ? `-${formatCurrency(-remaining)}` : formatCurrency(remaining)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-xs">消化率</p>
          <p className={`text-lg font-bold ${isOver ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'}`}>
            {rate}%
          </p>
        </div>
      </div>
    </div>
  );
}
