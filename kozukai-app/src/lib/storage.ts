import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import type { Expense, Category, DB } from './types';

// ── ファイルパス ──────────────────────────────────────────
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// ── 読み書きヘルパー ──────────────────────────────────────
function readDB(): DB {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DB;
}

function writeDB(db: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
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
