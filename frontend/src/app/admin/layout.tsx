'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Aprobación Enfermeros', icon: UserCheck, href: '/admin/nurses' },
    { label: 'Pacientes', icon: Users, href: '/admin/patients' },
    { label: 'Ajustes', icon: Settings, href: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login/admin');
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
    <div className="flex h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700/50">
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4DB4D7] flex items-center justify-center">
              <span className="text-white text-lg leading-none">S</span>
            </div>
            SERSA <span className="text-sm font-normal text-[#4DB4D7]">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-[#4DB4D7]/10 text-[#4DB4D7]" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium w-full hover:bg-slate-800 hover:text-rose-400 text-slate-400"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
    </AuthGuard>
  );
}
