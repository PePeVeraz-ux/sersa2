'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Activity, Plus, MoreHorizontal, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function PatientAppointments() {
  const { token } = useAuth();
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchCitas = async () => {
      try {
        const data = await apiFetch<any[]>('/requests/my-requests', { token });
        setCitas(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'accepted':
      case 'en_camino':
      case 'arrived':
      case 'in_progress': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'completed': return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'cancelled': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'published': return 'Buscando Enfermero';
      case 'accepted': return 'Confirmada';
      case 'en_camino': return 'En camino';
      case 'arrived': return 'En destino';
      case 'in_progress': return 'En progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const upcomingCitas = citas.filter(c => !['completed', 'cancelled'].includes(c.status));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-5xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calendar className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mis Citas</h1>
          <p className="text-slate-500 mt-2 text-lg">Gestiona tus servicios programados o activos.</p>
        </div>
        <Link href="/patient/catalog" className="relative z-10">
          <Button className="bg-[#4DB4D7] hover:bg-[#3ca1c3] text-white shadow-md shadow-[#4DB4D7]/20 gap-2 w-full sm:w-auto h-12 px-6 rounded-xl font-bold transition-all hover:scale-105">
            <Plus className="w-5 h-5" />
            Agendar nueva cita
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-4 border-b border-slate-200 px-2">
        <button className="pb-3 px-2 border-b-2 border-[#4DB4D7] text-[#4DB4D7] font-bold text-sm tracking-wide transition-colors">
          Próximas Citas ({upcomingCitas.length})
        </button>
        <button className="pb-3 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-700 font-medium text-sm transition-colors">
          Citas Pasadas
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        {loading ? (
          <div className="text-center text-slate-500 py-12 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-[#4DB4D7] rounded-full animate-spin mb-4" />
            Cargando tus citas...
          </div>
        ) : upcomingCitas.length === 0 ? (
          <div className="text-slate-500 bg-white p-12 rounded-3xl border border-slate-200 border-dashed text-center flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No tienes próximas citas</p>
            <p className="text-sm">Tus servicios solicitados aparecerán aquí.</p>
          </div>
        ) : (
          upcomingCitas.map((cita) => {
            const serviceName = cita.items?.[0]?.service?.name || 'Servicio Médico';
            const nurse = cita.assigned_nurse;
            return (
              <motion.div
                key={cita.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-sky-100 transition-all overflow-hidden group"
              >
                <div className="flex flex-col md:flex-row">

                  {/* Info Area */}
                  <div className="p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#4DB4D7]" />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#4DB4D7]/10 text-[#4DB4D7] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xl text-slate-900">{serviceName}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(cita.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(cita.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <span className={cn("px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full border shadow-sm h-fit", getStatusColor(cita.status))}>
                        {formatStatus(cita.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                          {!nurse ? (
                            <MoreHorizontal className="w-5 h-5 animate-pulse" />
                          ) : (
                            <div className="w-full h-full bg-sky-100 text-[#4DB4D7] font-bold flex items-center justify-center text-sm">
                              {nurse.nurse_profile?.first_name?.[0]}{nurse.nurse_profile?.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Enfermero(a)</div>
                          <div className="font-bold text-slate-800 text-sm">
                            {nurse ? `${nurse.nurse_profile?.first_name} ${nurse.nurse_profile?.last_name}` : 'Buscando profesional...'}
                          </div>
                          {nurse && <div className="text-xs text-[#4DB4D7] font-medium flex items-center gap-1 mt-0.5"><ShieldCheck className="w-3 h-3" /> Verificado</div>}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-[#4DB4D7]" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Destino</div>
                          <div className="text-sm font-medium text-slate-700">{cita.address?.street_line1}</div>
                          <div className="text-xs text-slate-500">{cita.address?.neighborhood}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Area */}
                  <div className="p-8 md:w-72 bg-slate-50/80 flex flex-col justify-between shrink-0">
                    <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                      <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Costo Estimado</div>
                      <div className="text-3xl font-black text-slate-900">${parseFloat(cita.total_amount).toFixed(2)}</div>
                    </div>

                    <div className="space-y-3">
                      <Button variant="outline" className="w-full bg-white text-[#4DB4D7] border border-sky-200 hover:bg-sky-50 shadow-sm h-12 rounded-xl font-bold">
                        Ver Detalles
                      </Button>
                      {!nurse && (
                        <Button variant="ghost" className="w-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-sm h-10 rounded-xl font-medium transition-colors">
                          Cancelar solicitud
                        </Button>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

    </motion.div>
  );
}
