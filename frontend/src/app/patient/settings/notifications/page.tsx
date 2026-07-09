'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function PatientNotificationsSettings() {
  const [prefs, setPrefs] = useState({
    citasConfirmadas: true,
    mensajes: true,
    recordatorios: true,
    pagos: true,
    promociones: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    { key: 'citasConfirmadas' as const, title: 'Citas confirmadas', desc: 'Recibe notificaciones cuando un enfermero acepte tu solicitud' },
    { key: 'mensajes' as const, title: 'Mensajes del enfermero', desc: 'Notificaciones de mensajes nuevos en el chat' },
    { key: 'recordatorios' as const, title: 'Recordatorios', desc: 'Recordatorios antes de tu cita programada' },
    { key: 'pagos' as const, title: 'Pagos procesados', desc: 'Notificaciones cuando se procese un cobro' },
    { key: 'promociones' as const, title: 'Ofertas y novedades', desc: 'Recibe información sobre nuevos servicios y promociones' },
  ];

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Preferencias de Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-6">
              <div>
                <div className="font-medium text-slate-800">{item.title}</div>
                <div className="text-sm text-slate-500">{item.desc}</div>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={cn("w-12 h-6 rounded-full transition-colors relative", prefs[item.key] ? "bg-green-500" : "bg-slate-300")}
              >
                <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm", prefs[item.key] ? "left-6" : "left-0.5")}></div>
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
