// Metricas financeiras - apenas gerente/admin
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireUser, can } from '@/lib/session';

export async function GET(req: NextRequest) {
  const u = await requireUser(req);
  if (!u) return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });
  if (!can.verMetricas(u)) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });

  let vIdsFilter: number[] | null = null;
  if (u.tipo === 'gerente' && u.loja) {
    const { data: vs } = await supabaseAdmin.from('vendedores').select('id').eq('loja', u.loja);
    vIdsFilter = (vs || []).map((v: any) => v.id);
  }

  // Funil: leads totais, responderam, fichas, aprovados, vendidos
  let lq = supabaseAdmin.from('leads').select('respondeu, gerou_ficha, aprovou_credito, venda_concluida');
  if (vIdsFilter) lq = lq.in('vendedor_id', vIdsFilter);
  const { data: leads } = await lq.limit(100000);
  const lrows = leads || [];

  const funil = {
    leads: lrows.length,
    responderam: lrows.filter((r: any) => r.respondeu).length,
    fichas: lrows.filter((r: any) => r.gerou_ficha).length,
    aprovados: lrows.filter((r: any) => r.aprovou_credito).length,
    vendidos: lrows.filter((r: any) => r.venda_concluida).length,
  };

  // Financeiro: valor_veiculo, valor_liberado, entrada_total, valor_pendente das fichas vendidas
  let fq = supabaseAdmin.from('fichas_credito').select('valor_veiculo, valor_liberado, entrada_total, entrada_paga, valor_pendente, comprou, status_geral, boleto_total');
  if (vIdsFilter) fq = fq.in('vendedor_id', vIdsFilter);
  const { data: fichas } = await fq.limit(100000);
  const frows = fichas || [];

  const vendidas = frows.filter((f: any) => f.comprou);
  const financeiro = {
    valor_bruto: vendidas.reduce((s: number, f: any) => s + Number(f.valor_liberado || 0) + Number(f.entrada_paga || 0), 0),
    valor_liberado: vendidas.reduce((s: number, f: any) => s + Number(f.valor_liberado || 0), 0),
    entrada_paga: vendidas.reduce((s: number, f: any) => s + Number(f.entrada_paga || 0), 0),
    valor_pendente: vendidas.reduce((s: number, f: any) => s + Number(f.valor_pendente || 0), 0),
    total_boletos: vendidas.reduce((s: number, f: any) => s + Number(f.boleto_total || 0), 0),
    clientes_com_boleto: vendidas.filter((f: any) => Number(f.boleto_total || 0) > 0).length,
  };

  // Por banco
  let bq = supabaseAdmin.from('ficha_bancos').select('banco, status, ficha:fichas_credito(vendedor_id)');
  const { data: bancos } = await bq.limit(100000);
  const brows = (bancos || []).filter((b: any) => !vIdsFilter || vIdsFilter.includes(b.ficha?.vendedor_id));
  const porBanco: Record<string, any> = {};
  for (const b of brows) {
    const nm = b.banco || 'Sem banco';
    if (!porBanco[nm]) porBanco[nm] = { banco: nm, fichas: 0, aprovadas: 0, negadas: 0, pendentes: 0 };
    porBanco[nm].fichas++;
    if (b.status === 'aprovada') porBanco[nm].aprovadas++;
    else if (b.status === 'negada' || b.status === 'reprovada') porBanco[nm].negadas++;
    else porBanco[nm].pendentes++;
  }

  return NextResponse.json({ funil, financeiro, por_banco: Object.values(porBanco) });
}
