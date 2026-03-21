'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import CategoryChart from '@/components/analytics/CategoryChart';
import MerchantRanking from '@/components/analytics/MerchantRanking';
import WeeklyChart from '@/components/analytics/WeeklyChart';
import type { Expense, Category } from '@/lib/types';
import { getCategorySummaries, getMerchantRanking, getWeeklyData, formatMonth, formatCurrency } from '@/lib/utils';
import { generateInsights } from '@/lib/insights';

export default function AnalyticsPage() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/expenses?year=${year}&month=${month}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/budget').then((r) => r.json()),
    ]).then(([e, c, b]) => {
      setExpenses(e);
      setCategories(c);
      setBudget(b.budget);
      setLoading(false);
    });
  }, [year, month]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  const catColorMap = Object.fromEntries(categories.map((c) => [c.name, c.color]));
  const categorySummaries = getCategorySummaries(expenses, catColorMap);
  const merchantRanking   = getMerchantRanking(expenses, 8);
  const weeklyData        = getWeeklyData(expenses);
  const insights          = generateInsights(expenses, budget);
  const total             = expenses.reduce((s, e) => s + e.amount, 0);
  const maxMerchant       = merchantRanking[0]?.total ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-10 pb-5">
        <h1 className="text-white text-xl font-bold">分析</h1>
        <div className="flex items-center justify-between mt-3">
          <button onClick={prevMonth} className="text-slate-300 p-1"><ChevronLeft size={22} /></button>
          <p className="text-white font-semibold">{formatMonth(year, month)}</p>
          <button onClick={nextMonth} className="text-slate-300 p-1"><ChevronRight size={22} /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-4 pt-4 flex flex-col gap-4 pb-4">

          {/* Monthly total */}
          <div className="card p-4 flex justify-between">
            <div>
              <p className="text-xs text-slate-500">合計支出</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(total)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">件数</p>
              <p className="text-2xl font-bold text-slate-800">{expenses.length}件</p>
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="card p-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full p-1.5 flex-shrink-0 mt-0.5">
                  <Lightbulb size={16} className="text-amber-600" />
                </div>
                <div className="flex flex-col gap-1.5">
                  {insights.map((t, i) => (
                    <p key={i} className="text-sm text-slate-700">{t}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category breakdown */}
          <div className="card p-4">
            <p className="font-semibold text-slate-800 mb-4">カテゴリ別支出</p>
            <CategoryChart data={categorySummaries} />
          </div>

          {/* Weekly trend */}
          <div className="card p-4">
            <p className="font-semibold text-slate-800 mb-2">週別推移（直近4週）</p>
            <WeeklyChart data={weeklyData} />
          </div>

          {/* Merchant ranking */}
          <div className="card p-4">
            <p className="font-semibold text-slate-800 mb-4">店別ランキング</p>
            <MerchantRanking data={merchantRanking} maxAmount={maxMerchant} />
          </div>

          {/* Small amount stats */}
          <div className="card p-4">
            <p className="font-semibold text-slate-800 mb-3">少額支出の集計</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '500円未満', count: expenses.filter(e => e.amount < 500).length },
                { label: '1,000円未満', count: expenses.filter(e => e.amount < 1000).length },
              ].map(({ label, count }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-800">{count}件</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
