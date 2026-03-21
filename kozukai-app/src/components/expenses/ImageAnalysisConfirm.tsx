'use client';
import { CheckCircle2 } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import type { Category } from '@/lib/types';
import ExpenseForm from './ExpenseForm';

interface Props {
  result: AnalysisResult;
  categories: Category[];
}

const CONFIDENCE_LABEL = {
  high:   { text: '自動入力済み（確認してください）', color: 'text-emerald-600 bg-emerald-50' },
  medium: { text: '一部不確かな項目があります。確認してください', color: 'text-amber-600 bg-amber-50' },
  low:    { text: '解析精度が低めです。内容を確認してください', color: 'text-red-600 bg-red-50' },
};

export default function ImageAnalysisConfirm({ result, categories }: Props) {
  const conf = CONFIDENCE_LABEL[result.confidence];

  return (
    <div className="flex flex-col gap-5">
      {/* Confidence badge */}
      <div className={`flex items-start gap-2 rounded-xl p-3 text-sm ${conf.color}`}>
        <CheckCircle2 size={17} className="flex-shrink-0 mt-0.5" />
        <span>{conf.text}</span>
      </div>

      {/* Pre-filled form */}
      <ExpenseForm
        categories={categories}
        initialValues={{
          date:          result.date,
          amount:        result.amount,
          merchant:      result.merchant,
          paymentMethod: result.paymentMethod,
        }}
        sourceType={
          result.imageType === 'paypay' ? 'paypay_screenshot' : 'receipt_image'
        }
      />
    </div>
  );
}
