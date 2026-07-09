'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function NotificationsSettings() {
  const [prefs, setPrefs] = useState({
    nuevasCitas: true,
    mensajes: true,
    recordatorios: true,
    pagos: true,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Preferencias de Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          
          <div className="flex items-center justify-between p-6">
            <div>
              <div className="font-medium text-slate-800">Nuevas citas</div>
              <div className="text-sm text-slate-500">Recibe notificaciones cuando te asignen una nueva cita</div>
            </div>
            <button 
              onClick={() => toggle('nuevasCitas')}
              className={cn("w-12 h-6 rounded-full transition-colors relative", prefs.nuevasCitas ? "bg-green-500" : "bg-slate-300")}
            >
              <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", prefs.nuevasCitas ? "left-6" : "left-0.5")}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-6">
            <div>
              <div className="font-medium text-slate-800">Mensajes de pacientes</div>
              <div className="text-sm text-slate-500">Notificaciones de mensajes nuevos</div>
            </div>
            <button 
              onClick={() => toggle('mensajes')}
              className={cn("w-12 h-6 rounded-full transition-colors relative", prefs.mensajes ? "bg-green-500" : "bg-slate-300")}
            >
              <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", prefs.mensajes ? "left-6" : "left-0.5")}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-6">
            <div>
              <div className="font-medium text-slate-800">Recordatorios</div>
              <div className="text-sm text-slate-500">Recordatorios de citas próximas</div>
            </div>
            <button 
              onClick={() => toggle('recordatorios')}
              className={cn("w-12 h-6 rounded-full transition-colors relative", prefs.recordatorios ? "bg-green-500" : "bg-slate-300")}
            >
              <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", prefs.recordatorios ? "left-6" : "left-0.5")}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-6">
            <div>
              <div className="font-medium text-slate-800">Pagos recibidos</div>
              <div className="text-sm text-slate-500">Notificaciones cuando recibas un pago</div>
            </div>
            <button 
              onClick={() => toggle('pagos')}
              className={cn("w-12 h-6 rounded-full transition-colors relative", prefs.pagos ? "bg-green-500" : "bg-slate-300")}
            >
              <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", prefs.pagos ? "left-6" : "left-0.5")}></div>
            </button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
