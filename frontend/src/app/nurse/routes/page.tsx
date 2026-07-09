'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Navigation, MapPin, Play, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NurseRoutes() {
  const { token } = useAuth();
  const router = useRouter();
  const [route, setRoute] = useState<{ stops: any[]; totalStops: number; totalEarnings: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRoute = () => {
    if (!token) return;
    apiFetch<any>('/requests/nurse/today-route', { token })
      .then(setRoute)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoute();
  }, [token]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(`${id}-${status}`);
    try {
      await apiFetch(`/requests/${id}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status }),
      });
      fetchRoute();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const stops = route?.stops || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4DB4D7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Rutas del día</h2>
          <p className="text-slate-500">Visualiza y gestiona tu ruta de hoy en Tijuana</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {stops.length} Paradas • ${route?.totalEarnings?.toFixed(2) || '0.00'} MXN
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-8 h-full">
          <Card className="shadow-sm h-full overflow-hidden p-2">
            <div className="w-full h-full bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-slate-100 to-blue-50">
                <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {stops.length > 1 && (
                    <polyline
                      points={stops.map((_, i) => `${150 + i * 120},${120 + (i % 2) * 80}`).join(' ')}
                      fill="none"
                      stroke="#4DB4D7"
                      strokeWidth="3"
                      strokeDasharray="8,4"
                    />
                  )}
                  {stops.map((_, i) => (
                    <circle key={i} cx={150 + i * 120} cy={120 + (i % 2) * 80} r="8" fill="#3b82f6" />
                  ))}
                </svg>
              </div>
              <div className="relative z-10 text-center p-8">
                <MapPin className="w-12 h-12 text-[#4DB4D7] mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Zona piloto: Tijuana, B.C.</p>
                <p className="text-sm text-slate-400 mt-1">{stops.length} paradas programadas para hoy</p>
              </div>
              <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium text-slate-700">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                GPS activo (demo)
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 h-full flex flex-col">
          <h3 className="font-semibold text-lg text-slate-800 mb-4 px-1">Paradas</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
            {stops.length === 0 ? (
              <div className="text-center text-slate-400 p-8 bg-slate-50 rounded-xl border border-dashed">
                No hay paradas para hoy. Acepta servicios en el dashboard.
              </div>
            ) : (
              stops.map((stop, idx) => {
                const patient = stop.patient?.patient_profile;
                const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente';
                const serviceName = stop.items?.[0]?.service?.name || 'Servicio';
                const isActive = ['en_camino', 'arrived', 'in_progress'].includes(stop.status);
                return (
                  <Card
                    key={stop.id}
                    className={cn(
                      'shadow-sm transition-all border-l-4',
                      isActive ? 'border-l-blue-500 bg-blue-50/30' : 'border-l-transparent hover:border-l-slate-300',
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{patientName}</div>
                          <div className="text-slate-600 text-sm mb-2">{serviceName}</div>
                          <div className="text-sm text-slate-600 flex items-start gap-1">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            {stop.address?.street_line1}, {stop.address?.neighborhood}
                          </div>
                          {stop.scheduled_start_at && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(stop.scheduled_start_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="font-semibold text-green-600">${parseFloat(stop.total_amount).toFixed(2)}</div>
                        <div className="flex gap-2">
                          {stop.status === 'accepted' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(stop.id, 'en_camino')}
                              disabled={!!actionLoading}
                              className="bg-blue-500 hover:bg-blue-600 text-white h-8"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          {stop.status === 'en_camino' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(stop.id, 'arrived')}
                              disabled={!!actionLoading}
                              className="bg-green-600 hover:bg-green-700 text-white h-8"
                            >
                              <Navigation className="w-3 h-3 mr-1" />
                              Llegué
                            </Button>
                          )}
                          {stop.status === 'arrived' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(stop.id, 'in_progress')}
                              disabled={!!actionLoading}
                              className="bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white h-8"
                            >
                              Atender
                            </Button>
                          )}
                          {stop.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => router.push(`/nurse/schedule/clinical-report/${stop.id}`)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                            >
                              Reporte
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
