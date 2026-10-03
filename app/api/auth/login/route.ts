import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword } from '@/lib/password';
import { signSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { login, senha } = await req.json();
    if (!login) return NextResponse.json({ error: 'Login obrigatorio' }, { status: 400 });

    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, login, tipo, vendedor_id, loja, ativo, senha_hash')
      .eq('login', login)
      .eq('ativo', true)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!user) return NextResponse.json({ error: 'Usuario ou senha invalidos' }, { status: 401 });
    if (!verifyPassword(senha ?? '', user.senha_hash)) {
      return NextResponse.json({ error: 'Usuario ou senha invalidos' }, { status: 401 });
    }

    const payload = {
      id: user.id, login: user.login, tipo: user.tipo,
      vendedor_id: user.vendedor_id, loja: user.loja, ativo: user.ativo,
    };
    const token = signSession(payload);
    return NextResponse.json({ access_token: token, token_type: 'bearer', user: payload });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 });
  }
}
