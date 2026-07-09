'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { SignatureCanvas } from '@/components/nurse/SignatureCanvas';
import { apiFetch, ApiError } from '@/lib/api';

export default function ClinicalReportPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [form, setForm] = useState({
    observations: '',
    woundStatus: '',
    proceduresDone: '',
    recommendations: '',
    blood_pressure_sys: '',
    blood_pressure_dia: '',
    heart_rate_bpm: '',
    temperature_c: '',
    glucose_mg_dl: '',
    oxygen_saturation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.observations.trim()) {
      setError('Las observaciones clínicas son obligatorias');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiFetch('/clinical-reports', {
        method: 'POST',
        token,
        body: JSON.stringify({
          serviceRequestId: id,
          observations: form.observations,
          woundStatus: form.woundStatus || undefined,
          proceduresDone: form.proceduresDone || undefined,
          recommendations: form.recommendations || undefined,
          signatureImageUrl: signature,
          vitalSigns: {
            blood_pressure_sys: form.blood_pressure_sys || undefined,
            blood_pressure_dia: form.blood_pressure_dia || undefined,
            heart_rate_bpm: form.heart_rate_bpm || undefined,
            temperature_c: form.temperature_c || undefined,
            glucose_mg_dl: form.glucose_mg_dl || undefined,
            oxygen_saturation: form.oxygen_saturation || undefined,
          },
        }),
      });
      router.push('/nurse/schedule');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/nurse/schedule" className="text-[#4DB4D7] hover:underline flex items-center gap-1 mb-2 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Volver a la agenda
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Reporte Clínico Post-Servicio</h1>
        <p className="text-slate-500 mt-1">Registra signos vitales, observaciones y firma del paciente.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Signos Vitales</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Presión Sistólica</Label>
                <Input name="blood_pressure_sys" value={form.blood_pressure_sys} onChange={handleChange} placeholder="120" />
              </div>
              <div>
                <Label>Presión Diastólica</Label>
                <Input name="blood_pressure_dia" value={form.blood_pressure_dia} onChange={handleChange} placeholder="80" />
              </div>
              <div>
                <Label>Pulso (bpm)</Label>
                <Input name="heart_rate_bpm" value={form.heart_rate_bpm} onChange={handleChange} placeholder="72" />
              </div>
              <div>
                <Label>Temperatura (°C)</Label>
                <Input name="temperature_c" value={form.temperature_c} onChange={handleChange} placeholder="36.5" />
              </div>
              <div>
                <Label>Glucosa (mg/dL)</Label>
                <Input name="glucose_mg_dl" value={form.glucose_mg_dl} onChange={handleChange} placeholder="100" />
              </div>
              <div>
                <Label>Saturación O₂ (%)</Label>
                <Input name="oxygen_saturation" value={form.oxygen_saturation} onChange={handleChange} placeholder="98" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Observaciones Clínicas *</Label>
              <Textarea name="observations" value={form.observations} onChange={handleChange} required rows={4} placeholder="Estado general del paciente, reacciones, etc." />
            </div>
            <div>
              <Label>Estado de Herida</Label>
              <Input name="woundStatus" value={form.woundStatus} onChange={handleChange} placeholder="Ej. Limpia, sin signos de infección" />
            </div>
            <div>
              <Label>Procedimientos Realizados</Label>
              <Textarea name="proceduresDone" value={form.proceduresDone} onChange={handleChange} rows={2} />
            </div>
            <div>
              <Label>Recomendaciones</Label>
              <Textarea name="recommendations" value={form.recommendations} onChange={handleChange} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <SignatureCanvas onChange={setSignature} />
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-base font-semibold">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          {loading ? 'Guardando...' : 'Finalizar Servicio y Guardar Reporte'}
        </Button>
      </form>
    </div>
  );
}
