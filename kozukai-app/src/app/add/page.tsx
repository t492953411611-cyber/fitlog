'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PenLine, Camera } from 'lucide-react';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ImageUpload from '@/components/expenses/ImageUpload';
import ImageAnalysisConfirm from '@/components/expenses/ImageAnalysisConfirm';
import type { Category, AnalysisResult } from '@/lib/types';

function AddPageContent() {
  const searchParams = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'image' ? 'image' : 'manual';

  const [mode, setMode] = useState<'manual' | 'image'>(defaultMode);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-10 pb-5">
        <h1 className="text-white text-xl font-bold">支出を追加</h1>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Mode toggle */}
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
              mode === 'manual' ? 'bg-slate-800 text-white' : 'text-slate-500'
            }`}
            onClick={() => { setMode('manual'); setAnalysisResult(null); }}
          >
            <PenLine size={16} /> 手入力
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
              mode === 'image' ? 'bg-slate-800 text-white' : 'text-slate-500'
            }`}
            onClick={() => { setMode('image'); setAnalysisResult(null); }}
          >
            <Camera size={16} /> 写真から
          </button>
        </div>

        {/* Manual form */}
        {mode === 'manual' && (
          <ExpenseForm categories={categories} sourceType="manual" />
        )}

        {/* Image upload → analysis → confirm */}
        {mode === 'image' && !analysisResult && (
          <ImageUpload
            onResult={(result) => setAnalysisResult(result)}
          />
        )}

        {mode === 'image' && analysisResult && (
          <ImageAnalysisConfirm result={analysisResult} categories={categories} />
        )}
      </div>
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense>
      <AddPageContent />
    </Suspense>
  );
}
