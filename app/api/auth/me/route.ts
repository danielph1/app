import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  const u = await requireUser(req);
  if (!u) return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });
  return NextResponse.json(u);
}
