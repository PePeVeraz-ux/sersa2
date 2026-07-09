'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function PatientRegister() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear el paciente
      await apiFetch('/auth/register/patient', {
        method: 'POST',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      // 2. Hacer login automático tras el registro
      const loginData = await apiFetch<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      // 3. Establecer el estado global y redirigir
      login(loginData.access_token, loginData.user);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-[#4DB4D7] font-bold text-3xl mb-2 tracking-tight">SERSA</div>
          <h1 className="text-2xl font-bold text-slate-800">Crea tu cuenta de Paciente</h1>
          <p className="text-slate-500 mt-2">Bienvenido a SERSA. Por favor, ingresa tus datos para continuar.</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700">Nombres</Label>
                  <Input id="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Ej. Juan" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700">Apellidos</Label>
                  <Input id="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Ej. Pérez" className="bg-slate-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Correo electrónico</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="juan.perez@example.com" className="bg-slate-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="bg-slate-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">Confirmar contraseña</Label>
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" className="bg-slate-50" />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white h-12 text-base font-semibold mt-6 shadow-sm">
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">O regístrate con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" className="h-12 border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
                Google
              </Button>
              <Button variant="outline" type="button" className="h-12 border-slate-200 hover:bg-slate-50 text-slate-600 font-medium">
                Apple
              </Button>
            </div>

          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600 mt-8">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-[#4DB4D7] hover:underline font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
