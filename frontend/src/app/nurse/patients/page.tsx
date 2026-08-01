'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, Mail, MessageSquare, Users, Calendar, Loader2, Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const statusLabels: Record<string, string> = {
  estable: 'Estable',
  seguimiento: 'En Seguimiento',
  critico: 'Crítico',
};

const statusColors: Record<string, string> = {
  estable: 'bg-green-100 text-green-700',
  seguimiento: 'bg-amber-100 text-amber-700',
  critico: 'bg-red-100 text-red-700',
};

export default function NursePatients() {
  const { token } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch<any[]>('/profiles/nurse/patients', { token })
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = patients.filter((p) => {
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return true;
    const name = `${p.profile?.first_name || ''} ${p.profile?.last_name || ''}`.toLowerCase();
    const email = p.patient?.email?.toLowerCase() || '';
    return name.includes(searchLower) || email.includes(searchLower);
  });

  const stats = {
    total: patients.length,
    activos: patients.filter((p) => p.clinical_status === 'estable').length,
    seguimiento: patients.filter((p) => p.clinical_status === 'seguimiento').length,
    nuevos: patients.filter((p) => {
      if (!p.last_service_at) return false;
      const d = new Date(p.last_service_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4DB4D7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mis Pacientes</h2>
        <p className="text-slate-500">Pacientes con los que has trabajado en SERSA</p>
      </div>

      <div className="flex items-center gap-4 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar paciente por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Pacientes', value: stats.total, icon: Users, color: 'from-[#4DB4D7]/10 to-sky-100/40', textColor: 'text-[#4DB4D7]' },
          { title: 'Estables', value: stats.activos, icon: CheckCircle2, color: 'from-emerald-100/40 to-green-100/20', textColor: 'text-emerald-600' },
          { title: 'En Seguimiento', value: stats.seguimiento, icon: Activity, color: 'from-amber-100/40 to-orange-100/20', textColor: 'text-amber-600' },
          { title: 'Activos este mes', value: stats.nuevos, icon: TrendingUp, color: 'from-purple-100/40 to-fuchsia-100/20', textColor: 'text-purple-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`shadow-sm border border-white/40 bg-gradient-to-br ${stat.color} hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium text-slate-600">{stat.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-sm overflow-hidden border-slate-200">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No tienes pacientes registrados aún. Acepta servicios para verlos aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Último Servicio</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Servicios</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold shrink-0">
                          {p.profile?.first_name?.[0]}{p.profile?.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {p.profile?.first_name} {p.profile?.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs text-slate-600">
                        {p.patient?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {p.patient.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {p.patient?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{p.last_service_name || '—'}</div>
                      {p.last_service_at && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(p.last_service_at).toLocaleDateString('es-MX')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[p.clinical_status] || statusColors.estable}`}>
                        {statusLabels[p.clinical_status] || p.clinical_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{p.total_services}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <Link href="/nurse/messages">
                          <button className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
