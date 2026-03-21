import { NextRequest, NextResponse } from 'next/server';
import { getBudget, setBudget } from '@/lib/storage';

export async function GET() {
  return NextResponse.json({ budget: await getBudget() });
}

export async function PUT(request: NextRequest) {
  try {
    const { budget } = await request.json();
    if (typeof budget !== 'number' || budget < 0) {
      return NextResponse.json({ error: 'Invalid budget' }, { status: 400 });
    }
    await setBudget(budget);
    return NextResponse.json({ budget });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
