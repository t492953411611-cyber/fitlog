'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, Download } from 'lucide-react';
import type { Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const PRESET_COLORS = [
  '#ef4444','#f97316','#f59e0b','#84cc16',
  '#10b981','#06b6d4','#6366f1','#8b5cf6',
  '#ec4899','#64748b','#334155','#9ca3af',
];

export default function SettingsPage() {
  const [budget, setBudgetState]   = useState(0);
  const [budgetInput, setBudgetInput] = useState('');
  const [saved, setSaved]          = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  useEffect(() => {
    Promise.all([
      fetch('/api/budget').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([b, c]) => {
      setBudgetState(b.budget);
      setBudgetInput(b.budget.toString());
      setCategories(c);
    });
  }, []);

  async function saveBudget() {
    const v = Number(budgetInput);
    if (isNaN(v) || v < 0) return;
    await fetch('/api/budget', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: v }),
    });
    setBudgetState(v);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName.trim(), color: newCatColor }),
    });
    const cat = await res.json();
    setCategories(c => [...c, cat]);
    setNewCatName('');
  }

  async function deleteCategory(id: string) {
    if (!confirm('このカテゴリを削除しますか？（デフォルトカテゴリは削除できません）')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) setCategories(c => c.filter(x => x.id !== id));
    else alert('デフォルトカテゴリは削除できません');
  }

  function exportCSV() {
    window.open('/api/export', '_blank');
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-10 pb-5">
        <h1 className="text-white text-xl font-bold">設定</h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4 pb-6">

        {/* Budget */}
        <div className="card p-4">
          <p className="font-semibold text-slate-800 mb-1">月の小遣い予算</p>
          <p className="text-xs text-slate-400 mb-3">現在：{formatCurrency(budget)}</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">¥</span>
              <input
                type="number"
                inputMode="numeric"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                className="input-field pl-8"
                placeholder="30000"
              />
            </div>
            <button
              onClick={saveBudget}
              className={`flex items-center gap-1.5 px-4 rounded-xl font-semibold text-sm transition-colors ${
                saved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'
              }`}
            >
              {saved ? <><Check size={15} /> 保存済</> : '保存'}
            </button>
          </div>
          {/* Quick preset amounts */}
          <div className="flex gap-2 mt-3">
            {[20000, 30000, 40000, 50000].map(v => (
              <button
                key={v}
                onClick={() => setBudgetInput(v.toString())}
                className="flex-1 text-xs py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
              >
                {v / 10000}万
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="card p-4">
          <p className="font-semibold text-slate-800 mb-3">カテゴリ管理</p>

          {/* Existing categories */}
          <div className="flex flex-col gap-2 mb-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="flex-1 text-sm text-slate-700">{cat.name}</span>
                {!cat.isDefault && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {cat.isDefault && (
                  <span className="text-xs text-slate-300">デフォルト</span>
                )}
              </div>
            ))}
          </div>

          {/* Add new category */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500 mb-2">新しいカテゴリを追加</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewCatColor(color)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: newCatColor === color ? '#1e293b' : 'transparent',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                placeholder="カテゴリ名"
                className="input-field flex-1"
              />
              <button
                onClick={addCategory}
                className="flex items-center gap-1 px-4 bg-slate-800 text-white rounded-xl text-sm font-semibold flex-shrink-0"
              >
                <Plus size={16} /> 追加
              </button>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="card p-4">
          <p className="font-semibold text-slate-800 mb-1">データエクスポート</p>
          <p className="text-xs text-slate-400 mb-3">全支出データをCSV形式でダウンロードします</p>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 w-full justify-center py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Download size={16} /> CSVをダウンロード
          </button>
        </div>

        {/* Seed data (dev) */}
        <div className="card p-4 border-dashed">
          <p className="font-semibold text-slate-500 text-sm mb-1">ダミーデータ</p>
          <p className="text-xs text-slate-400 mb-3">動作確認用のサンプルデータを追加します</p>
          <button
            onClick={async () => {
              const res = await fetch('/api/seed', { method: 'POST' });
              const { message } = await res.json();
              alert(message);
            }}
            className="text-sm text-slate-500 border border-slate-200 rounded-xl px-4 py-2 w-full hover:bg-slate-50 transition-colors"
          >
            ダミーデータを追加
          </button>
        </div>

      </div>
    </div>
  );
}
