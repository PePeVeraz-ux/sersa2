'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Trash2, Loader2, Home, Briefcase, Star, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

const labelIcons: Record<string, any> = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

const labelNames: Record<string, string> = {
  home: 'Casa',
  work: 'Trabajo',
  other: 'Otra',
};

export default function PatientAddresses() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: 'home',
    street_line1: '',
    street_line2: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    references_text: '',
  });

  const fetchAddresses = () => {
    if (!token) return;
    apiFetch<any[]>('/addresses', { token })
      .then(setAddresses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const handleSave = async () => {
    if (!token || !formData.street_line1 || !formData.city || !formData.postal_code) return;
    setSaving(true);
    try {
      await apiFetch('/addresses', {
        method: 'POST',
        token,
        body: JSON.stringify(formData),
      });
      setShowForm(false);
      setFormData({ label: 'home', street_line1: '', street_line2: '', neighborhood: '', city: '', state: '', postal_code: '', references_text: '' });
      fetchAddresses();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setDeletingId(id);
    try {
      await apiFetch(`/addresses/${id}`, { method: 'DELETE', token });
      fetchAddresses();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4DB4D7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mis Direcciones</h1>
          <p className="text-slate-500 mt-1">Administra los domicilios donde recibes servicios médicos.</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white shadow-sm gap-2 h-11 px-6"
          >
            <Plus className="w-4 h-4" />
            Agregar Dirección
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="shadow-md border-[#4DB4D7]/20 border-2">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-slate-800">Nueva Dirección</CardTitle>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Label selector */}
            <div className="space-y-2">
              <Label className="text-slate-600">Tipo de dirección</Label>
              <div className="flex gap-3">
                {(['home', 'work', 'other'] as const).map((label) => {
                  const Icon = labelIcons[label];
                  return (
                    <button
                      key={label}
                      onClick={() => setFormData({ ...formData, label })}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                        formData.label === label
                          ? 'border-[#4DB4D7] bg-[#4DB4D7]/10 text-[#4DB4D7]'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {labelNames[label]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street_line1" className="text-slate-600">Calle y Número *</Label>
                <Input id="street_line1" value={formData.street_line1} onChange={handleChange} placeholder="Av. Revolución 1234" className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street_line2" className="text-slate-600">Interior / Departamento</Label>
                <Input id="street_line2" value={formData.street_line2} onChange={handleChange} placeholder="Depto. 5B" className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-slate-600">Colonia</Label>
                <Input id="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Centro" className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-slate-600">Ciudad *</Label>
                <Input id="city" value={formData.city} onChange={handleChange} placeholder="Tijuana" className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-slate-600">Estado</Label>
                <Input id="state" value={formData.state} onChange={handleChange} placeholder="Baja California" className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code" className="text-slate-600">Código Postal *</Label>
                <Input id="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="22000" className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="references_text" className="text-slate-600">Referencias</Label>
                <Input id="references_text" value={formData.references_text} onChange={handleChange} placeholder="Casa blanca con portón negro" className="bg-slate-50" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving || !formData.street_line1 || !formData.city || !formData.postal_code}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-11 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Guardar Dirección
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="h-11">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Addresses List */}
      {addresses.length === 0 && !showForm ? (
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No tienes direcciones guardadas</h3>
            <p className="text-slate-500 text-sm mb-6">Agrega una dirección para poder solicitar servicios médicos a domicilio.</p>
            <Button onClick={() => setShowForm(true)} className="bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white gap-2">
              <Plus className="w-4 h-4" />
              Agregar mi primera dirección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const Icon = labelIcons[addr.label] || MapPin;
            return (
              <Card key={addr.id} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                    addr.is_default ? 'bg-[#4DB4D7]/10 text-[#4DB4D7]' : 'bg-slate-100 text-slate-400'
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800">
                        {addr.custom_label || labelNames[addr.label] || 'Dirección'}
                      </span>
                      {addr.is_default && (
                        <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" /> Predeterminada
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {addr.street_line1}{addr.street_line2 ? `, ${addr.street_line2}` : ''}
                    </p>
                    <p className="text-sm text-slate-500">
                      {[addr.neighborhood, addr.city, addr.state].filter(Boolean).join(', ')} • CP {addr.postal_code}
                    </p>
                    {addr.references_text && (
                      <p className="text-xs text-slate-400 mt-1">Ref: {addr.references_text}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={!!deletingId}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  >
                    {deletingId === addr.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
