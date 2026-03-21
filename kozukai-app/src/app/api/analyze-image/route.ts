import { NextRequest, NextResponse } from 'next/server';
import type { AnalysisResult } from '@/lib/types';
import { format, subDays } from 'date-fns';

// ── Mock fallback ─────────────────────────────────────────
const RECEIPT_MOCKS: Omit<AnalysisResult, 'imageType'>[] = [
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 980,  merchant: 'セブン-イレブン 渋谷南口店',  paymentMethod: 'paypay', confidence: 'high' },
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 1250, merchant: 'ローソン 新宿三丁目店',        paymentMethod: 'paypay', confidence: 'high' },
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 580,  merchant: 'スターバックス 品川駅店',     paymentMethod: 'card',   confidence: 'medium' },
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 2800, merchant: '大戸屋 渋谷店',               paymentMethod: 'cash',   confidence: 'high' },
  { date: format(new Date(), 'yyyy-MM-dd'), amount: 4200, merchant: 'マツモトキヨシ 新宿店',       paymentMethod: 'paypay', confidence: 'high' },
];

const PAYPAY_MOCKS: Omit<AnalysisResult, 'imageType'>[] = [
  { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), amount: 1080, merchant: 'ファミリーマート 大手町店', paymentMethod: 'paypay', confidence: 'high' },
  { date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), amount: 3200, merchant: 'やよい軒 丸の内店',          paymentMethod: 'paypay', confidence: 'high' },
  { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), amount: 690,  merchant: 'ドトールコーヒー 東京駅店', paymentMethod: 'paypay', confidence: 'medium' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectImageType(fileName: string): 'receipt' | 'paypay' {
  const lower = fileName.toLowerCase();
  if (lower.includes('paypay') || lower.includes('payment') || lower.includes('wallet') ||
      lower.includes('screenshot') || lower.includes('スクリーンショット')) {
    return 'paypay';
  }
  return 'receipt';
}

async function mockAnalyze(file: File): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 800));
  const imageType = detectImageType(file.name);
  const pool = imageType === 'paypay' ? PAYPAY_MOCKS : RECEIPT_MOCKS;
  return { ...pickRandom(pool), imageType };
}

// ── Gemini OCR (requires GEMINI_API_KEY) ──────────────────
async function geminiAnalyze(file: File): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = 'gemini-2.5-flash';

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = file.type || 'image/jpeg';
  const today = new Date().toISOString().slice(0, 10);

  const prompt = `画像を詳しく分析して、支払い情報を抽出してください。

【重要な注意事項】
- PayPayウォレット画面の場合:「残高」や「PayPay残高」の大きな金額は無視してください
- 抽出すべきは「支払い取引」の金額です（例：「¥772 支払い」「-772円」のような取引履歴の金額）
- 最も新しい/目立つ「支払い」取引の金額を選んでください
- レシートの場合は「合計」「小計」「お支払い金額」の金額を選んでください

必ず以下のJSON形式のみで返答してください（説明文不要）:
{
  "date": "YYYY-MM-DD",
  "amount": 数値（支払い金額、円、¥マークなし）,
  "merchant": "店名",
  "paymentMethod": "paypay" または "cash" または "card" または "other",
  "confidence": "high" または "medium" または "low",
  "imageType": "receipt" または "paypay" または "unknown"
}
- dateが読み取れない場合は今日の日付（${today}）を使用
- amountは必ず支払い取引の金額（残高ではない）
- 読み取れない項目は推測値を入れること`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: prompt },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini returned no JSON');
  return JSON.parse(jsonMatch[0]) as AnalysisResult;
}

// ── Route handler ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // GEMINI_API_KEY が設定されていれば本物のOCR、なければモック
    let analysisResult: AnalysisResult;
    if (process.env.GEMINI_API_KEY) {
      analysisResult = await geminiAnalyze(file);
    } else {
      analysisResult = await mockAnalyze(file);
    }

    return NextResponse.json(analysisResult);
  } catch (err) {
    console.error('analyze-image error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
