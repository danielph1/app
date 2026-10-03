'use client';
// =============================================================
// Painel de Leads - dashboard principal
// MOCK ATIVO: ver `const { data: leads } = ...` abaixo.
// TODO: REPLACE_WITH_API - trocar MOCK_LEADS por leadsService.list(filtros)
// =============================================================
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Phone, UserCircle2, CheckCircle2, XCircle } from 'lucide-react';
import { MOCK_LEADS, MOCK_PAINEL_STATS } from '@/lib/mock-data';
import type { Lead, LeadFiltros } from '@/types';
// import { leadsService } from '@/lib/services'; // TODO: REPLACE_WITH_API

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'responderam', label: 'Responderam' },
  { value: 'nao_responderam', label: 'Nao responderam' },
  { value: 'fichas', label: 'Fichas' },
  { value: 'aprovados', label: 'Aprovados' },
  { value: 'vendidos', label: 'Vendidos' },
] as const;

export default function PainelPage() {
  const [filtro, setFiltro] = useState<LeadFiltros['filtro']>('todos');
  const [periodo, setPeriodo] = useState<LeadFiltros['periodo']>('todas');
  const [busca, setBusca] = useState('');

  // TODO: REPLACE_WITH_API
  // const { data: leads = [] } = useQuery({
  //   queryKey: ['leads', { filtro, periodo, busca }],
  //   queryFn: () => leadsService.list({ filtro, periodo, busca }),
  // });
  const leads: Lead[] = MOCK_LEADS;
  const stats = MOCK_PAINEL_STATS;

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (filtro === 'responderam' && !l.respondeu) return false;
      if (filtro === 'nao_responderam' && l.respondeu) return false;
      if (filtro === 'fichas' && !l.gerou_ficha) return false;
      if (filtro === 'aprovados' && !l.aprovado) return false;
      if (filtro === 'vendidos' && !l.venda_concluida) return false;
      if (busca) {
        const q = busca.toLowerCase();
        return (
          l.nome_lead?.toLowerCase().includes(q) ||
          l.telefone?.toLowerCase().includes(q) ||
          l.cpf?.toLowerCase().includes(q) ||
          l.observacao?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, filtro, busca]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Painel de Controle</h1>
        <Link href="/novo-lead">
          <Button className="mt-4" size="lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar lead
          </Button>
        </Link>
      </header>

      <section className="space-y-4">
        <div>
          <Label className="text-base">Filtro</Label>
          <RadioGroup
            className="mt-2 flex flex-wrap gap-5"
            value={filtro}
            onValueChange={(v) => setFiltro(v as LeadFiltros['filtro'])}
          >
            {FILTROS.map((f) => (
              <div key={f.value} className="flex items-center gap-2">
                <RadioGroupItem value={f.value} id={`f-${f.value}`} />
                <Label htmlFor={`f-${f.value}`} className="cursor-pointer font-normal">{f.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="max-w-xs">
          <Label className="text-sm">Periodo da data do lead</Label>
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as LeadFiltros['periodo'])}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as datas</SelectItem>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-6 md:grid-cols-5">
        <StatCard label="Total de leads" value={stats.total_leads} />
        <StatCard label="Responderam" value={stats.responderam} />
        <StatCard label="Fichas geradas" value={stats.fichas_geradas} />
        <StatCard label="Aprovados" value={stats.aprovados} />
        <StatCard label="Vendidos" value={stats.vendidos} />
      </section>

      <section className="space-y-3">
        <Label>Buscar lead</Label>
        <Input
          placeholder="Nome, CPF, telefone ou observacao"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <Button variant="outline" className="w-full">
          <Search className="mr-2 h-4 w-4" /> Buscar
        </Button>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Leads cadastrados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Exibindo {filteredLeads.length} de {leads.length} leads. Use a busca e os filtros para encontrar um registro mais rapido.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Card className="transition hover:border-primary/50">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <UserCircle2 className="h-5 w-5 text-primary" />
          <span className="truncate">{lead.nome_lead}</span>
        </div>
        {lead.venda_concluida && (
          <Badge className="bg-emerald-600 hover:bg-emerald-600">VENDA CONCLUIDA</Badge>
        )}
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>Vendedor: <span className="text-foreground">{lead.vendedor_nome ?? '-'}</span></div>
          {lead.produto_interesse && <div>Interesse: <span className="text-foreground">{lead.produto_interesse}</span></div>}
          {lead.telefone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {lead.telefone}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <StatusChip label="Respondeu" ok={!!lead.respondeu} />
          <StatusChip label="Ficha" ok={!!lead.gerou_ficha} />
          <StatusChip label="Aprovado" ok={!!lead.aprovado} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusChip({ label, ok }: { label: string; ok: boolean }) {
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
      <Icon className="h-3 w-3" />{label}
    </div>
  );
}
