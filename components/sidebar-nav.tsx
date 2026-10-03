'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Car, LayoutDashboard, MessageSquare, Target, FileText,
  CheckSquare, ArrowRightLeft, PlusCircle, LogOut, UserCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/estoque', label: 'Estoque', icon: Car },
  { href: '/painel', label: 'Painel de Leads', icon: LayoutDashboard, highlight: true },
  { href: '/novo-lead', label: 'Adicionar novo lead', icon: PlusCircle },
  { href: '/chat', label: 'Central de Chat', icon: MessageSquare },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/fichas', label: 'Fichas de Credito', icon: FileText },
  { href: '/tarefas', label: 'Tarefas', icon: CheckSquare },
  { href: '/processos', label: 'Processos de Transferencia', icon: ArrowRightLeft },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-border bg-card px-4 py-6 sticky top-0">
      <div className="flex items-center gap-2 px-2">
        <UserCircle2 className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">Logado como</span>
      </div>
      <div className="mt-2 px-2">
        <div className="text-lg font-semibold capitalize">{user?.login ?? '-'}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Perfil: <span className="uppercase">{user?.tipo ?? '-'}</span>
        </div>
      </div>
      <Button variant="outline" className="mt-4" onClick={logout}>
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>

      <Separator className="my-6" />
      <div className="px-2 text-sm font-medium text-muted-foreground">Navegacao</div>

      <nav className="mt-3 flex flex-col gap-2">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  active && 'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 text-center text-xs text-muted-foreground">
        Project Manu  v0.1
      </div>
    </aside>
  );
}
