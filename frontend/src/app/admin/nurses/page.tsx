'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function AdminNursesPage() {
  const { token } = useAuth();
  const [nurses, setNurses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNurses = () => {
    if (!token) return;
    apiFetch<any[]>('/admin/nurses/pending', { token })
      .then(data => {
        setNurses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchNurses();
  }, [token]);

  const handleApprove = async (id: string) => {
    try {
      await apiFetch(`/admin/nurses/${id}/approve`, {
        method: 'POST',
        token,
      });
      fetchNurses();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#4DB4D7]" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Aprobación de Enfermeros</h1>
        <p className="text-slate-500 mt-1">Revisa los documentos y activa las cuentas de enfermeros pendientes.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg">Pendientes de Validación ({nurses.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {nurses.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400">
              <Check className="w-12 h-12 text-emerald-400 mb-4" />
              <p>No hay enfermeros pendientes de aprobación.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {nurses.map(nurse => (
                <div key={nurse.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      {nurse.nurse_profile?.first_name?.[0]}{nurse.nurse_profile?.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {nurse.nurse_profile?.first_name} {nurse.nurse_profile?.last_name}
                      </h3>
                      <p className="text-sm text-slate-500">{nurse.email} • Tel: {nurse.phone || 'No registrado'}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Pendiente
                        </span>
                        <span className="text-xs text-slate-500">
                          Cédula: {nurse.nurse_profile?.professional_license || 'No capturada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Botón para ver documento (simulado para UI) */}
                    <Button variant="outline" className="flex-1 md:w-auto flex items-center gap-2 border-slate-200">
                      <FileText className="w-4 h-4" />
                      Ver Documentos
                    </Button>
                    <Button 
                      onClick={() => handleApprove(nurse.id)}
                      className="flex-1 md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
