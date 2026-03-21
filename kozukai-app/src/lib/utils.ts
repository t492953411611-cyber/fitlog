import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Expense, CategorySummary, MerchantRank, WeeklyData } from './types';

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return format(d, 'M月d日(E)', { locale: ja });
}

export function formatMonth(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function currentYM(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function getCategorySummaries(
  expenses: Expense[],
  categoryColorMap: Record<string, string>
): CategorySummary[] {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const map: Record<string, { total: number; count: number }> = {};

  for (const e of expenses) {
    if (!map[e.category]) map[e.category] = { total: 0, count: 0 };
    map[e.category].total += e.amount;
    map[e.category].count += 1;
  }

  return Object.entries(map)
    .map(([category, { total: t, count }]) => ({
      category,
      color: categoryColorMap[category] ?? '#9ca3af',
      total: t,
      count,
      percentage: total > 0 ? Math.round((t / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getMerchantRanking(expenses: Expense[], limit = 5): MerchantRank[] {
  const map: Record<string, { total: number; count: number }> = {};
  for (const e of expenses) {
    if (!e.merchant) continue;
    if (!map[e.merchant]) map[e.merchant] = { total: 0, count: 0 };
    map[e.merchant].total += e.amount;
    map[e.merchant].count += 1;
  }
  return Object.entries(map)
    .map(([merchant, { total, count }]) => ({ merchant, total, count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function getWeeklyData(expenses: Expense[]): WeeklyData[] {
  const weeks: WeeklyData[] = [];

  for (let i = 3; i >= 0; i--) {
    const base = subWeeks(new Date(), i);
    const start = startOfWeek(base, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(base, { weekStartsOn: 1 });

    const weekExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    weeks.push({
      label: `${start.getMonth() + 1}/${start.getDate()}〜`,
      amount: weekExpenses.reduce((s, e) => s + e.amount, 0),
      count: weekExpenses.length,
    });
  }

  return weeks;
}

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
