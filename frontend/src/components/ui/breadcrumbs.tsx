'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  // If we are at the root or just the role root (e.g. /patient or /nurse) don't show complex breadcrumbs
  if (paths.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
      <Link href={`/${paths[0]}/dashboard`} className="hover:text-sky-600 transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      
      {paths.slice(1).map((path, index) => {
        const href = `/${paths.slice(0, index + 2).join('/')}`;
        const isLast = index === paths.length - 2;
        
        // Beautiful formatting for path segments
        const pathTranslations: Record<string, string> = {
          'dashboard': 'Inicio',
          'catalog': 'Catálogo',
          'appointments': 'Mis Citas',
          'history': 'Historial Clínico',
          'payments': 'Billetera y Pagos',
          'schedule': 'Mi Agenda',
          'addresses': 'Mis Direcciones',
          'messages': 'Mensajes',
          'reports': 'Reportes',
          'routes': 'Rutas',
          'patients': 'Mis Pacientes',
          'settings': 'Configuración',
          'support': 'Ayuda y Soporte',
          'details': 'Detalles',
          'documents': 'Documentos',
          'security': 'Seguridad',
          'notifications': 'Notificaciones',
        };
        
        const title = pathTranslations[path] || (path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '));

        return (
          <div key={path} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-slate-300" />
            {isLast ? (
              <span className="font-semibold text-slate-900">{title}</span>
            ) : (
              <Link href={href} className="hover:text-sky-600 transition-colors">
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
