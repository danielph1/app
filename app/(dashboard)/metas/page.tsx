'use client';
// Metas - progresso de vendedores
// TODO: REPLACE_WITH_API - substituir MOCK_METAS por metasService.list()
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { MOCK_METAS } from '@/lib/mock-data';

export default function MetasPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Metas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acompanhe o atingimento mensal da equipe.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_METAS.map((m) => {
          const pctVendas = Math.min(100, Math.round(((m.realizado_vendas ?? 0) / m.meta_vendas) * 100));
          const pctFichas = Math.min(100, Math.round(((m.realizado_fichas ?? 0) / m.meta_fichas) * 100));
          return (
            <Card key={m.id}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <div className="text-lg font-semibold capitalize">{m.vendedor_nome}</div>
                  <div className="ml-auto text-xs text-muted-foreground">{m.mes}/{m.ano}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vendas</span>
                    <span className="font-medium">{m.realizado_vendas}/{m.meta_vendas}  {pctVendas}%</span>
                  </div>
                  <Progress value={pctVendas} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fichas</span>
                    <span className="font-medium">{m.realizado_fichas}/{m.meta_fichas}  {pctFichas}%</span>
                  </div>
                  <Progress value={pctFichas} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
