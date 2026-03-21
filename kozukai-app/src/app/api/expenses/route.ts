import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, createExpense } from '@/lib/storage';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year  = searchParams.get('year')  ? Number(searchParams.get('year'))  : undefined;
  const month = searchParams.get('month') ? Number(searchParams.get('month')) : undefined;
  const category = searchParams.get('category') ?? undefined;

  const expenses = await getExpenses({ year, month, category });
  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const expense = await createExpense({
      date:          body.date,
      amount:        Number(body.amount),
      merchant:      body.merchant ?? '',
      category:      body.category ?? 'その他',
      memo:          body.memo ?? '',
      paymentMethod: body.paymentMethod ?? 'other',
      sourceType:    body.sourceType ?? 'manual',
      imageRef:      body.imageRef,
    });
    return NextResponse.json(expense, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
