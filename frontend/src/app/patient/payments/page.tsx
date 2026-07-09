'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Receipt } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function PatientPayments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<any[]>('/wallets/payments/patient', { token })
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pagos y Facturación</h1>
        <p className="text-slate-500 mt-1">Historial de pagos por servicios de enfermería.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <div className="text-slate-500 font-medium text-sm">Método de Pago Predeterminado</div>
              <div className="font-bold text-slate-800">Tarjeta •••• 4242 (Demo)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="p-6 border-b bg-slate-50">
          <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#4DB4D7]" />
            Historial de Pagos
          </h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No tienes pagos registrados aún.</p>
            <p className="text-sm mt-1">Los pagos aparecerán cuando finalices un servicio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#4DB4D7] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Servicio</th>
                  <th className="px-6 py-4 text-left font-medium">Fecha</th>
                  <th className="px-6 py-4 text-left font-medium">Estado</th>
                  <th className="px-6 py-4 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {p.service_request?.items?.[0]?.service?.name || 'Servicio'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-MX') : new Date(p.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {p.status === 'completed' ? 'Pagado' : p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ${parseFloat(p.amount).toFixed(2)} MXN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
