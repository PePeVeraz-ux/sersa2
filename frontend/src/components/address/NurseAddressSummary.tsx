'use client';

import React from 'react';
import { ExternalLink, MapPin, AlertCircle } from 'lucide-react';
import {
  AddressLike,
  formatFullAddress,
  getAddressTypeLabel,
  getMapsUrl,
  hasCoordinates,
} from '@/lib/address';
import { cn } from '@/lib/utils';

type NurseAddressSummaryProps = {
  address?: AddressLike | null;
  compact?: boolean;
  showVerifyHint?: boolean;
  className?: string;
};

export function NurseAddressSummary({
  address,
  compact = false,
  showVerifyHint = true,
  className,
}: NurseAddressSummaryProps) {
  if (!address?.street_line1) {
    return <p className="text-sm text-slate-400">Sin dirección registrada</p>;
  }

  const typeLabel = getAddressTypeLabel(address);
  const fullAddress = formatFullAddress(address);
  const mapsUrl = getMapsUrl(address);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
          {typeLabel}
        </span>
        {!hasCoordinates(address) && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Sin ubicación en mapa
          </span>
        )}
      </div>

      <p className={cn('text-slate-600 flex items-start gap-1.5', compact ? 'text-sm' : 'text-sm leading-relaxed')}>
        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{fullAddress}</span>
      </p>

      {address.references_text && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
          <span className="font-medium text-slate-600">Referencias del paciente:</span>{' '}
          {address.references_text}
        </p>
      )}

      {showVerifyHint && (
        <p className="text-xs text-amber-700/90 bg-amber-50/80 rounded-lg px-2.5 py-2 border border-amber-100">
          Verifica calle, colonia y referencias antes de ir. El paciente pudo escribir algún dato incorrecto.
        </p>
      )}

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4DB4D7] hover:text-[#3ba0c2] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir en Google Maps
        </a>
      )}
    </div>
  );
}
