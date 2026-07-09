'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, FileText, X, Heart, Thermometer, Droplets, Wind, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function NurseReports() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const perPage = 8;

  useEffect(() => {
    if (!token) return;
    apiFetch<any[]>('/clinical-reports/my-reports', { token })
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const totalPages = Math.max(1, Math.ceil(reports.length / perPage));
  const paginated = reports.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6 max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reportes Clínicos</h2>
        <p className="text-slate-500">Historial de reportes de servicios completados</p>
      </div>

      <Card className="shadow-sm flex-1 flex flex-col min-h-0 border-slate-200">
        <CardHeader className="py-4 px-6 border-b">
          <CardTitle className="text-lg text-slate-700 font-semibold">Registro ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#4DB4D7]" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
              <FileText className="w-12 h-12 mb-4 text-slate-300" />
              <p className="font-medium text-slate-600 mb-1">No hay reportes clínicos aún</p>
              <p className="text-sm">Los reportes aparecerán aquí cuando finalices un servicio.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-center text-sm">
                <thead className="bg-[#4DB4D7] text-white sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-medium border-b border-r border-[#3ba0c2]">ID</th>
                    <th className="px-6 py-4 font-medium border-b border-r border-[#3ba0c2]">Paciente</th>
                    <th className="px-6 py-4 font-medium border-b border-r border-[#3ba0c2]">Servicio</th>
                    <th className="px-6 py-4 font-medium border-b border-r border-[#3ba0c2]">Fecha</th>
                    <th className="px-6 py-4 font-medium border-b border-[#3ba0c2]">Reporte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  {paginated.map((report) => {
                    const patient = report.service_request?.patient?.patient_profile;
                    const serviceName = report.service_request?.items?.[0]?.service?.name || 'Servicio';
                    return (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 border-r font-mono text-xs">#{report.id.slice(-6)}</td>
                        <td className="px-6 py-4 border-r font-medium text-slate-700">
                          {patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente'}
                        </td>
                        <td className="px-6 py-4 border-r">{serviceName}</td>
                        <td className="px-6 py-4 border-r">
                          {new Date(report.created_at).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            onClick={() => setSelectedReport(report)}
                            className="bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white h-8 px-6 text-sm"
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {reports.length > perPage && (
            <div className="py-6 flex items-center justify-center gap-2 border-t mt-auto">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded font-medium ${
                    p === page ? 'bg-[#4DB4D7] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Reporte Clínico</h3>
                <p className="text-sm text-slate-500">#{selectedReport.id.slice(-6)} • {new Date(selectedReport.created_at).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient & Service Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Paciente</div>
                  <div className="font-semibold text-slate-800">
                    {selectedReport.service_request?.patient?.patient_profile
                      ? `${selectedReport.service_request.patient.patient_profile.first_name} ${selectedReport.service_request.patient.patient_profile.last_name}`
                      : 'Paciente'}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Servicio</div>
                  <div className="font-semibold text-slate-800">
                    {selectedReport.service_request?.items?.[0]?.service?.name || 'Servicio'}
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              {selectedReport.vital_signs_records?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#4DB4D7]" />
                    Signos Vitales
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedReport.vital_signs_records[0].blood_pressure_sys && (
                      <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                        <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                        <div className="text-xs text-red-400 font-medium">Presión Arterial</div>
                        <div className="font-bold text-red-700">{selectedReport.vital_signs_records[0].blood_pressure_sys}/{selectedReport.vital_signs_records[0].blood_pressure_dia}</div>
                      </div>
                    )}
                    {selectedReport.vital_signs_records[0].heart_rate_bpm && (
                      <div className="bg-pink-50 border border-pink-100 p-3 rounded-xl text-center">
                        <Activity className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                        <div className="text-xs text-pink-400 font-medium">Frec. Cardíaca</div>
                        <div className="font-bold text-pink-700">{selectedReport.vital_signs_records[0].heart_rate_bpm} bpm</div>
                      </div>
                    )}
                    {selectedReport.vital_signs_records[0].temperature_c && (
                      <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center">
                        <Thermometer className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <div className="text-xs text-amber-400 font-medium">Temperatura</div>
                        <div className="font-bold text-amber-700">{Number(selectedReport.vital_signs_records[0].temperature_c).toFixed(1)}°C</div>
                      </div>
                    )}
                    {selectedReport.vital_signs_records[0].glucose_mg_dl && (
                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-center">
                        <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="text-xs text-blue-400 font-medium">Glucosa</div>
                        <div className="font-bold text-blue-700">{selectedReport.vital_signs_records[0].glucose_mg_dl} mg/dL</div>
                      </div>
                    )}
                    {selectedReport.vital_signs_records[0].oxygen_saturation && (
                      <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl text-center">
                        <Wind className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                        <div className="text-xs text-sky-400 font-medium">SpO₂</div>
                        <div className="font-bold text-sky-700">{selectedReport.vital_signs_records[0].oxygen_saturation}%</div>
                      </div>
                    )}
                    {selectedReport.vital_signs_records[0].respiratory_rate && (
                      <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl text-center">
                        <Wind className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                        <div className="text-xs text-teal-400 font-medium">Frec. Respiratoria</div>
                        <div className="font-bold text-teal-700">{selectedReport.vital_signs_records[0].respiratory_rate} rpm</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observations */}
              {selectedReport.observations && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-2">Observaciones</h4>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed">{selectedReport.observations}</p>
                </div>
              )}

              {/* Wound Status */}
              {selectedReport.wound_status && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-2">Estado de Herida</h4>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed">{selectedReport.wound_status}</p>
                </div>
              )}

              {/* Procedures */}
              {selectedReport.procedures_done && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-2">Procedimientos Realizados</h4>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed">{selectedReport.procedures_done}</p>
                </div>
              )}

              {/* Recommendations */}
              {selectedReport.recommendations && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-2">Recomendaciones</h4>
                  <p className="text-slate-600 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-sm leading-relaxed">{selectedReport.recommendations}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
