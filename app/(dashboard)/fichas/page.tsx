'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Store, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { FichaEditDialog } from '@/components/ficha-edit-dialog';
import { useAuth } from '@/contexts/auth-context';

const statusColor: Record<string, string> = {
  aprovada: 'bg-emerald-600',
  reprovada: 'bg-rose-600',
  negada: 'bg-rose-600',
  pendente: 'bg-amber-600',
  enviada: 'bg-blue-600',
};

export default function FichasPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);

  const { data: fichas = [], isLoading } = useQuery({
    queryKey: ['fichas'],
    queryFn: async () => (await api.get('/fichas')).data,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Fichas de Credito</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.tipo === 'elfenai'
            ? 'Fichas priorizadas: clientes na loja em cima, concluidas no fundo.'
            : 'Acompanhe o status das propostas enviadas aos bancos.'}
        </p>
      </header>

      {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}

      <div className="grid gap-4 md:grid-cols-2">
        {fichas.map((f: any) => (
          <Card
            key={f.id}
            className={`cursor-pointer transition hover:border-primary/60 hover:shadow-lg ${f.comprou ? 'opacity-70' : ''}`}
            onClick={() => setSelected(f.id)}
          >
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-lg font-semibold min-w-0">
                  <FileText className="h-5 w-5 shrink-0 text-primary" />
                  <span className="truncate">{f.lead_nome || `Lead #${f.lead_id}`}</span>
                </div>
                <div className="flex gap-1">
                  {f.em_loja && !f.comprou && <Badge variant="outline" className="gap-1 border-amber-500 text-amber-400"><Store className="h-3 w-3" />Na loja</Badge>}
                  {f.comprou && <Badge className="bg-emerald-600 gap-1"><CheckCircle2 className="h-3 w-3" />Concluido</Badge>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Banco: <span className="text-foreground">{f.banco_contratado || '-'}</span></div>
                <div>Status: <span className="text-foreground">{f.status_geral || 'pendente'}</span></div>
                {f.carro && <div className="col-span-2">Veiculo: <span className="text-foreground">{f.carro} {f.ano_carro || ''}</span></div>}
                {f.valor_liberado > 0 && user?.tipo !== 'vendedor' && (
                  <div>Liberado: <span className="text-foreground">R$ {Number(f.valor_liberado).toLocaleString('pt-BR')}</span></div>
                )}
                {f.bancos?.length > 0 && (
                  <div className="col-span-2 flex flex-wrap gap-1 pt-1">
                    {f.bancos.map((b: any) => (
                      <Badge key={b.id} className={`${statusColor[b.status ?? 'pendente']} text-xs`}>{b.banco} {b.status}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && fichas.length === 0 && (
        <div className="text-center text-muted-foreground py-10">Nenhuma ficha encontrada.</div>
      )}

      <FichaEditDialog fichaId={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
