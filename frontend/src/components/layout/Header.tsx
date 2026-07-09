'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Mail, Bell, Menu, X, LogOut, Settings, HelpCircle, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { nurseNavItems, patientNavItems } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title?: string;
  // Deprecated hardcoded props for backward compatibility only, useAuth handles this now
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

export function Header({ title }: HeaderProps) {
  const pathname = usePathname();
  const isNurse = pathname.startsWith('/nurse');
  const navItems = isNurse ? nurseNavItems : patientNavItems;
  const { user, logout } = useAuth();
  const rolePrefix = isNurse ? '/nurse' : '/patient';

  // Dynamic user data
  const dynamicName = user ? (user.role === 'nurse' 
    ? `${user.nurse_profile?.first_name || ''} ${user.nurse_profile?.last_name || ''}`.trim() || 'Enfermero(a)'
    : `${user.patient_profile?.first_name || ''} ${user.patient_profile?.last_name || ''}`.trim() || 'Paciente'
  ) : 'Cargando...';

  const dynamicRole = user?.role === 'nurse' ? 'Enfermero Certificado' : 'Paciente';
  
  const getInitials = (name: string) => {
    if (!name || name === 'Cargando...' || name === 'Paciente' || name === 'Enfermero(a)') return 'US';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return 'US';
  };
  
  const dynamicInitials = getInitials(dynamicName);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close dropdowns on outside click (simple implementation)
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock Notifications
  const notifications = [
    { id: 1, title: 'Servicio Aceptado', desc: 'Tu enfermero está en camino.', time: 'Hace 5 min', unread: true },
    { id: 2, title: 'Pago Procesado', desc: 'Se ha cobrado $150.00 MXN', time: 'Hace 2 horas', unread: true },
    { id: 3, title: 'Recordatorio', desc: 'Cita programada para mañana.', time: 'Hace 1 día', unread: false },
  ];

  return (
    <header className="h-auto min-h-[5rem] bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex flex-col justify-center px-4 sm:px-8 sticky top-0 z-30 transition-all shadow-sm">
      <div className="flex items-center justify-between w-full py-4">
        
        {/* Left Side: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden sm:flex flex-col gap-1 w-full max-w-xl">
            <Breadcrumbs />
            {title && <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>}
            {!title && (
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                <Input 
                  placeholder="Buscar pacientes, citas..." 
                  className="pl-10 bg-slate-100/50 hover:bg-slate-100 focus:bg-white border-transparent focus:border-sky-500 w-full max-w-md h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-100 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-4 text-slate-500">
            <button className="hidden sm:block hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100">
              <Mail className="w-5 h-5" />
            </button>
            
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className={cn("relative p-2 transition-colors rounded-full", notificationsOpen ? "bg-sky-50 text-sky-600" : "hover:text-slate-800 hover:bg-slate-100")}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-slate-800">Notificaciones</h3>
                      <button className="text-xs text-sky-600 hover:underline font-medium">Marcar leídas</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={cn("p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer", notif.unread ? "bg-sky-50/30" : "")}>
                          <div className="flex items-start gap-3">
                            <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", notif.unread ? "bg-sky-500" : "bg-transparent")} />
                            <div>
                              <h4 className="text-sm font-semibold text-slate-800">{notif.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <span className="text-xs font-semibold text-slate-600">Ver todas</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative pl-4 sm:pl-6 border-l border-slate-200" ref={profileRef}>
            <button 
              onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
              className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center overflow-hidden border border-sky-100 text-sky-700 shadow-sm">
                <span className="font-bold text-sm">{dynamicInitials}</span>
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-bold text-slate-800 leading-tight">{dynamicName}</p>
                <p className="text-slate-500 text-xs mt-0.5">{dynamicRole}</p>
              </div>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 p-2"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-2 sm:hidden">
                    <p className="font-bold text-slate-800 text-sm">{dynamicName}</p>
                    <p className="text-slate-500 text-xs">{dynamicRole}</p>
                  </div>
                  
                  <Link href={`${rolePrefix}/settings`}>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      <User className="w-4 h-4 text-slate-400" /> Mi Perfil
                    </button>
                  </Link>
                  <Link href={`${rolePrefix}/settings`}>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" /> Configuración
                    </button>
                  </Link>
                  <Link href={`${rolePrefix}/support`}>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      <HelpCircle className="w-4 h-4 text-slate-400" /> Ayuda y Soporte
                    </button>
                  </Link>
                  
                  <div className="h-px bg-slate-100 my-2" />
                  
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Breadcrumbs/Search (shows below on small screens) */}
      <div className="sm:hidden w-full pb-4 flex flex-col gap-2 border-t border-slate-100 pt-3">
        <Breadcrumbs />
        {!title && (
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10 bg-slate-100/50 h-10 rounded-xl w-full text-sm"
            />
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Image src="/logoSERSA.png" alt="SERSA" width={150} height={50} className="object-contain scale-110 origin-left -ml-2" priority />
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all",
                        isActive ? "text-sky-700 bg-sky-50" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-sky-600" : "text-slate-400")} />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
