'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Activity, Clock, ShieldCheck, UserCheck, Search, ChevronRight, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';
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

export default function PatientDashboard() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyRequests() {
      if (!token) return;
      try {
        const data = await apiFetch<any[]>('/requests/my-requests', { token });
        setRequests(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchMyRequests();
  }, [token]);

  const activeRequest = requests.find(r => r.status !== 'completed' && r.status !== 'cancelled');

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-sky-400 via-[#4DB4D7] to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-sky-600/20 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 p-8 opacity-10">
          <Activity className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Hola, {user?.name || 'Paciente'}
          </h1>
          <p className="text-lg text-sky-50 mb-8 max-w-xl leading-relaxed font-medium">
            Bienvenido a tu portal de salud SERSA. ¿En qué podemos ayudarte el día de hoy?
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/patient/catalog">
              <Button variant="ghost" className="bg-white text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-8 h-14 rounded-2xl font-bold text-lg shadow-lg w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
                <Search className="w-5 h-5 mr-2" />
                Buscar Servicio Médico
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Active Service Status */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Estado Actual</h2>
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-100 flex flex-col items-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-sky-400" />
            Cargando estado...
          </div>
        ) : activeRequest ? (
          <div className="bg-white rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#4DB4D7] rounded-l-3xl" />
            <div className="w-20 h-20 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              {activeRequest.status === 'published' ? <Search className="w-10 h-10 animate-pulse" /> : <UserCheck className="w-10 h-10" />}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-1.5 bg-[#4DB4D7]/10 text-[#4DB4D7] font-bold text-xs rounded-full tracking-widest uppercase mb-3">
                {activeRequest.status === 'published' ? 'Buscando Enfermero' : 'Servicio en Curso'}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                {activeRequest.items[0]?.service?.name || 'Servicio'}
              </h3>
              <p className="text-slate-500 text-base font-medium">
                {activeRequest.status === 'published' 
                  ? 'Estamos buscando al profesional ideal más cercano a tu ubicación.'
                  : `El enfermero(a) ${activeRequest.assigned_nurse?.nurse_profile?.first_name || ''} ha aceptado tu servicio y está en camino.`}
              </p>
            </div>
            <Link href="/patient/appointments" className="w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-auto shrink-0 rounded-2xl h-14 px-8 border-sky-200 text-sky-700 hover:bg-sky-50 font-bold hover:shadow-md transition-all">
                Ver Detalles <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-8 md:p-12 text-center text-slate-500 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner text-slate-400">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Todo en orden</h3>
            <p className="font-medium">No tienes ningún servicio médico activo en este momento.</p>
          </div>
        )}
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/patient/history">
          <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all cursor-pointer group h-full">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Mi Historial Clínico</h3>
            <p className="text-slate-500 font-medium">Revisa los reportes médicos y signos vitales de tus citas pasadas.</p>
          </motion.div>
        </Link>
        <Link href="/patient/appointments">
          <motion.div whileHover={{ y: -4, scale: 1.02 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#4DB4D7]/30 transition-all cursor-pointer group h-full">
            <div className="w-14 h-14 bg-[#4DB4D7]/10 text-[#4DB4D7] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Mis Citas</h3>
            <p className="text-slate-500 font-medium">Administra tus servicios programados o en curso de forma rápida.</p>
          </motion.div>
        </Link>
      </motion.div>

    </motion.div>
  );
}
