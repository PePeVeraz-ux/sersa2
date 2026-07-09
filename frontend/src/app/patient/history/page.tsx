'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Calendar as CalendarIcon, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { ClinicalReportCard } from '@/components/patient/ClinicalReportCard';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

export default function PatientHistoryPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      if (!token) return;
      try {
        const data = await apiFetch<any[]>('/requests/my-requests', { token });
        const completed = data.filter((r: any) => r.status === 'completed');
        setRequests(completed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchRequests();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Historial Clínico</h1>
        <p className="text-slate-500 mt-1">Revisa los reportes clínicos y detalles de tus servicios anteriores.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="bg-sky-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-sky-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No hay historial disponible</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Aún no tienes servicios finalizados con reportes clínicos. Cuando finalice un servicio, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => {
            const serviceName = request.items?.[0]?.service?.name || 'Servicio General';
            const isExpanded = expandedId === request.id;
            const hasReport = !!request.clinical_report;

            return (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all">
                <div 
                  className={cn(
                    "p-6 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between",
                    isExpanded ? "bg-slate-50 border-b border-slate-200" : ""
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-sky-100 p-3 rounded-xl">
                      <CalendarIcon className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{serviceName}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {new Date(request.created_at).toLocaleDateString('es-MX', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {request.address?.neighborhood || request.address?.city}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {hasReport && (
                      <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                        Reporte Clínico
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 bg-slate-50/50">
                    {hasReport ? (
                      <ClinicalReportCard request={request} />
                    ) : (
                      <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200">
                        No hay un reporte clínico adjunto a este servicio.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
