'use client';
// Processos de transferencia de leads
// TODO: REPLACE_WITH_API - substituir MOCK_PROCESSOS por processosService.list()
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowRightLeft } from 'lucide-react';
import { MOCK_PROCESSOS } from '@/lib/mock-data';

const statusColor: Record<string, string> = {
  pendente: 'bg-amber-600',
  aprovado: 'bg-emerald-600',
  recusado: 'bg-rose-600',
};

export default function ProcessosPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Processos de Transferencia</h1>
        <p className="mt-1 text-sm text-muted-foreground">Historico e solicitacoes de reatribuicao de leads.</p>
      </header>
      <div className="space-y-3">
        {MOCK_PROCESSOS.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center gap-4 p-5">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="font-semibold">Lead: {p.lead_nome}</div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{p.vendedor_origem}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="capitalize">{p.vendedor_destino}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Motivo: {p.motivo}</div>
              </div>
              <Badge className={`${statusColor[p.status ?? 'pendente']} hover:${statusColor[p.status ?? 'pendente']} uppercase`}>{p.status}</Badge>
              {p.status === 'pendente' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Aprovar</Button>
                  <Button size="sm" variant="ghost">Recusar</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
