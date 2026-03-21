import { NextRequest, NextResponse } from 'next/server';
import { getExpenses } from '@/lib/storage';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year  = searchParams.get('year')  ? Number(searchParams.get('year'))  : undefined;
  const month = searchParams.get('month') ? Number(searchParams.get('month')) : undefined;

  const expenses = await getExpenses({ year, month });

  const header = '日付,金額,店名,カテゴリ,支払方法,メモ,登録方法\n';
  const rows = expenses.map((e) => {
    const payMap: Record<string, string> = { paypay: 'PayPay', cash: '現金', card: 'カード', other: 'その他' };
    const srcMap: Record<string, string> = { manual: '手動', receipt_image: 'レシート', paypay_screenshot: 'PayPay' };
    return [
      e.date,
      e.amount,
      `"${e.merchant.replace(/"/g, '""')}"`,
      e.category,
      payMap[e.paymentMethod] ?? e.paymentMethod,
      `"${(e.memo ?? '').replace(/"/g, '""')}"`,
      srcMap[e.sourceType] ?? e.sourceType,
    ].join(',');
  });

  const csv = '\uFEFF' + header + rows.join('\n'); // BOM for Excel

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kozukai_${year ?? 'all'}_${month ?? 'all'}.csv"`,
    },
  });
}
