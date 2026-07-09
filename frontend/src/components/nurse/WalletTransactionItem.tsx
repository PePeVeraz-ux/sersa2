import { ArrowDownLeft, ArrowUpRight, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WalletTransactionItem({ transaction }: { transaction: any }) {
  const isIncome = Number(transaction.amount) > 0;
  
  const serviceName = transaction.service_request?.items?.[0]?.service?.name || 'Servicio General';
  
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shadow-sm",
          isIncome ? "bg-emerald-100" : "bg-red-100"
        )}>
          {isIncome ? (
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
          ) : (
            <ArrowUpRight className="w-6 h-6 text-red-600" />
          )}
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-900">
            {transaction.transaction_type === 'service_income' ? `Ingreso: ${serviceName}` : 'Comisión SERSA'}
          </h4>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(transaction.created_at).toLocaleDateString('es-MX', { 
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
              })}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {transaction.description}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className={cn(
          "font-bold text-lg",
          isIncome ? "text-emerald-600" : "text-red-600"
        )}>
          {isIncome ? '+' : '-'}${Math.abs(Number(transaction.amount)).toFixed(2)}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          Saldo: ${Number(transaction.balance_after).toFixed(2)}
        </div>
      </div>
    </div>
  );
}
