/**
 * image-analyzer.ts
 *
 * OCR / image analysis layer.
 * Currently: mock implementation that returns realistic dummy data.
 *
 * To replace with real OCR, swap out `analyzeImage()` only.
 * Candidates:
 *   - Claude Vision API  (import Anthropic from '@anthropic-ai/sdk')
 *   - OpenAI Vision API
 *   - Google Cloud Vision
 *   - Tesseract.js
 */

import type { AnalysisResult } from './types';
import { format, subDays } from 'date-fns';

// Realistic mock data for receipts
const RECEIPT_MOCKS: Omit<AnalysisResult, 'imageType'>[] = [
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 980,  merchant: 'セブン-イレブン 渋谷南口店',  paymentMethod: 'paypay',  confidence: 'high' },
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 1250, merchant: 'ローソン 新宿三丁目店',        paymentMethod: 'paypay',  confidence: 'high' },
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 580,  merchant: 'スターバックス 品川駅店',     paymentMethod: 'card',    confidence: 'medium' },
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 2800, merchant: '大戸屋 渋谷店',               paymentMethod: 'cash',    confidence: 'high' },
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 4200, merchant: 'マツモトキヨシ 新宿店',       paymentMethod: 'paypay',  confidence: 'high' },
];

// Realistic mock data for PayPay screenshots
const PAYPAY_MOCKS: Omit<AnalysisResult, 'imageType'>[] = [
  { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), amount: 1080, merchant: 'ファミリーマート 大手町店', paymentMethod: 'paypay', confidence: 'high' },
  { date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), amount: 3200, merchant: 'やよい軒 丸の内店',          paymentMethod: 'paypay', confidence: 'high' },
  { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), amount: 690,  merchant: 'ドトールコーヒー 東京駅店', paymentMethod: 'paypay', confidence: 'medium' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectImageType(fileName: string, mimeType: string): 'receipt' | 'paypay' | 'unknown' {
  const lower = fileName.toLowerCase();
  if (lower.includes('paypay') || lower.includes('payment') || lower.includes('wallet')) {
    return 'paypay';
  }
  if (lower.includes('receipt') || lower.includes('レシート')) {
    return 'receipt';
  }
  // Screenshots often have "screenshot" or are PNG
  if (lower.includes('screenshot') || lower.includes('スクリーンショット')) {
    return 'paypay';
  }
  return 'receipt'; // default assumption
}

export async function analyzeImage(
  file: File
): Promise<AnalysisResult> {
  // Simulate network/processing latency
  await new Promise((r) => setTimeout(r, 1200));

  const imageType = detectImageType(file.name, file.type);
  const pool = imageType === 'paypay' ? PAYPAY_MOCKS : RECEIPT_MOCKS;
  const mock = pickRandom(pool);

  return { ...mock, imageType };
}

/**
 * FUTURE: Replace analyzeImage with Claude Vision API
 *
 * import Anthropic from '@anthropic-ai/sdk';
 *
 * export async function analyzeImage(file: File): Promise<AnalysisResult> {
 *   const client = new Anthropic();
 *   const base64 = await fileToBase64(file);
 *   const response = await client.messages.create({
 *     model: 'claude-opus-4-6',
 *     max_tokens: 512,
 *     messages: [{
 *       role: 'user',
 *       content: [
 *         { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
 *         { type: 'text', text: 'このレシートまたはPayPay画面から日付・金額・店名・支払い方法をJSON形式で抽出してください。' },
 *       ],
 *     }],
 *   });
 *   return parseClaudeResponse(response.content[0]);
 * }
 */
