import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import type { DB, Expense, Category } from './types';
import { DEFAULT_BUDGET, DEFAULT_CATEGORIES } from './constants';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function readDB(): DB {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial: DB = {
        expenses: [],
        budget: DEFAULT_BUDGET,
        categories: DEFAULT_CATEGORIES,
        version: 1,
      };
      writeDB(initial);
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    // 旧フォーマット互換: categoriesがなければデフォルトを補完
    if (!parsed.categories) parsed.categories = DEFAULT_CATEGORIES;
    if (parsed.budget === undefined) parsed.budget = DEFAULT_BUDGET;
    return parsed as DB;
  } catch {
    const initial: DB = {
      expenses: [],
      budget: DEFAULT_BUDGET,
      categories: DEFAULT_CATEGORIES,
      version: 1,
    };
    writeDB(initial);
    return initial;
  }
}

function writeDB(db: DB): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// ── Expenses ──────────────────────────────────────────────

export async function getExpenses(filters?: {
  year?: number;
  month?: number;
  category?: string;
}): Promise<Expense[]> {
  const db = readDB();
  let list = db.expenses;

  if (filters?.year !== undefined || filters?.month !== undefined) {
    list = list.filter((e) => {
      const d = new Date(e.date);
      if (filters.year !== undefined && d.getFullYear() !== filters.year) return false;
      if (filters.month !== undefined && d.getMonth() + 1 !== filters.month) return false;
      return true;
    });
  }

  if (filters?.category) {
    list = list.filter((e) => e.category === filters.category);
  }

  return list.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getExpense(id: string): Promise<Expense | null> {
  return readDB().expenses.find((e) => e.id === id) ?? null;
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
  return readDB().categories;
}

export async function createCategory(name: string, color: string): Promise<Category> {
  const db = readDB();
  const cat: Category = { id: uuid(), name, color, isDefault: false };
  db.categories.push(cat);
  writeDB(db);
  return cat;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
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
