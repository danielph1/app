import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireUser, can } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser(req);
  if (!u) return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('fichas_credito')
    .select('*, lead:leads(*), bancos:ficha_bancos(*), avalistas:ficha_anexos(*)')
    .eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser(req);
  if (!u) return NextResponse.json({ error: 'nao autenticado' }, { status: 401 });
  if (!can.editarFichasBanco(u)) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  // ElfenAI atualiza campos do banco e marca ficha como aprovada/pendente
  const allowed = ['status_geral','banco_contratado','valor_liberado','valor_financiado','valor_entrada','entrada_total','entrada_paga','valor_pendente','gerou_boleto','boleto_valor','boleto_meses','boleto_total','valor_veiculo'];
  const payload: any = { atualizado_por_id: u.id };
  for (const k of allowed) if (k in body) payload[k] = body[k];

  const { data, error } = await supabaseAdmin.from('fichas_credito').update(payload).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Upsert bancos (array de { banco, status, valor_financiado, parcela_48, parcela_60, valor_entrada })
  if (Array.isArray(body.bancos)) {
    for (const b of body.bancos) {
      if (b.id) {
        await supabaseAdmin.from('ficha_bancos').update({
          banco: b.banco, status: b.status, valor_financiado: b.valor_financiado,
          parcela_48: b.parcela_48, parcela_60: b.parcela_60, valor_entrada: b.valor_entrada,
          observacao: b.observacao, atualizado_por_id: u.id,
        }).eq('id', b.id);
      } else {
        await supabaseAdmin.from('ficha_bancos').insert({
          ficha_id: Number(id), banco: b.banco, status: b.status, valor_financiado: b.valor_financiado,
          parcela_48: b.parcela_48, parcela_60: b.parcela_60, valor_entrada: b.valor_entrada,
          observacao: b.observacao, atualizado_por_id: u.id,
        });
      }
    }
  }

  return NextResponse.json(data);
}
