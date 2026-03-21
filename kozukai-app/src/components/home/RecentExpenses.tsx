'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Expense, Category } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';

interface Props {
  expenses: Expense[];
  categories: Category[];
}

export default function RecentExpenses({ expenses, categories }: Props) {
  const catColorMap = Object.fromEntries(categories.map((c) => [c.name, c.color]));

  return (
    <div className="card mx-4 mt-4 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
        <p className="font-semibold text-slate-800">最近の支出</p>
        <Link href="/expenses" className="text-sm text-slate-500 flex items-center gap-0.5">
          すべて見る <ChevronRight size={15} />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">支出がまだありません</p>
      ) : (
        <ul>
          {expenses.slice(0, 5).map((e, i) => (
            <li
              key={e.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                i < expenses.slice(0, 5).length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              {/* Category color dot */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: catColorMap[e.category] ?? '#9ca3af' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {e.merchant || e.category}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(e.date)} · {e.category} · {PAYMENT_METHOD_LABELS[e.paymentMethod]}
                </p>
              </div>
              <p className="font-semibold text-slate-800 flex-shrink-0">
                {formatCurrency(e.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
