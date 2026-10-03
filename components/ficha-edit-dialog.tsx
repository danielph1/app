'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Role } from '@/lib/roles';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const BANCOS = ['Itau', 'BV', 'Creditas', 'Bradesco', 'Pan', 'Safra', 'Santander'];
const STATUS = [
  { v: 'pendente', l: 'Pendente' },
  { v: 'aprovada', l: 'Aprovada' },
  { v: 'negada', l: 'Negada' },
];

export function FichaEditDialog({ fichaId, onClose }: { fichaId: number | null; onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [data, setData] = useState<any>(null);
  const [bancos, setBancos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fichaId) { setData(null); return; }
    api.get(`/fichas/${fichaId}`).then((r) => {
      setData(r.data);
      setBancos(r.data.bancos || []);
    });
  }, [fichaId]);

  if (!fichaId || !data) return (
    <Dialog open={!!fichaId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent><div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div></DialogContent>
    </Dialog>
  );

  const canEdit = Role.editarFichaBanco(user);
  const vendedorReadOnly = user?.tipo === 'vendedor';
  const lead = data.lead || {};

  async function save(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/fichas/${fichaId}`, {
        status_geral: data.status_geral,
        banco_contratado: data.banco_contratado,
        valor_liberado: Number(data.valor_liberado) || 0,
        valor_veiculo: Number(data.valor_veiculo) || 0,
        entrada_total: Number(data.entrada_total) || 0,
        entrada_paga: Number(data.entrada_paga) || 0,
        valor_pendente: Number(data.valor_pendente) || 0,
        gerou_boleto: !!data.gerou_boleto,
        boleto_valor: Number(data.boleto_valor) || 0,
        boleto_meses: Number(data.boleto_meses) || 0,
        boleto_total: Number(data.boleto_total) || 0,
        bancos,
      });
      toast.success('Ficha atualizada');
      qc.invalidateQueries({ queryKey: ['fichas'] });
      qc.invalidateQueries({ queryKey: ['metricas'] });
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Erro ao salvar');
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={!!fichaId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ficha de credito #{fichaId}  {lead.nome_lead}</DialogTitle>
        </DialogHeader>

        <form onSubmit={save} className="space-y-5">
          {/* Dados do vendedor (sempre read-only aqui) */}
          <div>
            <div className="mb-2 text-sm font-medium text-muted-foreground">Dados preenchidos pelo vendedor</div>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <ReadOnly label="Nome completo" value={lead.nome_completo || lead.nome_lead} />
              <ReadOnly label="CPF" value={lead.cpf} />
              <ReadOnly label="Telefone" value={lead.telefone} />
              <ReadOnly label="Veiculo" value={lead.carro_selecionado} />
              <ReadOnly label="Ano" value={lead.ano_carro} />
              <ReadOnly label="Placa" value={lead.placa_carro} />
              <ReadOnly label="Valor do carro" value={lead.valor_carro && `R$ ${Number(lead.valor_carro).toLocaleString('pt-BR')}`} />
              <ReadOnly label="Valor entrada" value={lead.valor_entrada && `R$ ${Number(lead.valor_entrada).toLocaleString('pt-BR')}`} />
              <ReadOnly label="Habilitado" value={lead.habilitado ? 'Sim' : 'Nao'} />
              <ReadOnly label="Nome do pai" value={lead.nome_pai} />
              <ReadOnly label="Nome da mae" value={lead.nome_mae} />
              <ReadOnly label="RG" value={lead.rg} />
              <ReadOnly label="Empresa" value={lead.empresa} />
              <ReadOnly label="Salario" value={lead.salario && `R$ ${Number(lead.salario).toLocaleString('pt-BR')}`} />
              <ReadOnly label="Banco corrente" value={lead.banco_correntista} />
            </div>
          </div>

          <Separator />

          {vendedorReadOnly ? (
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Resposta do ElfenAI (read-only)</div>
              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <ReadOnly label="Banco contratado" value={data.banco_contratado} />
                <ReadOnly label="Status" value={data.status_geral} />
                {data.bancos?.map((b: any) => (
                  <ReadOnly key={b.id} label={`Parcela ${b.banco}`} value={b.parcela_48 ? `48x R$ ${Number(b.parcela_48).toLocaleString('pt-BR')}` : (b.parcela_60 ? `60x R$ ${Number(b.parcela_60).toLocaleString('pt-BR')}` : '-')} />
                ))}
                {data.gerou_boleto && <>
                  <ReadOnly label="Boleto valor" value={`R$ ${Number(data.boleto_valor || 0).toLocaleString('pt-BR')}`} />
                  <ReadOnly label="Boleto meses" value={data.boleto_meses} />
                </>}
              </div>
            </div>
          ) : (
            <>
              {/* Editavel por ElfenAI/Gerente */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">Bancos  o ElfenAI preenche aqui</div>
                  <Button type="button" size="sm" variant="outline" onClick={() => setBancos([...bancos, { banco: '', status: 'pendente' }])}>
                    <Plus className="mr-1 h-3 w-3" />Adicionar banco
                  </Button>
                </div>
                <div className="space-y-3">
                  {bancos.map((b, i) => (
                    <div key={i} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-6">
                      <div className="md:col-span-2">
                        <Label className="text-xs">Banco</Label>
                        <Select value={b.banco || ''} onValueChange={(v) => setBancos(bancos.map((x, j) => j === i ? { ...x, banco: v } : x))}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>{BANCOS.map((bb) => <SelectItem key={bb} value={bb}>{bb}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select value={b.status || 'pendente'} onValueChange={(v) => setBancos(bancos.map((x, j) => j === i ? { ...x, status: v } : x))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-xs">Valor liberado</Label><Input type="number" value={b.valor_financiado ?? ''} onChange={(e) => setBancos(bancos.map((x, j) => j === i ? { ...x, valor_financiado: e.target.value } : x))} /></div>
                      <div><Label className="text-xs">Parcela 48x</Label><Input type="number" value={b.parcela_48 ?? ''} onChange={(e) => setBancos(bancos.map((x, j) => j === i ? { ...x, parcela_48: e.target.value } : x))} /></div>
                      <div><Label className="text-xs">Parcela 60x</Label><Input type="number" value={b.parcela_60 ?? ''} onChange={(e) => setBancos(bancos.map((x, j) => j === i ? { ...x, parcela_60: e.target.value } : x))} /></div>
                      <div className="md:col-span-5"><Label className="text-xs">Observacao</Label><Input value={b.observacao ?? ''} onChange={(e) => setBancos(bancos.map((x, j) => j === i ? { ...x, observacao: e.target.value } : x))} /></div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setBancos(bancos.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
              <div>
                <div className="mb-2 text-sm font-medium text-muted-foreground">Resumo contratado</div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div><Label className="text-xs">Banco contratado</Label>
                    <Select value={data.banco_contratado || ''} onValueChange={(v) => setData({ ...data, banco_contratado: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{BANCOS.map((bb) => <SelectItem key={bb} value={bb}>{bb}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Status geral</Label>
                    <Select value={data.status_geral || 'pendente'} onValueChange={(v) => setData({ ...data, status_geral: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Valor liberado</Label><Input type="number" value={data.valor_liberado ?? ''} onChange={(e) => setData({ ...data, valor_liberado: e.target.value })} /></div>
                  <div><Label className="text-xs">Valor veiculo</Label><Input type="number" value={data.valor_veiculo ?? ''} onChange={(e) => setData({ ...data, valor_veiculo: e.target.value })} /></div>
                  <div><Label className="text-xs">Entrada total</Label><Input type="number" value={data.entrada_total ?? ''} onChange={(e) => setData({ ...data, entrada_total: e.target.value })} /></div>
                  <div><Label className="text-xs">Entrada paga</Label><Input type="number" value={data.entrada_paga ?? ''} onChange={(e) => setData({ ...data, entrada_paga: e.target.value })} /></div>
                </div>
                <div className="mt-3 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!data.gerou_boleto} onCheckedChange={(v) => setData({ ...data, gerou_boleto: !!v })} />
                    <Label>Gerou boleto</Label>
                  </div>
                  {data.gerou_boleto && (<>
                    <div><Label className="text-xs">Valor</Label><Input className="w-32" type="number" value={data.boleto_valor ?? ''} onChange={(e) => setData({ ...data, boleto_valor: e.target.value })} /></div>
                    <div><Label className="text-xs">Meses</Label><Input className="w-24" type="number" value={data.boleto_meses ?? ''} onChange={(e) => setData({ ...data, boleto_meses: e.target.value })} /></div>
                    <div><Label className="text-xs">Total</Label><Input className="w-32" type="number" value={data.boleto_total ?? ''} onChange={(e) => setData({ ...data, boleto_total: e.target.value })} /></div>
                  </>)}
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Fechar</Button>
            {canEdit && (
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar e devolver ao vendedor
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReadOnly({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value || <span className="text-muted-foreground/60">-</span>}</div>
    </div>
  );
}
