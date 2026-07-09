'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Shield, Bell, FileText } from 'lucide-react';

const navItems = [
  { title: 'Perfil', href: '/nurse/settings', icon: User, exact: true },
  { title: 'Seguridad', href: '/nurse/settings/security', icon: Shield },
  { title: 'Notificaciones', href: '/nurse/settings/notifications', icon: Bell },
  { title: 'Documentos', href: '/nurse/settings/documents', icon: FileText },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Configuración</h2>
        <p className="text-slate-500">Administra tu cuenta y preferencias</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-64 shrink-0 border border-slate-200 rounded-xl bg-white p-4 space-y-1 shadow-sm">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
              
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                {item.title}
              </Link>
            );
          })}
        </div>
        
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
