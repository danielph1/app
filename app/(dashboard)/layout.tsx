'use client';
import { ProtectedRoute } from '@/components/protected-route';
import { SidebarNav } from '@/components/sidebar-nav';
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <main className="flex-1 overflow-x-hidden px-8 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
