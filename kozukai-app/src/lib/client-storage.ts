import { v4 as uuid } from 'uuid';
import type { Expense, Category, DB } from './types';

const STORAGE_KEY = 'kozukai_db';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-001', name: 'コンビニ',       color: '#f59e0b', isDefault: true },
  { id: 'cat-002', name: 'スーパー',       color: '#10b981', isDefault: true },
  { id: 'cat-003', name: '外食',           color: '#ef4444', isDefault: true },
  { id: 'cat-004', name: 'カフェ',         color: '#8b5cf6', isDefault: true },
  { id: 'cat-005', name: 'ドラッグストア', color: '#06b6d4', isDefault: true },
  { id: 'cat-006', name: '趣味',           color: '#ec4899', isDefault: true },
  { id: 'cat-007', name: 'ゴルフ',         color: '#84cc16', isDefault: true },
  { id: 'cat-008', name: '交通',           color: '#6366f1', isDefault: true },
  { id: 'cat-009', name: '仕事関係',       color: '#64748b', isDefault: true },
  { id: 'cat-010', name: '日用品',         color: '#f97316', isDefault: true },
  { id: 'cat-011', name: '本・学び',       color: '#0ea5e9', isDefault: true },
  { id: 'cat-012', name: 'その他',         color: '#9ca3af', isDefault: true },
];

const DEFAULT_DB: DB = {
  expenses: [],
  budget: 30000,
  categories: DEFAULT_CATEGORIES,
  version: 1,
};

// ── ヘルパー ───────────────────────────────────────────────

function isServer(): boolean {
  return typeof window === 'undefined';
}

function readDB(): DB {
  if (isServer()) return { ...DEFAULT_DB, categories: [...DEFAULT_CATEGORIES] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const db = { ...DEFAULT_DB, categories: [...DEFAULT_CATEGORIES], expenses: [] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return db;
    }
    return JSON.parse(raw) as DB;
  } catch {
    return { ...DEFAULT_DB, categories: [...DEFAULT_CATEGORIES] };
  }
}

function writeDB(db: DB): void {
  if (isServer()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ── Expenses ──────────────────────────────────────────────

export async function getExpenses(filters?: {
  year?: number;
  month?: number;
  category?: string;
}): Promise<Expense[]> {
  const db = readDB();
  let list = [...db.expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (filters?.category) {
    list = list.filter((e) => e.category === filters.category);
  }
  if (filters?.year !== undefined || filters?.month !== undefined) {
    list = list.filter((e) => {
      const d = new Date(e.date);
      if (filters.year  !== undefined && d.getFullYear()  !== filters.year)  return false;
      if (filters.month !== undefined && d.getMonth() + 1 !== filters.month) return false;
      return true;
    });
  }

  return list;
}

export async function getExpense(id: string): Promise<Expense | null> {
  const db = readDB();
  return db.expenses.find((e) => e.id === id) ?? null;
}

export async function createExpense(
  data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Expense> {
  const db = readDB();
  const now = new Date().toISOString();
  const expense: Expense = { ...data, id: uuid(), createdAt: now, updatedAt: now };
  db.expenses.push(expense);
  writeDB(db);
  return expense;
}

export async function updateExpense(
  id: string,
  data: Partial<Omit<Expense, 'id' | 'createdAt'>>
): Promise<Expense | null> {
  const db = readDB();
  const idx = db.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  db.expenses[idx] = { ...db.expenses[idx], ...data, updatedAt: new Date().toISOString() };
  writeDB(db);
  return db.expenses[idx];
}

export async function deleteExpense(id: string): Promise<boolean> {
  const db = readDB();
  const before = db.expenses.length;
  db.expenses = db.expenses.filter((e) => e.id !== id);
  if (db.expenses.length === before) return false;
  writeDB(db);
  return true;
}

// ── Budget ────────────────────────────────────────────────

export async function getBudget(): Promise<number> {
  return readDB().budget;
}

export async function setBudget(amount: number): Promise<void> {
  const db = readDB();
  db.budget = amount;
  writeDB(db);
}

// ── Categories ────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const db = readDB();
  return [...db.categories].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

export async function createCategory(name: string, color: string): Promise<Category> {
  const db = readDB();
  const category: Category = { id: uuid(), name, color, isDefault: false };
  db.categories.push(category);
  writeDB(db);
  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<Category | null> {
  const db = readDB();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.categories[idx] = { ...db.categories[idx], ...data };
  writeDB(db);
  return db.categories[idx];
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = readDB();
  const cat = db.categories.find((c) => c.id === id);
  if (!cat || cat.isDefault) return false;
  db.categories = db.categories.filter((c) => c.id !== id);
  writeDB(db);
  return true;
}

// ── Seed (ダミーデータ) ──────────────────────────────────

export async function seedData(): Promise<number> {
  const { format, subDays } = await import('date-fns');

  const SEED: Array<{
    daysAgo: number;
    amount: number;
    merchant: string;
    category: string;
    paymentMethod: 'paypay' | 'cash' | 'card' | 'other';
    memo?: string;
  }> = [
    { daysAgo: 0,  amount: 980,   merchant: 'セブン-イレブン',     category: 'コンビニ',       paymentMethod: 'paypay' },
    { daysAgo: 0,  amount: 350,   merchant: 'ファミリーマート',     category: 'コンビニ',       paymentMethod: 'paypay', memo: 'コーヒー' },
    { daysAgo: 1,  amount: 2800,  merchant: '大戸屋',               category: '外食',           paymentMethod: 'cash' },
    { daysAgo: 1,  amount: 580,   merchant: 'スターバックス',       category: 'カフェ',         paymentMethod: 'card' },
    { daysAgo: 2,  amount: 1080,  merchant: 'ローソン',             category: 'コンビニ',       paymentMethod: 'paypay' },
    { daysAgo: 3,  amount: 4200,  merchant: 'マツモトキヨシ',       category: 'ドラッグストア', paymentMethod: 'paypay' },
    { daysAgo: 3,  amount: 490,   merchant: 'セブン-イレブン',     category: 'コンビニ',       paymentMethod: 'paypay', memo: '飲み物' },
    { daysAgo: 4,  amount: 3200,  merchant: 'やよい軒',             category: '外食',           paymentMethod: 'cash' },
    { daysAgo: 5,  amount: 1500,  merchant: 'Amazon',               category: '本・学び',       paymentMethod: 'card',  memo: 'ビジネス書' },
    { daysAgo: 6,  amount: 660,   merchant: 'ドトールコーヒー',     category: 'カフェ',         paymentMethod: 'paypay' },
    { daysAgo: 7,  amount: 980,   merchant: 'ミニストップ',         category: 'コンビニ',       paymentMethod: 'paypay' },
    { daysAgo: 8,  amount: 5800,  merchant: 'ドン・キホーテ',      category: '日用品',         paymentMethod: 'paypay', memo: '消耗品まとめ買い' },
    { daysAgo: 9,  amount: 1200,  merchant: 'ファミリーマート',     category: 'コンビニ',       paymentMethod: 'paypay' },
    { daysAgo: 10, amount: 3500,  merchant: 'ラーメン花道',        category: '外食',           paymentMethod: 'cash',  memo: '同僚と' },
    { daysAgo: 11, amount: 280,   merchant: 'セブン-イレブン',     category: 'コンビニ',       paymentMethod: 'paypay', memo: 'ガム' },
    { daysAgo: 12, amount: 2100,  merchant: 'スギ薬局',            category: 'ドラッグストア', paymentMethod: 'paypay' },
    { daysAgo: 13, amount: 760,   merchant: 'ドトールコーヒー',     category: 'カフェ',         paymentMethod: 'paypay' },
    { daysAgo: 14, amount: 12000, merchant: 'ゴルフ練習場 代々木', category: 'ゴルフ',         paymentMethod: 'cash',  memo: '打ちっぱなし' },
    { daysAgo: 15, amount: 420,   merchant: 'ローソン',             category: 'コンビニ',       paymentMethod: 'paypay' },
    { daysAgo: 16, amount: 4800,  merchant: '鳥貴族',               category: '外食',           paymentMethod: 'cash',  memo: '部署の飲み会' },
    { daysAgo: 17, amount: 980,   merchant: 'セブン-イレブン',     category: 'コンビニ',       paymentMethod: 'paypay' },
    { daysAgo: 18, amount: 1800,  merchant: 'TSUTAYA',              category: '趣味',           paymentMethod: 'card' },
    { daysAgo: 20, amount: 550,   merchant: 'スターバックス',       category: 'カフェ',         paymentMethod: 'card' },
    { daysAgo: 22, amount: 3000,  merchant: 'ランチ 定食屋',       category: '外食',           paymentMethod: 'cash' },
    { daysAgo: 25, amount: 780,   merchant: 'ミニストップ',         category: 'コンビニ',       paymentMethod: 'paypay' },
    { daysAgo: 28, amount: 6500,  merchant: 'ゴルフ用品 上州屋',  category: 'ゴルフ',         paymentMethod: 'paypay', memo: 'グローブ購入' },
    { daysAgo: 32, amount: 1100,  merchant: 'ファミリーマート',     category: 'コンビニ',       paymentMethod: 'paypay' },
    { daysAgo: 35, amount: 2600,  merchant: '松屋',                 category: '外食',           paymentMethod: 'cash' },
    { daysAgo: 38, amount: 890,   merchant: 'ローソン',             category: 'コンビニ',       paymentMethod: 'paypay' },
    { daysAgo: 40, amount: 3800,  merchant: 'マツモトキヨシ',       category: 'ドラッグストア', paymentMethod: 'paypay' },
  ];

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
  return count;
}

// ── CSV エクスポート ───────────────────────────────────────

export async function exportCSV(year?: number, month?: number): Promise<void> {
  const expenses = await getExpenses({ year, month });

  const payMap: Record<string, string> = { paypay: 'PayPay', cash: '現金', card: 'カード', other: 'その他' };
  const srcMap: Record<string, string> = { manual: '手動', receipt_image: 'レシート', paypay_screenshot: 'PayPay' };

  const header = '日付,金額,店名,カテゴリ,支払方法,メモ,登録方法\n';
  const rows = expenses.map((e) =>
    [
      e.date,
      e.amount,
      `"${e.merchant.replace(/"/g, '""')}"`,
      e.category,
      payMap[e.paymentMethod] ?? e.paymentMethod,
      `"${(e.memo ?? '').replace(/"/g, '""')}"`,
      srcMap[e.sourceType] ?? e.sourceType,
    ].join(',')
  );

  const csv = '\uFEFF' + header + rows.join('\n'); // BOM for Excel
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kozukai_${year ?? 'all'}_${month ?? 'all'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
