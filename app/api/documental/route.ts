// Documental - fichas com venda concluida, com progresso de transferencia/firma/documento
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireUser, can } from '@/lib/session';

export async function GET(req: NextRequest) {
  const u = await requireUser(req);
  if (!u) return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });
  if (!can.verDocumental(u)) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });

  let q = supabaseAdmin
    .from('fichas_credito')
    .select('*, lead:leads(id,nome_lead,cpf,telefone,carro_selecionado,ano_carro,placa_carro,valor_carro,venda_concluida,data_venda,vendedor_id), processo:processos_transferencia(*), vendedor:vendedores!fichas_credito_vendedor_id_fkey(nome,loja)')
    .eq('comprou', true)
    .order('data_compra', { ascending: false });

  if (u.tipo === 'vendedor' && u.vendedor_id) q = q.eq('vendedor_id', u.vendedor_id);
  else if (u.tipo === 'gerente' && u.loja) {
    const { data: vs } = await supabaseAdmin.from('vendedores').select('id').eq('loja', u.loja);
    const ids = (vs || []).map((v: any) => v.id);
    if (ids.length) q = q.in('vendedor_id', ids);
  }

  const { data, error } = await q.limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
