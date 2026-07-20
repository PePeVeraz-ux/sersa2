'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation } from 'lucide-react';

const TIJUANA_CENTER = { lat: 32.5149, lng: -117.0382 };
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export type MapRequestPoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  subtitle?: string;
  addressDetail?: string;
  references?: string;
  mapsUrl?: string;
  kind: 'stop' | 'available';
  order?: number;
};

type RouteMapProps = {
  stops: MapRequestPoint[];
  availableRequests?: MapRequestPoint[];
  className?: string;
};

type UserLocation = {
  lat: number;
  lng: number;
};

function getBounds(points: Array<{ lat: number; lng: number }>) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

export default function RouteMap({ stops, availableRequests = [], className }: RouteMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [geoStatus, setGeoStatus] = useState<'loading' | 'active' | 'denied' | 'unsupported'>('loading');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allPoints = useMemo(
    () => [...stops, ...availableRequests].filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
    [stops, availableRequests],
  );

  const [routeLine, setRouteLine] = useState<any>(null);
  const [hasFitBounds, setHasFitBounds] = useState(false);

  const pointIdsString = useMemo(
    () => allPoints.map((p) => p.id).join(','),
    [allPoints],
  );

  // Reset bounds fitting when stops/availableRequests change
  useEffect(() => {
    setHasFitBounds(false);
  }, [pointIdsString]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus('active');
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchRouteData = async () => {
      const linePoints: Array<[number, number]> = [];

      // 1. User Location (start point)
      if (userLocation) {
        linePoints.push([userLocation.lng, userLocation.lat]);
      }

      // 2. Stops (active route)
      if (stops.length > 0) {
        stops.forEach((stop) => {
          linePoints.push([stop.lng, stop.lat]);
        });
      } else {
        // 3. Available requests if no stops
        if (selectedId) {
          const selectedReq = availableRequests.find((r) => r.id === selectedId);
          if (selectedReq) {
            linePoints.push([selectedReq.lng, selectedReq.lat]);
          }
        } else if (availableRequests.length === 1) {
          linePoints.push([availableRequests[0].lng, availableRequests[0].lat]);
        }
      }

      if (linePoints.length < 2) {
        if (active) setRouteLine(null);
        return;
      }

      try {
        const coordsQuery = linePoints.map((p) => `${p[0]},${p[1]}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM routing request failed');
        const data = await res.json();

        if (data.routes && data.routes.length > 0 && active) {
          setRouteLine({
            type: 'Feature' as const,
            properties: {},
            geometry: data.routes[0].geometry,
          });
        }
      } catch (error) {
        console.error('Error fetching street route:', error);
        // Fallback to straight line representation
        if (active) {
          setRouteLine({
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: linePoints,
            },
          });
        }
      }
    };

    fetchRouteData();

    return () => {
      active = false;
    };
  }, [stops, availableRequests, selectedId, userLocation]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || hasFitBounds) return;

    const points = [
      ...(userLocation ? [userLocation] : []),
      ...allPoints.map((p) => ({ lat: p.lat, lng: p.lng })),
    ];

    if (points.length === 0) {
      map.flyTo({ center: [TIJUANA_CENTER.lng, TIJUANA_CENTER.lat], zoom: 12, duration: 800 });
      return;
    }

    if (points.length === 1) {
      map.flyTo({ center: [points[0].lng, points[0].lat], zoom: 14, duration: 800 });
      setHasFitBounds(true);
      return;
    }

    const bounds = getBounds(points);
    map.fitBounds(
      [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat],
      ],
      { padding: 72, duration: 800, maxZoom: 15 },
    );
    setHasFitBounds(true);
  }, [pointIdsString, userLocation, hasFitBounds]);

  const initialView = userLocation ?? (allPoints[0] ? { lat: allPoints[0].lat, lng: allPoints[0].lng } : TIJUANA_CENTER);

  return (
    <div className={className}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: initialView.lng,
          latitude: initialView.lat,
          zoom: 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {routeLine && (
          <Source id="route-line" type="geojson" data={routeLine}>
            <Layer
              id="route-line-layer"
              type="line"
              paint={{
                'line-color': '#4DB4D7',
                'line-width': 5,
                'line-opacity': 0.85,
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
            />
          </Source>
        )}

        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-emerald-400/30 animate-ping" />
              <span className="relative w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md" />
            </div>
          </Marker>
        )}

        {availableRequests.map((point) => (
          <Marker
            key={`available-${point.id}`}
            longitude={point.lng}
            latitude={point.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedId(point.id);
            }}
          >
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          </Marker>
        ))}

        {stops.map((point) => (
          <Marker
            key={`stop-${point.id}`}
            longitude={point.lng}
            latitude={point.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedId(point.id);
            }}
          >
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-sm">
                {point.order ?? '•'}
              </div>
            </div>
          </Marker>
        ))}

        {selectedId && (() => {
          const point = allPoints.find((p) => p.id === selectedId);
          if (!point) return null;
          return (
            <Popup
              longitude={point.lng}
              latitude={point.lat}
              anchor="top"
              onClose={() => setSelectedId(null)}
              closeButton
              closeOnClick={false}
              className="[&_.maplibregl-popup-content]:rounded-xl [&_.maplibregl-popup-content]:p-3 [&_.maplibregl-popup-content]:shadow-lg"
            >
              <div className="text-sm max-w-[220px]">
                <p className="font-semibold text-slate-800">{point.label}</p>
                {point.subtitle && <p className="text-slate-500 mt-0.5">{point.subtitle}</p>}
                {point.addressDetail && (
                  <p className="text-slate-600 text-xs mt-2 leading-relaxed">{point.addressDetail}</p>
                )}
                {point.references && (
                  <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 rounded px-2 py-1">
                    Ref: {point.references}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1.5">
                  {point.kind === 'available' ? 'Solicitud disponible' : 'Parada en tu ruta'}
                </p>
                {point.mapsUrl && (
                  <a
                    href={point.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-medium text-[#4DB4D7] mt-2 hover:underline"
                  >
                    Ver en Google Maps
                  </a>
                )}
              </div>
            </Popup>
          );
        })()}
      </Map>

      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium text-slate-700">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            geoStatus === 'active'
              ? 'bg-green-500 animate-pulse'
              : geoStatus === 'loading'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-slate-400'
          }`}
        />
        {geoStatus === 'active' && 'Tu ubicación activa'}
        {geoStatus === 'loading' && 'Obteniendo ubicación...'}
        {geoStatus === 'denied' && 'GPS no disponible'}
        {geoStatus === 'unsupported' && 'GPS no soportado'}
      </div>

      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          Tu ubicación
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          Paradas de ruta
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          Solicitudes disponibles
        </div>
      </div>

      {geoStatus === 'denied' && (
        <div className="absolute bottom-4 right-4 max-w-xs bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md text-xs text-slate-500 flex items-start gap-2">
          <Navigation className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          Activa la ubicación en tu navegador para ver dónde estás en el mapa.
        </div>
      )}
    </div>
  );
}
