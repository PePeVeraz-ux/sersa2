'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, ChevronLeft, Check, CreditCard, Building, Banknote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function CatalogPayment() {
  const { token } = useAuth();
  const router = useRouter();
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sersa_draft_full');
    if (saved) {
      setDraft(JSON.parse(saved));
    } else {
      router.push('/patient/catalog');
    }
  }, [router]);

  if (!draft) return null;

  // Tomamos solo el primer servicio para el request, dado que nuestro backend asume 1 servicio por request por ahora
  const service = draft.services[0]; 
  const total = parseFloat(service.base_price); // Subtotal sin tarifa para simplificar

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await apiFetch('/requests', {
        method: 'POST',
        token,
        body: JSON.stringify({
          serviceId: service.id,
          addressId: draft.addressId,
          scheduledDate: draft.scheduledDate,
          notes: draft.notes
        })
      });

      localStorage.removeItem('sersa_draft_full');
      localStorage.removeItem('sersa_draft_request');
      router.push('/patient/appointments'); // Redirigir a mis citas
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <Link href="/patient/catalog/details" className="text-[#4DB4D7] hover:underline flex items-center gap-1 mb-2 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Volver a detalles
        </Link>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Confirmar y Pagar</h2>
        <p className="text-slate-500">Revisa tu cita y completa el pago (Simulado)</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="w-8 h-8 rounded-full bg-[#4DB4D7] text-white flex items-center justify-center font-bold text-sm">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">Selección</span>
          </div>
          <div className="w-16 h-px bg-[#4DB4D7] hidden sm:block"></div>
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="w-8 h-8 rounded-full bg-[#4DB4D7] text-white flex items-center justify-center font-bold text-sm">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800 hidden sm:inline">Detalles</span>
          </div>
          <div className="w-16 h-px bg-[#4DB4D7] hidden sm:block"></div>
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="w-8 h-8 rounded-full bg-[#4DB4D7] text-white flex items-center justify-center font-bold text-sm">3</div>
            <span className="font-semibold text-slate-800 hidden sm:inline">Pago</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#4DB4D7]" />
                Método de Pago (Demostración)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="border-2 border-[#4DB4D7] bg-blue-50/30 rounded-xl p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Tarjeta Guardada</div>
                      <div className="text-sm text-slate-500">Cobro automático al finalizar</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#4DB4D7] text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-sm border-slate-200 sticky top-24">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-3">
                <div className="flex justify-between items-start text-sm">
                  <span className="text-slate-700">{service.name}</span>
                  <span className="font-medium text-slate-800">${total.toFixed(2)} MXN</span>
                </div>
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-slate-800">Total a pagar:</span>
                <span className="font-bold text-slate-800">${total.toFixed(2)} MXN</span>
              </div>

              <Button 
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold mt-4 gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Procesando...' : 'Confirmar Pago y Solicitar'}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
