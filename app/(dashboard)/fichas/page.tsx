'use client';
// Fichas de credito
// TODO: REPLACE_WITH_API - substituir MOCK_FICHAS por fichasService.list()
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { MOCK_FICHAS } from '@/lib/mock-data';

const statusColor: Record<string, string> = {
  aprovada: 'bg-emerald-600',
  reprovada: 'bg-rose-600',
  pendente: 'bg-amber-600',
  enviada: 'bg-blue-600',
};

export default function FichasPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Fichas de Credito</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acompanhe o status das propostas enviadas aos bancos.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_FICHAS.map((f) => (
          <Card key={f.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5 text-primary" />
                  {f.lead_nome}
                </div>
                <Badge className={`${statusColor[f.status ?? 'pendente']} hover:${statusColor[f.status ?? 'pendente']} uppercase`}>
                  {f.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Banco: <span className="text-foreground">{f.banco}</span></div>
                <div>Parcelas: <span className="text-foreground">{f.parcelas}x</span></div>
                <div>Entrada: <span className="text-foreground">R$ {f.entrada?.toLocaleString('pt-BR')}</span></div>
                <div>Financiado: <span className="text-foreground">R$ {f.valor_financiado?.toLocaleString('pt-BR')}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
