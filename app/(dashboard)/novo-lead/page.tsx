'use client';
// Adicionar novo lead - formulario (ainda nao conectado)
// TODO: REPLACE_WITH_API - no onSubmit chamar leadsService.create(payload)
import { useState, type FormEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NovoLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome_lead: '', telefone: '', cpf: '', produto_interesse: '', observacao: '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: REPLACE_WITH_API
    // await leadsService.create(form);
    toast.success('Lead criado (mock)!');
    router.push('/painel');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Novo Lead</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cadastre um novo contato recebido.</p>
      </header>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input required value={form.nome_lead} onChange={(e) => setForm({ ...form, nome_lead: e.target.value })} />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>CPF</Label>
                <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Produto de interesse</Label>
              <Input value={form.produto_interesse} onChange={(e) => setForm({ ...form, produto_interesse: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Observacao</Label>
              <Textarea rows={4} value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Salvar lead</Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
