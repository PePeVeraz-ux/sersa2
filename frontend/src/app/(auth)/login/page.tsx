'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await apiFetch<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Usar la función global para registrar el estado
      login(data.access_token, data.user);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-blue-100 z-0"></div>
      
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-2 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-2xl mx-auto mb-4 shadow-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</CardTitle>
          <CardDescription>
            Ingresa a tu cuenta de SERSA para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-visible:ring-[#4DB4D7]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="#" className="text-xs text-sky-600 hover:text-sky-800 font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-visible:ring-[#4DB4D7]"
              />
            </div>
            <Button type="submit" className="w-full mt-6 bg-[#4DB4D7] hover:bg-[#3ca1c3] text-white" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-slate-100 pt-6">
          <div className="text-center text-sm text-slate-500">
            ¿No tienes cuenta?
          </div>
          <div className="flex gap-4 w-full">
            <Link href="/register/patient" className="w-full">
              <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 text-slate-700">Soy Paciente</Button>
            </Link>
            <Link href="/register/nurse" className="w-full">
              <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 text-slate-700">Soy Enfermero(a)</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
