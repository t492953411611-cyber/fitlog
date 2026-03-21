import { supabase } from './supabase';
import type { Expense, Category } from './types';

// ── Expenses ──────────────────────────────────────────────

function toExpense(row: Record<string, unknown>): Expense {
  return {
    id:            row.id as string,
    date:          row.date as string,
    amount:        row.amount as number,
    merchant:      row.merchant as string,
    category:      row.category as string,
    memo:          row.memo as string,
    paymentMethod: row.payment_method as Expense['paymentMethod'],
    sourceType:    row.source_type as Expense['sourceType'],
    imageRef:      row.image_ref as string | undefined,
    createdAt:     row.created_at as string,
    updatedAt:     row.updated_at as string,
  };
}

export async function getExpenses(filters?: {
  year?: number;
  month?: number;
  category?: string;
}): Promise<Expense[]> {
  let query = supabase.from('expenses').select('*').order('date', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query;
  if (error) throw error;

  let list = (data ?? []).map(toExpense);

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
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();
  if (error || !data) return null;
  return toExpense(data);
}

export async function createExpense(
  data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Expense> {
  const { v4: uuid } = await import('uuid');
  const now = new Date().toISOString();
  const row = {
    id:             uuid(),
    date:           data.date,
    amount:         data.amount,
    merchant:       data.merchant,
    category:       data.category,
    memo:           data.memo,
    payment_method: data.paymentMethod,
    source_type:    data.sourceType,
    image_ref:      data.imageRef ?? null,
    created_at:     now,
    updated_at:     now,
  };
  const { data: inserted, error } = await supabase.from('expenses').insert(row).select().single();
  if (error) throw error;
  return toExpense(inserted);
}

export async function updateExpense(
  id: string,
  data: Partial<Omit<Expense, 'id' | 'createdAt'>>
): Promise<Expense | null> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.date          !== undefined) updates.date           = data.date;
  if (data.amount        !== undefined) updates.amount         = data.amount;
  if (data.merchant      !== undefined) updates.merchant       = data.merchant;
  if (data.category      !== undefined) updates.category       = data.category;
  if (data.memo          !== undefined) updates.memo           = data.memo;
  if (data.paymentMethod !== undefined) updates.payment_method = data.paymentMethod;
  if (data.sourceType    !== undefined) updates.source_type    = data.sourceType;
  if (data.imageRef      !== undefined) updates.image_ref      = data.imageRef;

  const { data: updated, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
  if (error || !updated) return null;
  return toExpense(updated);
}

export async function deleteExpense(id: string): Promise<boolean> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  return !error;
}

// ── Budget ────────────────────────────────────────────────

export async function getBudget(): Promise<number> {
  const { data } = await supabase.from('settings').select('value').eq('key', 'budget').single();
  return data ? Number(data.value) : 30000;
}

export async function setBudget(amount: number): Promise<void> {
  await supabase.from('settings').upsert({ key: 'budget', value: String(amount) });
}

// ── Categories ────────────────────────────────────────────

function toCategory(row: Record<string, unknown>): Category {
  return {
    id:        row.id as string,
    name:      row.name as string,
    color:     row.color as string,
    isDefault: row.is_default as boolean,
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map(toCategory);
}

export async function createCategory(name: string, color: string): Promise<Category> {
  const { v4: uuid } = await import('uuid');
  const row = { id: uuid(), name, color, is_default: false };
  const { data, error } = await supabase.from('categories').insert(row).select().single();
  if (error) throw error;
  return toCategory(data);
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
  const updates: Record<string, unknown> = {};
  if (data.name  !== undefined) updates.name      = data.name;
  if (data.color !== undefined) updates.color     = data.color;
  const { data: updated, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
  if (error || !updated) return null;
  return toCategory(updated);
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { data: cat } = await supabase.from('categories').select('is_default').eq('id', id).single();
  if (!cat || cat.is_default) return false;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  return !error;
}
