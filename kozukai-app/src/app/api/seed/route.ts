/**
 * POST /api/seed
 * Populates the DB with 2 months of dummy expense data.
 * Call once to see the app with realistic data.
 */
import { NextResponse } from 'next/server';
import { createExpense, getBudget, setBudget } from '@/lib/storage';
import { format, subDays } from 'date-fns';

const SEED: Array<{
  daysAgo: number;
  amount: number;
  merchant: string;
  category: string;
  paymentMethod: 'paypay' | 'cash' | 'card' | 'other';
  memo?: string;
}> = [
  { daysAgo: 0,  amount: 980,  merchant: 'セブン-イレブン',        category: 'コンビニ',       paymentMethod: 'paypay' },
  { daysAgo: 0,  amount: 350,  merchant: 'ファミリーマート',        category: 'コンビニ',       paymentMethod: 'paypay', memo: 'コーヒー' },
  { daysAgo: 1,  amount: 2800, merchant: '大戸屋',                  category: '外食',           paymentMethod: 'cash' },
  { daysAgo: 1,  amount: 580,  merchant: 'スターバックス',          category: 'カフェ',         paymentMethod: 'card' },
  { daysAgo: 2,  amount: 1080, merchant: 'ローソン',                category: 'コンビニ',       paymentMethod: 'paypay' },
  { daysAgo: 3,  amount: 4200, merchant: 'マツモトキヨシ',          category: 'ドラッグストア', paymentMethod: 'paypay' },
  { daysAgo: 3,  amount: 490,  merchant: 'セブン-イレブン',        category: 'コンビニ',       paymentMethod: 'paypay', memo: '飲み物' },
  { daysAgo: 4,  amount: 3200, merchant: 'やよい軒',                category: '外食',           paymentMethod: 'cash' },
  { daysAgo: 5,  amount: 1500, merchant: 'Amazon',                  category: '本・学び',       paymentMethod: 'card', memo: 'ビジネス書' },
  { daysAgo: 6,  amount: 660,  merchant: 'ドトールコーヒー',        category: 'カフェ',         paymentMethod: 'paypay' },
  { daysAgo: 7,  amount: 980,  merchant: 'ミニストップ',            category: 'コンビニ',       paymentMethod: 'paypay' },
  { daysAgo: 8,  amount: 5800, merchant: 'ドン・キホーテ',         category: '日用品',         paymentMethod: 'paypay', memo: '消耗品まとめ買い' },
  { daysAgo: 9,  amount: 1200, merchant: 'ファミリーマート',        category: 'コンビニ',       paymentMethod: 'paypay' },
  { daysAgo: 10, amount: 3500, merchant: 'ラーメン花道',           category: '外食',           paymentMethod: 'cash', memo: '同僚と' },
  { daysAgo: 11, amount: 280,  merchant: 'セブン-イレブン',        category: 'コンビニ',       paymentMethod: 'paypay', memo: 'ガム' },
  { daysAgo: 12, amount: 2100, merchant: 'スギ薬局',               category: 'ドラッグストア', paymentMethod: 'paypay' },
  { daysAgo: 13, amount: 760,  merchant: 'ドトールコーヒー',        category: 'カフェ',         paymentMethod: 'paypay' },
  { daysAgo: 14, amount: 12000,merchant: 'ゴルフ練習場 代々木',    category: 'ゴルフ',         paymentMethod: 'cash', memo: '打ちっぱなし' },
  { daysAgo: 15, amount: 420,  merchant: 'ローソン',               category: 'コンビニ',       paymentMethod: 'paypay' },
  { daysAgo: 16, amount: 4800, merchant: '鳥貴族',                  category: '外食',           paymentMethod: 'cash', memo: '部署の飲み会' },
  { daysAgo: 17, amount: 980,  merchant: 'セブン-イレブン',        category: 'コンビニ',       paymentMethod: 'paypay' },
  { daysAgo: 18, amount: 1800, merchant: 'TSUTAYA',                 category: '趣味',           paymentMethod: 'card' },
  { daysAgo: 20, amount: 550,  merchant: 'スターバックス',          category: 'カフェ',         paymentMethod: 'card' },
  { daysAgo: 22, amount: 3000, merchant: 'ランチ 定食屋',          category: '外食',           paymentMethod: 'cash' },
  { daysAgo: 25, amount: 780,  merchant: 'ミニストップ',            category: 'コンビニ',       paymentMethod: 'paypay' },
  { daysAgo: 28, amount: 6500, merchant: 'ゴルフ用品 上州屋',     category: 'ゴルフ',         paymentMethod: 'paypay', memo: 'グローブ購入' },
  { daysAgo: 32, amount: 1100, merchant: 'ファミリーマート',        category: 'コンビニ',       paymentMethod: 'paypay' },
  { daysAgo: 35, amount: 2600, merchant: '松屋',                    category: '外食',           paymentMethod: 'cash' },
  { daysAgo: 38, amount: 890,  merchant: 'ローソン',               category: 'コンビニ',       paymentMethod: 'paypay' },
  { daysAgo: 40, amount: 3800, merchant: 'マツモトキヨシ',          category: 'ドラッグストア', paymentMethod: 'paypay' },
];

export async function POST() {
  // Set budget if not set
  if (await getBudget() === 0) await setBudget(30000);

  let count = 0;
  for (const s of SEED) {
    await createExpense({
      date:          format(subDays(new Date(), s.daysAgo), 'yyyy-MM-dd'),
      amount:        s.amount,
      merchant:      s.merchant,
      category:      s.category,
      memo:          s.memo ?? '',
      paymentMethod: s.paymentMethod,
      sourceType:    'manual',
    });
    count++;
  }

  return NextResponse.json({ message: `${count}件のダミーデータを追加しました` });
}
