import { FileText, Activity, HeartPulse, Thermometer, Droplets, Wind, Stethoscope, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClinicalReportCard({ request }: { request: any }) {
  const report = request.clinical_report;
  if (!report) return null;

  const vitals = report.vital_signs_records?.[0];
  const nurseName = request.assigned_nurse?.nurse_profile?.first_name 
    ? `${request.assigned_nurse.nurse_profile.first_name} ${request.assigned_nurse.nurse_profile.last_name}`
    : 'Enfermero';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-sky-100 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Reporte Clínico</h3>
            <p className="text-sm text-slate-500">Emitido por {nurseName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
          <CheckCircle className="w-4 h-4" />
          Finalizado
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Vital Signs Grid */}
        {vitals && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              Signos Vitales
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <HeartPulse className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Presión / Pulso</span>
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {vitals.blood_pressure_sys}/{vitals.blood_pressure_dia} <span className="text-sm font-normal text-slate-500">mmHg</span>
                </div>
                <div className="text-sm text-slate-600 font-medium mt-1">
                  {vitals.heart_rate_bpm} <span className="text-xs font-normal text-slate-500">bpm</span>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Temperatura</span>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-2">
                  {vitals.temperature_c} <span className="text-sm font-normal text-slate-500">°C</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Wind className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">SpO2 / Resp</span>
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {vitals.oxygen_saturation}% <span className="text-sm font-normal text-slate-500">SpO2</span>
                </div>
                <div className="text-sm text-slate-600 font-medium mt-1">
                  {vitals.respiratory_rate} <span className="text-xs font-normal text-slate-500">rpm</span>
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                <div className="flex items-center gap-2 text-teal-600 mb-1">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Glucosa</span>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-2">
                  {vitals.glucose_mg_dl ? `${vitals.glucose_mg_dl} mg/dL` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-slate-400" />
              Observaciones Clínicas
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {report.observations || 'Sin observaciones detalladas.'}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Procedimientos Realizados
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {report.procedures_done || 'Sin procedimientos adicionales registrados.'}
            </div>
          </div>

          {report.wound_status && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Estado de Heridas
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed">
                {report.wound_status}
              </div>
            </div>
          )}

          {report.recommendations && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Recomendaciones
              </h4>
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 text-sky-900 text-sm leading-relaxed whitespace-pre-wrap">
                {report.recommendations}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
