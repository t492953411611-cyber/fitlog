'use client';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import ExpenseList from '@/components/expenses/ExpenseList';
import type { Expense, Category } from '@/lib/types';
import { formatCurrency, formatMonth } from '@/lib/utils';

type SortKey = 'date' | 'amount_desc' | 'amount_asc';

export default function ExpensesPage() {
  const now = new Date();
  const [year, setYear]       = useState(now.getFullYear());
  const [month, setMonth]     = useState(now.getMonth() + 1);
  const [filterCat, setFilterCat] = useState('');
  const [sort, setSort]       = useState<SortKey>('date');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (filterCat) params.set('category', filterCat);
    const [e, c] = await Promise.all([
      fetch(`/api/expenses?${params}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]);
    setExpenses(e);
    setCategories(c);
    setLoading(false);
  }, [year, month, filterCat]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchExpenses();
  }

  async function handleUpdate(id: string, data: Partial<Expense>) {
    await fetch(`/api/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    fetchExpenses();
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sort === 'amount_desc') return b.amount - a.amount;
    if (sort === 'amount_asc') return a.amount - b.amount;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-10 pb-5">
        <h1 className="text-white text-xl font-bold">支出履歴</h1>
        {/* Month navigator */}
        <div className="flex items-center justify-between mt-3">
          <button onClick={prevMonth} className="text-slate-300 p-1 active:text-white">
            <ChevronLeft size={22} />
          </button>
          <p className="text-white font-semibold">{formatMonth(year, month)}</p>
          <button onClick={nextMonth} className="text-slate-300 p-1 active:text-white">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4 pb-4">
        {/* Summary */}
        <div className="card p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500">{formatMonth(year, month)}の合計</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(total)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">件数</p>
            <p className="text-2xl font-bold text-slate-800">{expenses.length}件</p>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFilterCat('')}
            className={`flex-shrink-0 py-1.5 px-4 rounded-full text-sm font-medium border transition-colors ${
              !filterCat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(filterCat === cat.name ? '' : cat.name)}
              className={`flex-shrink-0 py-1.5 px-4 rounded-full text-sm font-medium border transition-colors ${
                filterCat === cat.name ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600'
              }`}
              style={filterCat === cat.name ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-slate-400" />
          {([
            ['date', '新しい順'],
            ['amount_desc', '金額が多い順'],
            ['amount_asc', '金額が少ない順'],
          ] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`py-1 px-3 rounded-full text-xs font-medium border transition-colors ${
                sort === key ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          </div>
        ) : (
          <ExpenseList
            expenses={sortedExpenses}
            categories={categories}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}
