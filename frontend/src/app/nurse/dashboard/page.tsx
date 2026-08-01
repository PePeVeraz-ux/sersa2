'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, DollarSign, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { NurseAddressSummary } from '@/components/address/NurseAddressSummary';
import { getAddressTypeLabel, formatFullAddress, getMapsUrl } from '@/lib/address';
import type { MapRequestPoint } from '@/components/map/RouteMap';

const RouteMap = dynamic(() => import('@/components/map/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <Loader2 className="w-6 h-6 animate-spin text-[#4DB4D7]" />
    </div>
  ),
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function NurseDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [routeStops, setRouteStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const mapStops = useMemo(() =>
    routeStops
      .map((stop, idx) => {
        const lat = stop.address?.lat;
        const lng = stop.address?.lng;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const patient = stop.patient?.patient_profile;
        return {
          id: stop.id,
          lat,
          lng,
          label: patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente',
          subtitle: `${getAddressTypeLabel(stop.address)} · ${stop.items?.[0]?.service?.name || ''}`,
          addressDetail: formatFullAddress(stop.address),
          references: stop.address?.references_text || undefined,
          mapsUrl: getMapsUrl(stop.address) || undefined,
          kind: 'stop' as const,
          order: idx + 1,
        } satisfies MapRequestPoint;
      })
      .filter(Boolean) as MapRequestPoint[],
  [routeStops]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [requests, statsData, routeData] = await Promise.all([
        apiFetch<any[]>('/requests/available', { token }),
        apiFetch<any>('/requests/nurse/stats', { token }),
        apiFetch<any>('/requests/nurse/today-route', { token }),
      ]);
      setAvailableRequests(requests);
      setStats(statsData);
      setRouteStops(routeData.stops || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      await apiFetch(`/requests/${id}/accept`, { method: 'POST', token });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setAcceptingId(null);
    }
  };

  const statCards = [
    { title: 'Citas de la Semana', value: String(stats?.weekAppointments ?? '—'), icon: Calendar, href: '/nurse/schedule' },
    { title: 'Pacientes Activos', value: String(stats?.activePatients ?? '—'), icon: Users, href: '/nurse/patients' },
    { title: 'Horas Trabajadas', value: stats ? `${stats.hoursWorked}h` : '—', icon: Clock },
    { title: 'Ingresos del Mes', value: stats ? `$${stats.monthEarnings.toFixed(0)}` : '—', icon: DollarSign },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buenos días, {user?.name || 'Enfermero(a)'}</h2>
        <p className="text-slate-500 mt-1">Aquí está el resumen de tu día</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i} 
            onClick={() => stat.href && router.push(stat.href)}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group${stat.href ? ' cursor-pointer' : ''}`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-300">
              <stat.icon className="w-24 h-24" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-sm font-medium text-slate-500 mb-1">{stat.title}</div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          
          {/* Citas Disponibles */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex flex-row items-center justify-between p-6 bg-slate-50/50 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
                Citas Disponibles Cerca de Ti
              </h3>
              <span className="text-sm text-sky-700 font-bold bg-sky-100 px-3 py-1 rounded-full">{availableRequests.length}</span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-sky-400" />
                  Buscando servicios cerca de ti...
                </div>
              ) : availableRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  No hay nuevas solicitudes en este momento.
                </div>
              ) : (
                availableRequests.map((req) => {
                  const patientName = `${req.patient?.patient_profile?.first_name || 'Paciente'} ${req.patient?.patient_profile?.last_name || ''}`;
                  const serviceName = req.items?.[0]?.service?.name || 'Servicio';
                  const isAccepting = acceptingId === req.id;
                  return (
                    <motion.div 
                      key={req.id} 
                      whileHover={{ backgroundColor: "rgba(248, 250, 252, 1)" }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-6 transition-colors gap-6"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">{serviceName}</div>
                          <div className="text-sm text-slate-600 font-medium mb-2">{patientName}</div>
                          <NurseAddressSummary address={req.address} compact showVerifyHint />
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-3 shrink-0">
                        <div className="text-2xl font-black text-slate-900">${parseFloat(req.total_amount).toFixed(2)}</div>
                        <Button 
                          onClick={() => handleAccept(req.id)}
                          disabled={isAccepting}
                          className="bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white shadow-md shadow-[#4DB4D7]/20 gap-2 w-full sm:w-auto h-10 px-6 rounded-xl transition-all hover:-translate-y-0.5"
                        >
                          {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          {isAccepting ? 'Aceptando...' : 'Aceptar Servicio'}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
            <div className="flex flex-row items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Ruta de Hoy</h3>
            </div>
            <div className="flex-1 flex flex-col p-6">
              {/* Live Map */}
              <div className="w-full h-52 rounded-2xl overflow-hidden border border-slate-200 mb-6">
                <RouteMap stops={mapStops} availableRequests={[]} className="w-full h-full" />
              </div>

              {/* Timeline */}
              <div className="relative flex-1 px-2">
                <div className="absolute top-4 bottom-4 left-[21px] w-0.5 bg-slate-100 rounded-full"></div>
                <div className="space-y-8 relative">
                  {routeStops.length === 0 ? (
                    <div className="text-center text-slate-400 py-4 text-sm">Sin paradas para hoy</div>
                  ) : (
                    routeStops.map((stop, i) => {
                      const patient = stop.patient?.patient_profile;
                      const name = patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente';
                      const time = stop.scheduled_start_at
                        ? new Date(stop.scheduled_start_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                        : new Date(stop.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                      return (
                    <motion.div 
                      key={stop.id} 
                      whileHover={{ x: 4 }}
                      className="flex gap-6 group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-white border-[3px] border-sky-100 group-hover:border-sky-500 shadow-sm flex items-center justify-center text-slate-600 group-hover:text-sky-600 font-bold text-sm relative z-10 transition-colors">
                        {i + 1}
                      </div>
                      <div className="pt-1.5">
                        <div className="font-bold text-slate-900 text-sm mb-1 group-hover:text-sky-600 transition-colors">{name}</div>
                        <div className="text-xs text-slate-500 font-medium">
                          {time} · {getAddressTypeLabel(stop.address)} · {stop.address?.neighborhood}
                        </div>
                      </div>
                    </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
