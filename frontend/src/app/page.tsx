import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartPulse, Shield, MapPin, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#4DB4D7] flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900">SERSA</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-slate-200">Iniciar Sesión</Button>
            </Link>
            <Link href="/register/patient">
              <Button className="bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <MapPin className="w-4 h-4" />
            Zona piloto: Tijuana, B.C.
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Enfermería a domicilio,{' '}
            <span className="text-[#4DB4D7]">cuando la necesites</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-10">
            Conectamos pacientes con enfermeros certificados. Solicita servicios inmediatos o programados con geolocalización en tiempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/patient">
              <Button className="bg-[#4DB4D7] hover:bg-[#3ba0c2] text-white h-14 px-8 text-lg font-bold rounded-2xl w-full sm:w-auto">
                Solicitar Servicio
              </Button>
            </Link>
            <Link href="/register/nurse">
              <Button variant="outline" className="h-14 px-8 text-lg font-bold rounded-2xl border-slate-200 w-full sm:w-auto">
                Soy Enfermero(a)
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: HeartPulse, title: 'Profesionales Certificados', desc: 'Todos los enfermeros pasan verificación KYC con cédula y título.' },
            { icon: Clock, title: 'On-Demand o Programado', desc: 'Servicios inmediatos o citas agendadas según tu necesidad.' },
            { icon: Shield, title: 'Seguro y Confiable', desc: 'Chat encriptado, reportes clínicos digitales y pagos protegidos.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="w-14 h-14 bg-sky-50 text-[#4DB4D7] rounded-2xl flex items-center justify-center mb-5">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
