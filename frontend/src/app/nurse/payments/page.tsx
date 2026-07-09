'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Wallet, ArrowRight, Activity, TrendingUp, DownloadCloud } from 'lucide-react';
import { WalletTransactionItem } from '@/components/nurse/WalletTransactionItem';
import { apiFetch } from '@/lib/api';

export default function NursePaymentsPage() {
  const { token } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWallet() {
      try {
        const data = await apiFetch<any>('/wallets/my-wallet', { token });
        setWallet(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchWallet();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  const balance = Number(wallet?.balance) || 0;
  const transactions = wallet?.transactions || [];
  
  // Calculate earnings this month
  const currentMonth = new Date().getMonth();
  const earningsThisMonth = transactions
    .filter((t: any) => new Date(t.created_at).getMonth() === currentMonth && t.transaction_type === 'service_income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Billetera y Pagos</h1>
        <p className="text-slate-500 mt-2">Gestiona tus ingresos y revisa el historial de transacciones.</p>
      </div>

      {/* Top Section: Balance Card & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-sky-500 via-[#4DB4D7] to-blue-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <p className="text-sky-100 font-medium tracking-wide uppercase text-sm">Saldo Disponible</p>
            <h2 className="text-5xl font-extrabold mt-2 mb-8 tracking-tight">
              ${balance.toFixed(2)} <span className="text-2xl text-sky-200 font-medium">MXN</span>
            </h2>
            
            <div className="flex items-center gap-4">
              <button className="bg-white text-sky-600 px-6 py-3 rounded-xl font-bold hover:bg-sky-50 transition-colors flex items-center gap-2 shadow-sm">
                Retirar Fondos
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
                <DownloadCloud className="w-5 h-5" />
                Estado de Cuenta
              </button>
            </div>
          </div>
        </div>

        {/* Mini Stats Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-slate-500">Ingresos del Mes</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">${earningsThisMonth.toFixed(2)}</h3>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 w-fit px-3 py-1 rounded-full">
              <Activity className="w-4 h-4" />
              Excelente rendimiento
            </div>
          </div>
        </div>

      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Historial de Transacciones</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Wallet className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p>Aún no tienes movimientos en tu billetera.</p>
              <p className="text-sm">Tus ingresos aparecerán aquí cuando finalices un servicio.</p>
            </div>
          ) : (
            transactions.map((tx: any) => (
              <WalletTransactionItem key={tx.id} transaction={tx} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
