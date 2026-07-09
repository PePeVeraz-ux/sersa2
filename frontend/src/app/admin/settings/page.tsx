'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MapPin, DollarSign, Users } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configuración de Plataforma</h1>
        <p className="text-slate-500 mt-1">Parámetros operativos de SERSA (zona piloto Tijuana).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#4DB4D7]" /> Zona de Operación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p><strong>Ciudad piloto:</strong> Tijuana, Baja California</p>
            <p><strong>Radio de cobertura:</strong> 15 km</p>
            <p><strong>Moneda:</strong> MXN</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Comisiones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p><strong>Comisión plataforma:</strong> 15%</p>
            <p><strong>Pasarela de pagos:</strong> Stripe (demo)</p>
            <p><strong>Retiro mínimo enfermero:</strong> $100 MXN</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-600" /> Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p><strong>KYC enfermeros:</strong> Cédula + Título profesional</p>
            <p><strong>Chat:</strong> Habilitado post-aceptación</p>
            <p><strong>Auditoría:</strong> Registro de cambios de estado</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" /> Reglas de Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>• Sin venta de insumos médicos</p>
            <p>• Sin diagnósticos ni consultas</p>
            <p>• No sustituye servicios de emergencia (911)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
