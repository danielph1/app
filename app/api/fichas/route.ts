import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  const u = await requireUser(req);
  if (!u) return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });

  let q = supabaseAdmin
    .from('fichas_credito')
    .select('*, lead:leads(id,nome_lead,telefone,cpf,em_loja,cliente_na_loja,data_lead,valor_carro,carro_selecionado,ano_carro,placa_carro,venda_concluida,comprou:venda_concluida), bancos:ficha_bancos(*)')
    .order('created_at', { ascending: true });

  // RBAC: vendedor só ve as proprias; gerente, so da loja; elfenai, tudo
  if (u.tipo === 'vendedor' && u.vendedor_id) {
    q = q.eq('vendedor_id', u.vendedor_id);
  } else if (u.tipo === 'gerente' && u.loja) {
    const { data: vs } = await supabaseAdmin.from('vendedores').select('id').eq('loja', u.loja);
    const ids = (vs || []).map((v: any) => v.id);
    if (ids.length) q = q.in('vendedor_id', ids);
  }

  const { data, error } = await q.limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data || []).map((f: any) => ({
    ...f,
    lead_nome: f.lead?.nome_lead,
    telefone: f.lead?.telefone,
    cpf: f.lead?.cpf,
    em_loja: !!f.lead?.em_loja || !!f.lead?.cliente_na_loja,
    comprou: !!f.lead?.venda_concluida || !!f.comprou,
    carro: f.lead?.carro_selecionado,
    ano_carro: f.lead?.ano_carro,
    placa_carro: f.lead?.placa_carro,
    valor_carro: f.lead?.valor_carro,
    data_lead: f.lead?.data_lead,
  }));

  // Ordem especial para ElfenAI: em_loja primeiro, comprou no fundo, mais antigo no topo
  if (u.tipo === 'elfenai') {
    rows.sort((a: any, b: any) => {
      // comprou vai para o fundo
      if (a.comprou !== b.comprou) return a.comprou ? 1 : -1;
      // em_loja vai pra cima
      if (a.em_loja !== b.em_loja) return a.em_loja ? -1 : 1;
      // chegou primeiro no topo (created_at asc)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }

  return NextResponse.json(rows);
}
