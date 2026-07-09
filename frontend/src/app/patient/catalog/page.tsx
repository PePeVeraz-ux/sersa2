'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Loader2, HeartPulse, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
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

export default function CatalogPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await apiFetch<any[]>('/services');
        setServices(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Catálogo de Servicios Médicos</h1>
        <p className="text-lg text-slate-500">
          Encuentra profesionales calificados para el cuidado que necesitas en la comodidad de tu hogar.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="max-w-xl mx-auto relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
        </div>
        <Input 
          type="text" 
          placeholder="Buscar servicios (ej. Inyección, Curación)..." 
          className="pl-12 h-14 bg-white border-slate-200 rounded-2xl shadow-sm text-lg focus-visible:ring-sky-500 transition-shadow hover:shadow-md"
        />
      </motion.div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-sky-600 mb-4" />
          <p className="text-slate-500 font-medium">Cargando catálogo...</p>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.div 
              key={service.id} 
              whileHover={{ y: -8 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 transition-all overflow-hidden group cursor-pointer"
              onClick={() => {
                localStorage.setItem('sersa_draft_request', JSON.stringify([service]));
                router.push('/patient/catalog/details');
              }}
            >
              <div className="h-40 bg-gradient-to-br from-sky-50 to-blue-50 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-sky-600/5 mix-blend-multiply transition-opacity group-hover:opacity-0" />
                <HeartPulse className="w-16 h-16 text-sky-200 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                  {service.description || "Atención profesional y personalizada."}
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Precio Base</span>
                    <div className="text-lg font-bold text-slate-900">${parseFloat(service.base_price).toFixed(2)}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-[#4DB4D7] group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
