import type { Category } from './types';
import { v4 as uuid } from 'uuid';

export const DEFAULT_BUDGET = 30000;

export const CATEGORY_COLORS: Record<string, string> = {
  'コンビニ':       '#f59e0b',
  'スーパー':       '#10b981',
  '外食':           '#ef4444',
  'カフェ':         '#8b5cf6',
  'ドラッグストア': '#06b6d4',
  '趣味':           '#ec4899',
  'ゴルフ':         '#84cc16',
  '交通':           '#6366f1',
  '仕事関係':       '#64748b',
  '日用品':         '#f97316',
  '本・学び':       '#0ea5e9',
  'その他':         '#9ca3af',
};

export const DEFAULT_CATEGORIES: Category[] = Object.entries(CATEGORY_COLORS).map(
  ([name, color]) => ({
    id: uuid(),
    name,
    color,
    isDefault: true,
  })
);

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paypay: 'PayPay',
  cash:   '現金',
  card:   'カード',
  other:  'その他',
};

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  paypay: '#e53e3e',
  cash:   '#38a169',
  card:   '#3182ce',
  other:  '#718096',
};
