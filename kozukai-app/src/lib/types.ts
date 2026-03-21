export type PaymentMethod = 'paypay' | 'cash' | 'card' | 'other';
export type SourceType = 'manual' | 'receipt_image' | 'paypay_screenshot';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  merchant: string;
  category: string;
  memo: string;
  paymentMethod: PaymentMethod;
  sourceType: SourceType;
  imageRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface DB {
  expenses: Expense[];
  budget: number; // monthly allowance in yen
  categories: Category[];
  version: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  total: number;
  count: number;
  budget: number;
  remaining: number;
  usageRate: number; // 0–100
}

export interface CategorySummary {
  category: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MerchantRank {
  merchant: string;
  total: number;
  count: number;
}

export interface WeeklyData {
  label: string;
  amount: number;
  count: number;
}

// OCR / image analysis result
export interface AnalysisResult {
  date: string;           // YYYY-MM-DD
  amount: number;
  merchant: string;
  paymentMethod: PaymentMethod;
  confidence: 'high' | 'medium' | 'low';
  imageType: 'receipt' | 'paypay' | 'unknown';
}
