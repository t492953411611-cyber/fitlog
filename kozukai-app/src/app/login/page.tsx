'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });

    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      setError('PINが違います');
      setPin('');
      setLoading(false);
    }
  }

  // テンキー風ボタン
  function pressKey(key: string) {
    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
    } else if (pin.length < 8) {
      setPin((p) => p + key);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-xs p-8">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center">
            <Lock size={26} className="text-white" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-800 text-center">小遣いメモ</h1>
        <p className="text-slate-400 text-sm text-center mt-1 mb-6">PINを入力してください</p>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-2">
          {Array.from({ length: Math.max(4, pin.length) }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < pin.length ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3 mt-2">{error}</p>
        )}

        {/* Number pad */}
        <form onSubmit={handleSubmit}>
          <input type="hidden" value={pin} />
          <div className="grid grid-cols-3 gap-2 mt-4">
            {['1','2','3','4','5','6','7','8','9','','0','del'].map((key) => (
              <button
                key={key}
                type={key === '' ? 'button' : 'button'}
                onClick={() => key !== '' && pressKey(key)}
                disabled={key === ''}
                className={`h-14 rounded-xl text-lg font-semibold transition-colors ${
                  key === ''
                    ? ''
                    : key === 'del'
                    ? 'bg-slate-100 text-slate-500 active:bg-slate-200'
                    : 'bg-slate-100 text-slate-800 active:bg-slate-200'
                }`}
              >
                {key === 'del' ? '⌫' : key}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={pin.length === 0 || loading}
            className="btn-primary w-full mt-4 text-base"
          >
            {loading ? '確認中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
