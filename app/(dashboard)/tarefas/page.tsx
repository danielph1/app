'use client';
// Tarefas
// TODO: REPLACE_WITH_API - substituir MOCK_TAREFAS por tarefasService.list()
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarClock } from 'lucide-react';
import { MOCK_TAREFAS } from '@/lib/mock-data';
import { useState } from 'react';

const prioColor: Record<string, string> = {
  alta: 'bg-rose-600',
  media: 'bg-amber-600',
  baixa: 'bg-slate-600',
};

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState(MOCK_TAREFAS);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Tarefas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Organize as proximas acoes do seu dia.</p>
      </header>
      <div className="space-y-3">
        {tarefas.map((t) => (
          <Card key={t.id} className={t.concluida ? 'opacity-60' : ''}>
            <CardContent className="flex items-start gap-4 p-4">
              <Checkbox
                checked={t.concluida}
                onCheckedChange={(v) =>
                  setTarefas((prev) => prev.map((x) => (x.id === t.id ? { ...x, concluida: !!v } : x)))
                }
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`font-medium ${t.concluida ? 'line-through' : ''}`}>{t.titulo}</div>
                  <Badge className={`${prioColor[t.prioridade ?? 'baixa']} hover:${prioColor[t.prioridade ?? 'baixa']} uppercase text-xs`}>{t.prioridade}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.descricao}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" /> Prazo: {t.prazo}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
