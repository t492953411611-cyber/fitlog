'use client';
import { Lightbulb } from 'lucide-react';

interface Props {
  insights: string[];
}

export default function InsightCard({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="card mx-4 mt-4 p-4">
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 rounded-full p-1.5 flex-shrink-0 mt-0.5">
          <Lightbulb size={16} className="text-amber-600" />
        </div>
        <div className="flex-1">
          {insights.map((text, i) => (
            <p key={i} className={`text-sm text-slate-700 ${i > 0 ? 'mt-1.5' : ''}`}>
              {text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
