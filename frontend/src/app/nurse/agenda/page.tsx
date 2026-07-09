'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Mock Data
const citas = [
  { id: 1, time: '9:00 AM', duration: '30min', name: 'Juan Pérez', service: 'Curación de Herida', address: 'Calle Principal 123', status: 'Confirmada', color: 'bg-green-50/50' },
  { id: 2, time: '11:30 AM', duration: '40min', name: 'Rosa Hernandez', service: 'Curación de Herida', address: 'Calle Roble 123', status: 'Confirmada', color: 'bg-green-50/50' },
  { id: 3, time: '1:00 PM', duration: '45min', name: 'María García', service: 'Curación de Herida', address: 'Calle Mora 123', status: 'Confirmada', color: 'bg-green-50/50' },
  { id: 4, time: '2:00 PM', duration: '50min', name: 'Angel Guzman', service: 'Curación de Herida', address: 'Calle Reforma 123', status: 'Pendiente', color: 'bg-amber-50/50' },
  { id: 5, time: '3:30 PM', duration: '1h', name: 'Javier Duarte', service: 'Curación de Herida', address: 'Calle Juárez 123', status: 'Pendiente', color: 'bg-amber-50/50' },
];

export default function NurseAgenda() {
  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mi Agenda</h2>
        <p className="text-slate-500">Gestiona tus citas y horarios</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Calendar & Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {/* Simple Calendar Mock */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Marzo 2026</h3>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                  <button className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 mb-2">
                <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
              </div>
              
              <div className="grid grid-cols-7 text-center text-sm gap-y-2">
                <div className="text-slate-300">23</div><div className="text-slate-300">24</div><div className="text-slate-300">25</div><div className="text-slate-300">26</div><div className="text-slate-300">27</div><div className="text-slate-300">28</div><div>1</div>
                <div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div>
                <div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div><div>15</div>
                <div>16</div><div>17</div><div>18</div><div>19</div><div>20</div><div>21</div><div>22</div>
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-md mx-auto flex items-center justify-center">23</div>
                </div>
                <div>24<div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-0.5"></div></div>
                <div>25<div className="w-1 h-1 bg-amber-500 rounded-full mx-auto mt-0.5"></div></div>
                <div>26<div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-0.5"></div></div>
                <div>27</div><div>28</div><div>29</div>
                <div>30</div><div>31</div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-600">Citas hoy</span>
                  <span className="font-bold text-slate-800">5</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-slate-600">Pendientes</span>
                  <span className="font-bold text-amber-500">2</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Confirmadas</span>
                  <span className="font-bold text-green-500">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Appointments List */}
        <div className="lg:col-span-8">
          <Card className="shadow-sm min-h-full">
            <CardContent className="p-6">
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-slate-800">Citas del 23 de Marzo</h3>
                <div className="flex bg-slate-100 p-1 rounded-md">
                  <button className="px-4 py-1 bg-blue-500 text-white rounded shadow-sm text-sm font-medium">Día</button>
                  <button className="px-4 py-1 text-slate-600 hover:text-slate-800 text-sm font-medium">Semana</button>
                  <button className="px-4 py-1 text-slate-600 hover:text-slate-800 text-sm font-medium">Mes</button>
                </div>
              </div>

              <div className="space-y-3">
                {citas.map((cita) => (
                  <div key={cita.id} className={cn("flex items-center justify-between p-4 rounded-xl border border-slate-100", cita.color)}>
                    <div className="flex items-start gap-6">
                      <div className="w-20 text-center">
                        <div className="font-bold text-slate-800">{cita.time}</div>
                        <div className="text-xs text-slate-500">{cita.duration}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="font-medium text-slate-800">{cita.name}</div>
                        <div className="text-sm text-slate-600">{cita.service}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {cita.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-sm font-medium",
                        cita.status === 'Confirmada' ? "text-green-600" : "text-amber-500"
                      )}>
                        {cita.status}
                      </span>
                      <Button variant="outline" className="h-8 text-sm border-blue-200 text-blue-600 hover:bg-blue-50">
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
