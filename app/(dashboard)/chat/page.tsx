'use client';
// Central de Chat
// TODO: REPLACE_WITH_API - substituir MOCK_CHAT_MENSAGENS por chatService.listGeral()
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { MOCK_CHAT_MENSAGENS } from '@/lib/mock-data';
import type { ChatMensagem } from '@/types';
import { useAuth } from '@/contexts/auth-context';

export default function ChatPage() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<ChatMensagem[]>(MOCK_CHAT_MENSAGENS);
  const [draft, setDraft] = useState('');

  function enviar() {
    if (!draft.trim() || !user) return;
    // TODO: REPLACE_WITH_API - chatService.enviarGeral(draft)
    setMsgs((prev) => [
      ...prev,
      { id: Date.now(), remetente_id: user.id, remetente_nome: user.login, conteudo: draft, created_at: new Date().toISOString(), lida: false },
    ]);
    setDraft('');
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col space-y-4">
      <header className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Central de Chat</h1>
      </header>

      <Card className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {msgs.map((m) => {
            const mine = m.remetente_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <div className="text-xs opacity-70">{m.remetente_nome}</div>
                  <div>{m.conteudo}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex gap-2">
        <Input placeholder="Escreva uma mensagem..." value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()} />
        <Button onClick={enviar}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
