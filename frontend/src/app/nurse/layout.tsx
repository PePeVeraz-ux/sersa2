import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['nurse']}>
      <div className="min-h-screen bg-mesh text-slate-900 selection:bg-sky-100 selection:text-sky-900">
        <Sidebar role="nurse" />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
