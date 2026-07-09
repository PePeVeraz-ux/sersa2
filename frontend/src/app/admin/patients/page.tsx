'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Loader2, Mail, Calendar, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function AdminPatientsPage() {
  const { token } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<any[]>('/admin/patients', { token })
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

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
        <h1 className="text-3xl font-bold text-slate-800">Pacientes Registrados</h1>
        <p className="text-slate-500 mt-1">Listado de pacientes activos en la plataforma SERSA.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          {patients.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No hay pacientes registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Paciente</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Contacto</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Estado</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Registro</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Última Solicitud</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                            {p.patient_profile?.first_name?.[0]}{p.patient_profile?.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">
                              {p.patient_profile?.first_name} {p.patient_profile?.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {p.email}
                        </div>
                        {p.phone && <div className="text-xs text-slate-400 mt-0.5">{p.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status === 'active' ? 'Activo' : p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(p.created_at).toLocaleDateString('es-MX')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.patient_requests?.[0] ? (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Activity className="w-4 h-4 text-[#4DB4D7]" />
                            {p.patient_requests[0].status}
                          </div>
                        ) : (
                          <span className="text-slate-400">Sin solicitudes</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
