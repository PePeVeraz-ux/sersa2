'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, User, FileText, CheckCircle, Navigation, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function NurseSchedule() {
  const { token } = useAuth();
  const router = useRouter();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSchedule = async () => {
    if (!token) return;
    try {
      const data = await apiFetch<any[]>('/requests/my-schedule', { token });
      setSchedule(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(fetchSchedule, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(`${id}-${status}`);
    try {
      await apiFetch(`/requests/${id}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status }),
      });
      fetchSchedule();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'en_camino': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'arrived': return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'in_progress': return 'bg-sky-100 text-sky-700 border-sky-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'accepted': return 'Por Iniciar';
      case 'en_camino': return 'En Camino';
      case 'arrived': return 'En Destino';
      case 'in_progress': return 'En Progreso';
      default: return status;
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mi Agenda</h1>
          <p className="text-slate-500 mt-2">Gestiona tus servicios asignados y reporta tu progreso.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200 shadow-sm rounded-xl px-5 h-10 font-medium">Hoy</Button>
          <Button variant="ghost" className="text-slate-500 font-medium">Próximos</Button>
        </div>
      </motion.div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-200 via-sky-100 to-transparent rounded-full" />
        
        <div className="space-y-8 relative">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center ml-12">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-sky-400" />
              Cargando tu agenda...
            </div>
          ) : schedule.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-200 border-dashed ml-12">
              No tienes servicios agendados. Ve al dashboard para aceptar solicitudes.
            </div>
          ) : (
            schedule.map((req, idx) => {
              const isAccepted = req.status === 'accepted';
              const isEnCamino = req.status === 'en_camino';
              const isArrived = req.status === 'arrived';
              const isInProgress = req.status === 'in_progress';
              const patientName = `${req.patient?.patient_profile?.first_name || 'Paciente'} ${req.patient?.patient_profile?.last_name || ''}`;

              return (
                <motion.div variants={itemVariants} key={req.id} className="relative pl-16">
                  {/* Timeline Dot */}
                  <div className="absolute left-4 top-8 w-5 h-5 rounded-full bg-white border-4 border-sky-500 shadow-sm shadow-sky-500/20 z-10" />
                  
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", getStatusColor(req.status))}>
                              {getStatusText(req.status)}
                            </span>
                            <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {new Date(req.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                              {req.items?.[0]?.service?.name}
                            </h3>
                            <div className="mt-2 flex items-center gap-2 text-slate-600">
                              <User className="w-5 h-5 text-slate-400" />
                              <span className="font-medium text-base">{patientName}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-slate-500 bg-slate-50 p-4 rounded-2xl">
                            <MapPin className="w-5 h-5 shrink-0 text-sky-500 mt-0.5" />
                            <div className="text-sm leading-relaxed">
                              <span className="font-semibold block text-slate-700">{req.address?.neighborhood}</span>
                              {req.address?.street} {req.address?.ext_number}, {req.address?.city}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[220px]">
                          {isAccepted && (
                            <Button 
                              onClick={() => updateStatus(req.id, 'en_camino')}
                              disabled={!!actionLoading}
                              className="w-full bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white shadow-md h-12 rounded-xl text-base"
                            >
                              {actionLoading === `${req.id}-en_camino` ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Navigation className="w-5 h-5 mr-2" />}
                              Iniciar Viaje
                            </Button>
                          )}

                          {isEnCamino && (
                            <Button 
                              onClick={() => updateStatus(req.id, 'arrived')}
                              disabled={!!actionLoading}
                              variant="outline"
                              className="w-full h-12 rounded-xl border-green-200 text-green-700 font-medium"
                            >
                              Reportar Llegada
                            </Button>
                          )}

                          {isArrived && (
                            <Button 
                              onClick={() => updateStatus(req.id, 'in_progress')}
                              disabled={!!actionLoading}
                              className="w-full bg-sky-600 hover:bg-sky-700 text-white h-12 rounded-xl"
                            >
                              Iniciar Atención
                            </Button>
                          )}

                          {isInProgress && (
                              <Button 
                                onClick={() => router.push(`/nurse/schedule/clinical-report/${req.id}`)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 h-12 rounded-xl text-base gap-2"
                              >
                                <CheckCircle className="w-5 h-5" />
                                Finalizar y Crear Reporte
                              </Button>
                          )}
                          
                          <div className="text-center mt-2">
                            <button className="text-sm font-medium text-sky-600 hover:underline">Ver detalles completos</button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
