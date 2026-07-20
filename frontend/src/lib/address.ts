export type AddressLike = {
  label?: string;
  custom_label?: string | null;
  street_line1?: string;
  street_line2?: string | null;
  neighborhood?: string | null;
  city?: string;
  state?: string | null;
  postal_code?: string;
  references_text?: string | null;
  lat?: number;
  lng?: number;
};

const LABEL_NAMES: Record<string, string> = {
  home: 'Casa',
  work: 'Trabajo',
  other: 'Otra',
};

export function getAddressTypeLabel(address?: AddressLike | null): string {
  if (!address) return 'Dirección';
  if (address.custom_label?.trim()) return address.custom_label.trim();
  const key = (address.label || '').toLowerCase();
  return LABEL_NAMES[key] || 'Dirección';
}

export function formatFullAddress(address?: AddressLike | null): string {
  if (!address?.street_line1) return 'Sin dirección registrada';

  const line1 = [address.street_line1, address.street_line2].filter(Boolean).join(', ');
  const locality = [address.neighborhood, address.city, address.state].filter(Boolean).join(', ');
  const postal = address.postal_code ? `CP ${address.postal_code}` : null;

  return [line1, locality, postal].filter(Boolean).join(' · ');
}

export function getMapsUrl(address?: AddressLike | null): string | null {
  if (!address) return null;

  if (Number.isFinite(address.lat) && Number.isFinite(address.lng)) {
    return `https://www.google.com/maps?q=${address.lat},${address.lng}`;
  }

  const query = formatFullAddress(address);
  if (!query || query === 'Sin dirección registrada') return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function hasCoordinates(address?: AddressLike | null): boolean {
  return Number.isFinite(address?.lat) && Number.isFinite(address?.lng);
}
