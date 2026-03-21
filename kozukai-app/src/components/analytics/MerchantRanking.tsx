'use client';
import type { MerchantRank } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: MerchantRank[];
  maxAmount: number;
}

export default function MerchantRanking({ data, maxAmount }: Props) {
  if (data.length === 0) {
    return <p className="text-center text-slate-400 py-6 text-sm">データがありません</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={d.merchant} className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 w-4 text-center">{i + 1}</span>
          <div className="flex-1">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-slate-700 truncate max-w-[60%]">{d.merchant}</span>
              <span className="text-xs text-slate-400">{d.count}回</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full"
                  style={{ width: `${maxAmount > 0 ? (d.total / maxAmount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 w-20 text-right">
                {formatCurrency(d.total)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
