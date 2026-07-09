'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Clock, Upload, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function CatalogDetails() {
  const { token } = useAuth();
  const router = useRouter();
  const [draft, setDraft] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sersa_draft_request');
    if (saved) {
      setDraft(JSON.parse(saved));
    } else {
      router.push('/patient/catalog');
    }

    if (token) {
      apiFetch<any[]>('/addresses', { token })
        .then(data => {
          setAddresses(data);
          if (data.length > 0) setSelectedAddressId(data[0].id);
        })
        .catch(console.error);
    }
  }, [token, router]);

  const total = draft.reduce((acc, curr) => acc + parseFloat(curr.base_price), 0);
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handleContinue = () => {
    // Save details to draft
    const fullDraft = {
      services: draft,
      addressId: selectedAddressId,
      scheduledDate: date && time ? `${date}T${time}:00` : null,
      notes
    };
    localStorage.setItem('sersa_draft_full', JSON.stringify(fullDraft));
    router.push('/patient/catalog/payment');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <Link href="/patient/catalog" className="text-[#4DB4D7] hover:underline flex items-center gap-1 mb-2 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Detalles de la cita</h2>
        <p className="text-slate-500">Verifica y completa la información para tu cita</p>
      </div>

      {/* Stepper */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="w-8 h-8 rounded-full bg-[#4DB4D7] text-white flex items-center justify-center font-bold text-sm">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">Selección</span>
          </div>
          <div className="w-16 h-px bg-[#4DB4D7] hidden sm:block"></div>
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="w-8 h-8 rounded-full bg-[#4DB4D7] text-white flex items-center justify-center font-bold text-sm">2</div>
            <span className="font-semibold text-slate-800 hidden sm:inline">Detalles</span>
          </div>
          <div className="w-16 h-px bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-3 flex-1 justify-center opacity-50">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">3</div>
            <span className="font-semibold text-slate-800 hidden sm:inline">Pago</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#4DB4D7]" />
                  Dirección del Servicio
                </h3>
                <Link href="/patient/addresses">
                  <Button variant="outline" className="text-[#4DB4D7] border-[#4DB4D7] hover:bg-blue-50 h-8 text-xs">
                    + Nueva dirección
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {addresses.map(addr => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div 
                      key={addr.id} 
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={cn("border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", isSelected ? "border-[#4DB4D7] bg-blue-50/30" : "border-slate-200 hover:border-slate-300")}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", isSelected ? "bg-[#4DB4D7]/10 text-[#4DB4D7]" : "bg-slate-100 text-slate-500")}>
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{addr.label}</div>
                          <div className="text-sm text-slate-500">{addr.street_line1}, {addr.neighborhood}<br/>{addr.city}, CP {addr.postal_code}</div>
                        </div>
                      </div>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", isSelected ? "bg-[#4DB4D7] text-white" : "border-2 border-slate-300")}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
                {addresses.length === 0 && <p className="text-sm text-slate-500">No tienes direcciones guardadas.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#4DB4D7]" />
                Fecha y Hora (Opcional - Programado)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Fecha de la cita</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Hora preferida</Label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-slate-800 mb-4">Notas Adicionales</h3>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                placeholder="Ej. El paciente tiene diabetes, es alergico a..."
              ></textarea>
            </CardContent>
          </Card>

        </div>

        {/* Right: Summary Sidebar */}
        <div className="space-y-4">
          <Card className="shadow-sm border-slate-200 sticky top-24">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold text-lg text-slate-800">Resumen de la Cita</h3>
              
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Servicios Seleccionados</div>
                {draft.map((s: any) => (
                  <div key={s.id} className="flex justify-between items-start text-sm">
                    <span className="text-slate-700">{s.name}</span>
                    <span className="font-medium text-slate-800">${s.base_price} MXN</span>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección</div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[#4DB4D7] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-700 block">{selectedAddress ? selectedAddress.label : 'Sin dirección seleccionada'}</span>
                    {selectedAddress && <span className="text-slate-500">{selectedAddress.street_line1}</span>}
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-slate-800">Total:</span>
                <span className="font-bold text-slate-800">${total.toFixed(2)} MXN</span>
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  onClick={handleContinue} 
                  disabled={!selectedAddressId}
                  className="w-full bg-[#cbd5e1] hover:bg-[#94a3b8] disabled:bg-slate-200 text-slate-800 h-12 text-base font-semibold"
                >
                  Continuar al Pago
                </Button>
                <Link href="/patient/catalog" className="block">
                  <Button variant="outline" className="w-full h-12 text-base font-semibold border-slate-200">
                    Volver
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
