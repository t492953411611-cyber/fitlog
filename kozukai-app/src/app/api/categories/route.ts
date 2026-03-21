import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/storage';

export async function GET() {
  return NextResponse.json(await getCategories());
}

export async function POST(request: NextRequest) {
  try {
    const { name, color } = await request.json();
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    const cat = await createCategory(name, color ?? '#9ca3af');
    return NextResponse.json(cat, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
