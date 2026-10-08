'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarClock, PlusCircle, User, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const supabaseUrl = 'https://nqghtobrrvtmstowirix.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseKey);

const prioColor: Record<string, string> = {
  alta: 'bg-rose-600',
  media: 'bg-amber-600',
  baixa: 'bg-slate-600',
};

export default function TarefasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);

  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    prazo: new Date().toISOString().split('T')[0],
    responsavel_id: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    try {
      // 1. Busca tarefas
      const { data: dbTarefas, error: errTarefas } = await supabase
        .from('tarefas')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbTarefas) {
        setTarefas(dbTarefas);
      } else if (errTarefas) {
        console.warn('Aviso ao buscar tarefas (talvez a tabela não exista ainda):', errTarefas.message);
      }

      // 2. Busca vendedores de forma ampla para evitar bloqueios de filtros
      const { data: dbVendedores, error: errVendedores } = await supabase
        .from('vendedores')
        .select('*');

      if (errVendedores) {
        console.error('Erro ao buscar vendedores:', errVendedores.message);
        toast.error('Erro ao carregar vendedores do banco.');
      } else if (dbVendedores && dbVendedores.length > 0) {
        setVendedores(dbVendedores);
      } else {
        // Fallback caso a tabela retorne vazia via anon key
        setVendedores([
          { id: 1, nome: 'André' },
          { id: 2, nome: 'Armando' },
          { id: 6, nome: 'Daniel' },
          { id: 9, nome: 'Douglas' },
        ]);
      }
    } catch (err) {
      console.error('Erro geral ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCriarTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTarefa.titulo.trim()) {
      toast.error('Informe o título da tarefa.');
      return;
    }

    const vendedorSelecionado = vendedores.find(
      (v) => String(v.id) === String(novaTarefa.responsavel_id)
    );
    const responsavelNome = vendedorSelecionado?.nome || 'Não atribuído';

    const objParaSalvar = {
      titulo: novaTarefa.titulo,
      descricao: novaTarefa.descricao,
      prioridade: novaTarefa.prioridade,
      prazo: novaTarefa.prazo,
      concluida: false,
      responsavel_id: String(novaTarefa.responsavel_id),
      responsavel_nome: responsavelNome,
    };

    try {
      const { data, error } = await supabase
        .from('tarefas')
        .insert([objParaSalvar])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setTarefas([data[0], ...tarefas]);
      }

      toast.success('Tarefa criada com sucesso!');
      setIsModalOpen(false);
      setNovaTarefa({
        titulo: '',
        descricao: '',
        prioridade: 'media',
        prazo: new Date().toISOString().split('T')[0],
        responsavel_id: '',
      });
    } catch (err: any) {
      console.error('Erro ao salvar tarefa:', err);
      toast.error('Erro ao salvar tarefa no banco. Verifique se a tabela "tarefas" foi criada.');
    }
  };

  const toggleConcluida = async (id: string, statusAtual: boolean) => {
    setTarefas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, concluida: !statusAtual } : t))
    );

    try {
      await supabase
        .from('tarefas')
        .update({ concluida: !statusAtual })
        .eq('id', id);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Tarefas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie as ações do seu dia e atribua aos vendedores.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="lg" className="gap-2">
          <PlusCircle className="h-5 w-5" /> Nova Tarefa
        </Button>
      </header>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tarefas.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma tarefa cadastrada.</p>
        ) : (
          tarefas.map((t: any) => (
            <Card key={t.id} className={`transition-all ${t.concluida ? 'opacity-60 bg-muted/30' : ''}`}>
              <CardContent className="flex items-start gap-4 p-4">
                <Checkbox
                  checked={t.concluida}
                  onCheckedChange={() => toggleConcluida(t.id, t.concluida)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className={`font-medium text-base ${t.concluida ? 'line-through text-muted-foreground' : ''}`}>
                      {t.titulo}
                    </div>
                    <div className="flex items-center gap-2">
                      {t.responsavel_nome && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <User className="h-3 w-3" /> {t.responsavel_nome}
                        </Badge>
                      )}
                      <Badge className={`${prioColor[t.prioridade ?? 'baixa']} uppercase text-xs text-white`}>
                        {t.prioridade}
                      </Badge>
                    </div>
                  </div>
                  {t.descricao && <p className="text-sm text-muted-foreground">{t.descricao}</p>}
                  <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3 w-3" /> Prazo: {t.prazo}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl border space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Criar Nova Tarefa</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleCriarTarefa} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Título da Tarefa *</Label>
                <Input
                  placeholder="Ex: Ligar para cliente..."
                  value={novaTarefa.titulo}
                  onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Descrição / Detalhes</Label>
                <Textarea
                  placeholder="Informações adicionais..."
                  value={novaTarefa.descricao}
                  onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Prioridade</Label>
                  <Select
                    value={novaTarefa.prioridade}
                    onValueChange={(v) => setNovaTarefa({ ...novaTarefa, prioridade: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Prazo</Label>
                  <Input
                    type="date"
                    value={novaTarefa.prazo}
                    onChange={(e) => setNovaTarefa({ ...novaTarefa, prazo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Atribuir para Vendedor</Label>
                <Select
                  value={novaTarefa.responsavel_id}
                  onValueChange={(v) => setNovaTarefa({ ...novaTarefa, responsavel_id: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione um vendedor" /></SelectTrigger>
                  <SelectContent>
                    {vendedores.map((v: any) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Tarefa</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}