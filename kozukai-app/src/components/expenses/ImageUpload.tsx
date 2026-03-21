'use client';
import { useRef, useState } from 'react';
import { Camera, Upload, AlertCircle } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import Image from 'next/image';

interface Props {
  onResult: (result: AnalysisResult, imageType: 'receipt' | 'paypay' | 'unknown') => void;
}

export default function ImageUpload({ onResult }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setAnalyzing(true);
    setError('');

    const form = new FormData();
    form.append('image', file);

    const res = await fetch('/api/analyze-image', { method: 'POST', body: form });
    setAnalyzing(false);

    if (!res.ok) {
      setError('画像の解析に失敗しました。もう一度お試しください。');
      return;
    }

    const result: AnalysisResult = await res.json();
    onResult(result, result.imageType);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer bg-white hover:bg-slate-50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-48">
            <Image src={preview} alt="preview" fill className="object-contain rounded-xl" />
          </div>
        ) : (
          <>
            <div className="mx-auto w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Camera size={28} className="text-slate-500" />
            </div>
            <p className="font-semibold text-slate-700">レシート・PayPay画面を選択</p>
            <p className="text-sm text-slate-400 mt-1">タップして撮影 or ファイル選択</p>
          </>
        )}
      </div>

      {preview && !analyzing && (
        <button
          className="flex items-center justify-center gap-2 btn-secondary"
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={18} /> 別の画像を選ぶ
        </button>
      )}

      {analyzing && (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-slate-600 text-sm">画像を解析中...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
}
