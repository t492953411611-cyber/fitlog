import type { Expense } from './types';

export function generateInsights(expenses: Expense[], budget: number): string[] {
  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  if (thisMonth.length === 0) return ['支出を記録して傾向を把握しましょう'];

  const insights: string[] = [];
  const total = thisMonth.reduce((s, e) => s + e.amount, 0);

  // カテゴリ別件数
  const catCount: Record<string, number> = {};
  for (const e of thisMonth) {
    catCount[e.category] = (catCount[e.category] ?? 0) + 1;
  }
  const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
  if (topCat && topCat[1] >= 4) {
    insights.push(`${topCat[0]}の利用が今月${topCat[1]}回あります`);
  }

  // 少額支出
  const smallCount = thisMonth.filter((e) => e.amount < 500).length;
  if (smallCount >= 6) {
    insights.push(`500円未満の少額支出が${smallCount}件あります`);
  }

  // 予算消化ペース
  if (budget > 0) {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const pace = Math.round((total / now.getDate()) * daysInMonth);
    if (pace > budget * 1.2) {
      insights.push('このペースだと予算を上回る可能性があります');
    } else if (total > budget * 0.75) {
      insights.push(`予算の${Math.round((total / budget) * 100)}%を使いました`);
    }
  }

  // 同じ店への集中
  const merchantCount: Record<string, number> = {};
  for (const e of thisMonth) {
    if (!e.merchant) continue;
    const key = e.merchant.slice(0, 10);
    merchantCount[key] = (merchantCount[key] ?? 0) + 1;
  }
  const topMerchant = Object.entries(merchantCount).sort((a, b) => b[1] - a[1])[0];
  if (topMerchant && topMerchant[1] >= 5 && insights.length < 2) {
    insights.push(`「${topMerchant[0]}」への支出が${topMerchant[1]}回あります`);
  }

  // 未分類
  const uncategorized = thisMonth.filter((e) => e.category === 'その他').length;
  if (uncategorized >= 3 && insights.length < 2) {
    insights.push(`「その他」が${uncategorized}件あります。カテゴリを設定しましょう`);
  }

  return insights.length > 0 ? insights.slice(0, 2) : ['今月も記録を続けましょう'];
}
