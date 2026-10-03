'use client';
// Estoque - lista de carros
// TODO: REPLACE_WITH_API - substituir MOCK_ESTOQUE por estoqueService.list()
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Car, PlusCircle, Search } from 'lucide-react';
import { MOCK_ESTOQUE } from '@/lib/mock-data';

export default function EstoquePage() {
  const [q, setQ] = useState('');
  const carros = MOCK_ESTOQUE.filter((c) =>
    `${c.modelo} ${c.marca} ${c.cor} ${c.placa}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Estoque</h1>
          <p className="mt-1 text-sm text-muted-foreground">Veiculos disponiveis em sua loja.</p>
        </div>
        <Button><PlusCircle className="mr-2 h-4 w-4" />Novo veiculo</Button>
      </header>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por modelo, placa, cor..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {carros.map((c) => (
          <Card key={c.id} className="transition hover:border-primary/50">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Car className="h-5 w-5 text-primary" />
                  <span>{c.marca} {c.modelo}</span>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Ano: <span className="text-foreground">{c.ano}</span></div>
                <div>Cor: <span className="text-foreground">{c.cor}</span></div>
                <div>KM: <span className="text-foreground">{c.km?.toLocaleString('pt-BR')}</span></div>
                <div>Placa: <span className="text-foreground font-mono">{c.placa}</span></div>
              </div>
              <div className="text-2xl font-bold text-primary">
                R$ {c.preco?.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    disponivel: 'bg-emerald-600',
    reservado: 'bg-amber-600',
    vendido: 'bg-rose-600',
  };
  const label = status === 'disponivel' ? 'DISPONIVEL' : status === 'reservado' ? 'RESERVADO' : 'VENDIDO';
  return <Badge className={`${map[status ?? 'disponivel']} hover:${map[status ?? 'disponivel']}`}>{label}</Badge>;
}
