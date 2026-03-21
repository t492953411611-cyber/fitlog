'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, PaymentMethod } from '@/lib/types';
import { todayStr } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';

interface Props {
  categories: Category[];
  initialValues?: {
    date?: string;
    amount?: number;
    merchant?: string;
    category?: string;
    paymentMethod?: PaymentMethod;
    memo?: string;
  };
  sourceType?: 'manual' | 'receipt_image' | 'paypay_screenshot';
  onSubmit?: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ['paypay', 'cash', 'card', 'other'];

export default function ExpenseForm({
  categories,
  initialValues = {},
  sourceType = 'manual',
  onSubmit,
}: Props) {
  const router = useRouter();
  const [date, setDate]               = useState(initialValues.date ?? todayStr());
  const [amount, setAmount]           = useState(initialValues.amount?.toString() ?? '');
  const [merchant, setMerchant]       = useState(initialValues.merchant ?? '');
  const [category, setCategory]       = useState(initialValues.category ?? '');
  const [paymentMethod, setPayment]   = useState<PaymentMethod>(initialValues.paymentMethod ?? 'paypay');
  const [memo, setMemo]               = useState(initialValues.memo ?? '');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { setError('金額を入力してください'); return; }
    if (!category) { setError('カテゴリを選択してください'); return; }
    setSaving(true);
    setError('');

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, amount: Number(amount), merchant, category, paymentMethod, memo, sourceType }),
    });

    if (res.ok) {
      onSubmit?.();
      router.push('/');
    } else {
      setError('保存に失敗しました');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Amount – largest, most important */}
      <div>
        <label className="label">金額 <span className="text-red-500">*</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-500">¥</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field pl-10 text-2xl font-bold"
            autoFocus
          />
        </div>
      </div>

      {/* Category – tap grid */}
      <div>
        <label className="label">カテゴリ <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.name)}
              className={`py-2.5 px-2 rounded-xl text-sm font-medium border transition-colors text-center ${
                category === cat.name
                  ? 'text-white border-transparent'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
              style={category === cat.name ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="label">支払方法</label>
        <div className="flex gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPayment(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                paymentMethod === m
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              {PAYMENT_METHOD_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="label">日付</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Merchant */}
      <div>
        <label className="label">店名（任意）</label>
        <input
          type="text"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="例：セブン-イレブン 渋谷店"
          className="input-field"
        />
      </div>

      {/* Memo */}
      <div>
        <label className="label">メモ（任意）</label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="例：同僚と昼食"
          className="input-field"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary w-full text-base mt-2">
        {saving ? '保存中...' : '記録する'}
      </button>
    </form>
  );
}
