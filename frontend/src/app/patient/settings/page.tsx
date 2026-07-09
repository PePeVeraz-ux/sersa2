'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function ProfileSettings() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.patient_profile?.first_name || '',
        last_name: user.patient_profile?.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.patient_profile?.date_of_birth ? new Date(user.patient_profile.date_of_birth).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!token) return;
    setLoading(true);
    setMessage('');
    try {
      await apiFetch('/profiles/patient', {
        method: 'PATCH',
        token,
        body: JSON.stringify(formData),
      });
      setMessage('Perfil actualizado correctamente.');
    } catch (e) {
      setMessage('Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800">Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm font-bold text-slate-400 text-2xl">
                {formData.first_name?.[0]}{formData.last_name?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#4DB4D7] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-[#3ba0c2] transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{formData.first_name} {formData.last_name}</div>
              <div className="text-sm text-slate-500 mb-2">Paciente</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800">Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-slate-600">Nombre(s)</Label>
              <Input id="first_name" value={formData.first_name} onChange={handleChange} className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-slate-600">Apellidos</Label>
              <Input id="last_name" value={formData.last_name} onChange={handleChange} className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600">Correo Electrónico (No editable)</Label>
              <Input id="email" value={formData.email} disabled className="bg-slate-100 text-slate-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-600">Teléfono</Label>
              <Input id="phone" value={formData.phone} onChange={handleChange} className="bg-slate-50" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="date_of_birth" className="text-slate-600">Fecha de Nacimiento</Label>
              <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className="bg-slate-50 max-w-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 shadow-sm h-11">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar Cambios
        </Button>
        {message && <span className="text-sm font-medium text-slate-600">{message}</span>}
      </div>
    </div>
  );
}
