import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  const u = await requireUser(req);
  if (!u) return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });

  let q = supabaseAdmin.from('leads').select('respondeu, gerou_ficha, aprovou_credito, venda_concluida');

  if (u.tipo === 'vendedor' && u.vendedor_id) q = q.eq('vendedor_id', u.vendedor_id);
  else if (u.tipo === 'gerente' && u.loja) {
    const { data: vs } = await supabaseAdmin.from('vendedores').select('id').eq('loja', u.loja);
    const ids = (vs || []).map((v: any) => v.id);
    if (ids.length) q = q.in('vendedor_id', ids);
  }

  const { data, error } = await q.limit(100000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = data || [];
  return NextResponse.json({
    total_leads: rows.length,
    responderam: rows.filter((r: any) => r.respondeu).length,
    fichas_geradas: rows.filter((r: any) => r.gerou_ficha).length,
    aprovados: rows.filter((r: any) => r.aprovou_credito).length,
    vendidos: rows.filter((r: any) => r.venda_concluida).length,
  });
}
