import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  const u = await requireUser(req);
  if (!u) return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filtro = searchParams.get('filtro') || 'todos';
  const periodo = searchParams.get('periodo') || 'todas';
  const busca = searchParams.get('busca') || '';
  const vendedorIdParam = searchParams.get('vendedor_id');
  const limit = parseInt(searchParams.get('limit') || '200', 10);

  let q = supabaseAdmin
    .from('leads')
    .select('*, vendedor:vendedores!leads_vendedor_id_fkey(id,nome,loja)')
    .order('data_lead', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit);

  // RBAC
  if (u.tipo === 'vendedor' && u.vendedor_id) {
    q = q.eq('vendedor_id', u.vendedor_id);
  } else if (u.tipo === 'gerente' && u.loja) {
    const { data: vs } = await supabaseAdmin.from('vendedores').select('id').eq('loja', u.loja);
    const ids = (vs || []).map((v: any) => v.id);
    if (ids.length) q = q.in('vendedor_id', ids);
    if (vendedorIdParam) q = q.eq('vendedor_id', Number(vendedorIdParam));
  }

  if (filtro === 'responderam') q = q.eq('respondeu', true);
  else if (filtro === 'nao_responderam') q = q.eq('respondeu', false);
  else if (filtro === 'fichas') q = q.eq('gerou_ficha', true);
  else if (filtro === 'aprovados') q = q.eq('aprovou_credito', true);
  else if (filtro === 'vendidos') q = q.eq('venda_concluida', true);

  if (periodo !== 'todas') {
    const now = new Date();
    let from = new Date();
    if (periodo === 'hoje') from.setHours(0, 0, 0, 0);
    else if (periodo === 'semana') from.setDate(now.getDate() - 7);
    else if (periodo === 'mes') from.setDate(1);
    q = q.gte('data_lead', from.toISOString().slice(0, 10));
  }

  if (busca) {
    q = q.or(`nome_lead.ilike.%${busca}%,telefone.ilike.%${busca}%,cpf.ilike.%${busca}%,observacao.ilike.%${busca}%`);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const leads = (data || []).map((r: any) => ({
    ...r,
    vendedor_nome: r.vendedor?.nome ?? null,
    vendedor_loja: r.vendedor?.loja ?? null,
    aprovado: r.aprovou_credito,
  }));
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const u = await requireUser(req);
  if (!u) return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });
  const body = await req.json();

  if (u.tipo === 'vendedor') body.vendedor_id = u.vendedor_id;

  const payload: any = {
    data_lead: body.data_lead || new Date().toISOString().slice(0, 10),
    vendedor_id: body.vendedor_id,
    nome_lead: body.nome_lead,
    telefone: body.telefone || null,
    cpf: body.cpf || null,
    produto_interesse: body.produto_interesse || null,
    observacao: body.observacao || null,
    gerou_ficha: !!body.gerou_ficha,
    respondeu: !!body.respondeu,
    em_loja: !!body.em_loja,
  };
  const { data, error } = await supabaseAdmin.from('leads').insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.gerou_ficha) {
    await supabaseAdmin.from('fichas_credito').insert({
      lead_id: data.id, vendedor_id: data.vendedor_id, criado_por_id: u.id,
    });
  }
  return NextResponse.json(data);
}
