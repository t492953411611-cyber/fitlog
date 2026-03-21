'use client';
import { useState } from 'react';
import { Trash2, Pencil, X, Check } from 'lucide-react';
import type { Expense, Category, PaymentMethod } from '@/lib/types';
import { formatCurrency, formatDate, todayStr } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';

interface Props {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Expense>) => void;
}

export default function ExpenseList({ expenses, categories, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

  const catColorMap = Object.fromEntries(categories.map((c) => [c.name, c.color]));

  function startEdit(e: Expense) {
    setEditingId(e.id);
    setEditForm({ date: e.date, amount: e.amount, merchant: e.merchant, category: e.category, paymentMethod: e.paymentMethod, memo: e.memo });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function saveEdit(id: string) {
    onUpdate(id, editForm);
    setEditingId(null);
    setEditForm({});
  }

  if (expenses.length === 0) {
    return <p className="text-center text-slate-400 py-12 text-sm">支出がありません</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {expenses.map((e) => (
        <li key={e.id} className="card overflow-hidden">
          {editingId === e.id ? (
            /* Inline edit form */
            <div className="p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-500 mb-1">金額</p>
                  <input
                    type="number"
                    value={editForm.amount ?? ''}
                    onChange={(v) => setEditForm((f) => ({ ...f, amount: Number(v.target.value) }))}
                    className="input-field text-base py-2"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">日付</p>
                  <input
                    type="date"
                    value={editForm.date ?? todayStr()}
                    onChange={(v) => setEditForm((f) => ({ ...f, date: v.target.value }))}
                    className="input-field text-base py-2"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">店名</p>
                <input
                  type="text"
                  value={editForm.merchant ?? ''}
                  onChange={(v) => setEditForm((f) => ({ ...f, merchant: v.target.value }))}
                  className="input-field text-base py-2"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">カテゴリ</p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, category: cat.name }))}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        editForm.category === cat.name ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                      style={editForm.category === cat.name ? { backgroundColor: cat.color } : {}}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">支払方法</p>
                <div className="flex gap-2">
                  {(['paypay', 'cash', 'card', 'other'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, paymentMethod: m }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        editForm.paymentMethod === m ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {PAYMENT_METHOD_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => saveEdit(e.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold">
                  <Check size={15} /> 保存
                </button>
                <button onClick={cancelEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold">
                  <X size={15} /> キャンセル
                </button>
              </div>
            </div>
          ) : (
            /* Normal row */
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: catColorMap[e.category] ?? '#9ca3af' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{e.merchant || e.category}</p>
                <p className="text-xs text-slate-400">
                  {formatDate(e.date)} · {e.category} · {PAYMENT_METHOD_LABELS[e.paymentMethod]}
                  {e.memo ? ` · ${e.memo}` : ''}
                </p>
              </div>
              <p className="font-semibold text-slate-800 flex-shrink-0">{formatCurrency(e.amount)}</p>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => startEdit(e)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => { if (confirm('削除しますか？')) onDelete(e.id); }}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
