'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, PenLine, LogOut } from 'lucide-react';
import BudgetCard from '@/components/home/BudgetCard';
import RecentExpenses from '@/components/home/RecentExpenses';
import InsightCard from '@/components/home/InsightCard';
import type { Expense, Category } from '@/lib/types';
import { generateInsights } from '@/lib/insights';
import { currentYM } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { year, month } = currentYM();

  const [budget, setBudget] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/budget').then((r) => r.json()),
      fetch(`/api/expenses?year=${year}&month=${month}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([b, e, c]) => {
      setBudget(b.budget);
      setExpenses(e);
      setCategories(c);
      setLoading(false);
    });
  }, [year, month]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const insights = generateInsights(expenses, budget);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-10 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-white text-xl font-bold">小遣いメモ</h1>
            <p className="text-slate-400 text-sm mt-0.5">{year}年{month}月</p>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth', { method: 'DELETE' });
              router.push('/login');
            }}
            className="text-slate-400 p-1 hover:text-slate-200 transition-colors"
            title="ログアウト"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Budget card */}
      <div className="-mt-4">
        <BudgetCard
          budget={budget}
          total={total}
          count={expenses.length}
          year={year}
          month={month}
        />
      </div>

      {/* Insight */}
      <InsightCard insights={insights} />

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
        <button
          onClick={() => router.push('/add?mode=manual')}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-2xl py-4 font-semibold text-slate-800 shadow-sm active:bg-slate-50 transition-colors"
        >
          <PenLine size={20} />
          手入力で追加
        </button>
        <button
          onClick={() => router.push('/add?mode=image')}
          className="flex items-center justify-center gap-2 bg-slate-800 text-white rounded-2xl py-4 font-semibold shadow-sm active:opacity-80 transition-opacity"
        >
          <Camera size={20} />
          写真から追加
        </button>
      </div>

      {/* Recent expenses */}
      <RecentExpenses expenses={expenses} categories={categories} />

      {/* Seed button (visible only when empty) */}
      {expenses.length === 0 && (
        <div className="mx-4 mt-6 text-center">
          <p className="text-slate-400 text-sm mb-3">ダミーデータで動作確認できます</p>
          <button
            className="text-sm text-slate-500 border border-slate-200 rounded-xl px-4 py-2"
            onClick={async () => {
              await fetch('/api/seed', { method: 'POST' });
              window.location.reload();
            }}
          >
            ダミーデータを追加
          </button>
        </div>
      )}
    </div>
  );
}
