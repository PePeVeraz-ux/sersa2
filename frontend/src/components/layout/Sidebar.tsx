'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Map,
  FileText,
  MessageSquare,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  BookOpen,
  MapPin,
  History,
  Accessibility,
  X,
  Plus,
  Minus,
  Eye,
  Type
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

interface SidebarProps {
  role: 'nurse' | 'patient';
}

export const nurseNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/nurse/dashboard', icon: LayoutDashboard },
  { title: 'Mi Agenda', href: '/nurse/schedule', icon: CalendarDays },
  { title: 'Mis Pacientes', href: '/nurse/patients', icon: Users },
  { title: 'Rutas', href: '/nurse/routes', icon: Map },
  { title: 'Reportes', href: '/nurse/reports', icon: FileText },
  { title: 'Mensajes', href: '/nurse/messages', icon: MessageSquare },
  { title: 'Pagos', href: '/nurse/payments', icon: CreditCard },
];

export const patientNavItems: NavItem[] = [
  { title: 'Inicio', href: '/patient/dashboard', icon: Home },
  { title: 'Catálogo', href: '/patient/catalog', icon: BookOpen },
  { title: 'Mis Citas', href: '/patient/appointments', icon: CalendarDays },
  { title: 'Direcciones', href: '/patient/addresses', icon: MapPin },
  { title: 'Historial', href: '/patient/history', icon: History },
  { title: 'Mensajes', href: '/patient/messages', icon: MessageSquare },
  { title: 'Pagos', href: '/patient/payments', icon: CreditCard },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const items = role === 'nurse' ? nurseNavItems : patientNavItems;
  const [a11yOpen, setA11yOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  const changeFontSize = (delta: number) => {
    const next = Math.min(150, Math.max(75, fontSize + delta));
    setFontSize(next);
    document.documentElement.style.fontSize = `${next}%`;
  };

  const toggleContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle('high-contrast');
  };

  return (
    <>
      <aside className="hidden md:flex w-64 border-r border-slate-200/60 bg-white/60 backdrop-blur-xl h-screen flex-col fixed left-0 top-0 z-40 transition-all shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        <div className="pt-6 pb-2 px-6 flex items-center justify-center">
          <Image src="/logoSERSA.png" alt="SERSA" width={180} height={60} className="object-contain scale-110 origin-left" priority />
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "text-sky-700 bg-sky-50 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-r-full" />
                )}
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Accessibility Button */}
        <div className="px-6 py-4">
          <button
            onClick={() => setA11yOpen(true)}
            className="w-10 h-10 bg-[#4DB4D7] rounded-full text-white flex items-center justify-center shadow-lg hover:bg-[#3ba0c2] transition-all hover:scale-110 active:scale-95"
          >
            <Accessibility className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-t space-y-1">
          <Link href={`/${role}/settings`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            Configuración
          </Link>
          <Link href={`/${role}/support`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            Ayuda y Soporte
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Accessibility Modal */}
      <AnimatePresence>
        {a11yOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={() => setA11yOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-blue-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4DB4D7] rounded-xl flex items-center justify-center text-white">
                    <Accessibility className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">Accesibilidad</h2>
                </div>
                <button
                  onClick={() => setA11yOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Font Size Control */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Type className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tamaño de Texto</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <button
                      onClick={() => changeFontSize(-10)}
                      disabled={fontSize <= 75}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <div className="text-2xl font-black text-slate-900">{fontSize}%</div>
                      <div className="text-xs text-slate-400 font-medium">
                        {fontSize === 100 ? 'Normal' : fontSize < 100 ? 'Reducido' : 'Ampliado'}
                      </div>
                    </div>
                    <button
                      onClick={() => changeFontSize(10)}
                      disabled={fontSize >= 150}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* High Contrast Toggle */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Alto Contraste</span>
                  </div>
                  <button
                    onClick={toggleContrast}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                      highContrast
                        ? "bg-slate-900 text-white border-slate-700"
                        : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                    )}
                  >
                    <span className="font-bold text-sm">{highContrast ? 'Activado' : 'Desactivado'}</span>
                    <div className={cn(
                      "w-12 h-7 rounded-full flex items-center transition-all p-1",
                      highContrast ? "bg-[#4DB4D7] justify-end" : "bg-slate-300 justify-start"
                    )}>
                      <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                    </div>
                  </button>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setFontSize(100);
                    setHighContrast(false);
                    document.documentElement.style.fontSize = '100%';
                    document.documentElement.classList.remove('high-contrast');
                  }}
                  className="w-full text-center text-sm text-slate-500 hover:text-sky-600 font-medium py-2 transition-colors"
                >
                  Restablecer valores predeterminados
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
