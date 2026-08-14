import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type TravelMode = 'car' | 'walk' | 'motorcycle';
type RouteStep = {
  instruction: string;
  distanceMeters: number;
  type: 'depart' | 'straight' | 'turn-left' | 'turn-right' | 'roundabout' | 'arrive';
};

type RouteProvider = {
  baseUrl: string;
  profile: string;
};

const CAR_ROUTER = 'https://routing.openstreetmap.de/routed-car';
const FOOT_ROUTER = 'https://routing.openstreetmap.de/routed-foot';
const LEGACY_CAR_ROUTER = 'https://router.project-osrm.org';
const MAX_ROUTE_DISTANCE_KM = 500;

function isValidCoordinate(latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function parseMode(value: string | null): TravelMode | null {
  if (!value || value === 'car') return 'car';
  if (value === 'walk' || value === 'motorcycle') return value;
  return null;
}

function distanceKm(originLat: number, originLng: number, destLat: number, destLng: number) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRadians(destLat - originLat);
  const deltaLng = toRadians(destLng - originLng);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRadians(originLat)) * Math.cos(toRadians(destLat)) * Math.sin(deltaLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function providersFor(mode: TravelMode): RouteProvider[] {
  const configuredCar = process.env.OSRM_SERVER_URL?.replace(/\/$/, '');
  const configuredFoot = process.env.OSRM_FOOT_SERVER_URL?.replace(/\/$/, '');
  const providers: RouteProvider[] = [];

  if (mode === 'walk') {
    if (configuredFoot) providers.push({ baseUrl: configuredFoot, profile: 'foot' });
    providers.push({ baseUrl: FOOT_ROUTER, profile: 'foot' });
    return providers;
  }

  if (configuredCar) providers.push({ baseUrl: configuredCar, profile: 'driving' });
  providers.push(
    { baseUrl: CAR_ROUTER, profile: 'driving' },
    { baseUrl: LEGACY_CAR_ROUTER, profile: 'driving' },
  );
  return providers;
}

function instructionFor(step: Record<string, unknown>): RouteStep {
  const maneuver = (step.maneuver ?? {}) as Record<string, unknown>;
  const type = String(maneuver.type ?? 'continue');
  const modifier = String(maneuver.modifier ?? '');
  const street = String(step.name ?? '').trim();
  const road = street ? ` باتجاه ${street}` : '';
  const distanceMeters = Number(step.distance ?? 0);

  if (type === 'depart') return { instruction: `انطلق من موقعك الحالي${road}`, distanceMeters, type: 'depart' };
  if (type === 'arrive') return { instruction: 'وصلت إلى وجهتك', distanceMeters, type: 'arrive' };
  if (type === 'roundabout' || type === 'rotary') return { instruction: `تابع عبر الدوار${road}`, distanceMeters, type: 'roundabout' };
  if (modifier.includes('left')) return { instruction: `انعطف يساراً${road}`, distanceMeters, type: 'turn-left' };
  if (modifier.includes('right')) return { instruction: `انعطف يميناً${road}`, distanceMeters, type: 'turn-right' };
  return { instruction: `تابع للأمام${road}`, distanceMeters, type: 'straight' };
}

async function requestRoute(
  provider: RouteProvider,
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  mode: TravelMode,
) {
  const url = new URL(`${provider.baseUrl}/route/v1/${provider.profile}/${originLng},${originLat};${destLng},${destLat}`);
  url.searchParams.set('overview', 'full');
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('steps', 'true');
  url.searchParams.set('alternatives', 'false');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'User-Agent': 'Ouedna/1.10 routing' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) return null;

    const route = data.routes[0];
    const geometry = route.geometry?.coordinates;
    if (!Array.isArray(geometry) || geometry.length < 2) return null;
    const rawSteps = Array.isArray(route.legs)
      ? route.legs.flatMap((leg: { steps?: unknown }) => Array.isArray(leg.steps) ? leg.steps : [])
      : [];
    const durationSeconds = Number(route.duration ?? 0);
    const adjustedDuration = mode === 'motorcycle'
      ? Math.max(60, Math.round(durationSeconds * 0.88))
      : durationSeconds;

    return {
      source: provider.baseUrl,
      profile: mode,
      estimated: false,
      coordinates: geometry.map((coordinate: [number, number]) => [coordinate[1], coordinate[0]]),
      distanceKm: Number((Number(route.distance ?? 0) / 1000).toFixed(1)),
      durationMin: Math.max(1, Math.ceil(adjustedDuration / 60)),
      steps: rawSteps.map((step: Record<string, unknown>) => instructionFor(step)),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function jsonResponse(payload: unknown, status: number, cacheControl: string) {
  return NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': cacheControl },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const required = ['originLat', 'originLng', 'destLat', 'destLng'] as const;
  if (required.some((name) => !searchParams.get(name)?.trim())) {
    return jsonResponse({ error: 'المعلمات المطلوبة للإحداثيات مفقودة.' }, 400, 'no-store');
  }

  const originLat = Number(searchParams.get('originLat'));
  const originLng = Number(searchParams.get('originLng'));
  const destLat = Number(searchParams.get('destLat'));
  const destLng = Number(searchParams.get('destLng'));
  const mode = parseMode(searchParams.get('mode'));

  if (!mode || !isValidCoordinate(originLat, originLng) || !isValidCoordinate(destLat, destLng)) {
    return jsonResponse({ error: 'إحداثيات أو وسيلة تنقل غير صالحة.' }, 400, 'no-store');
  }
  if (distanceKm(originLat, originLng, destLat, destLng) > MAX_ROUTE_DISTANCE_KM) {
    return jsonResponse({ error: 'المسافة المطلوبة تتجاوز نطاق الخدمة.' }, 400, 'no-store');
  }

  for (const provider of providersFor(mode)) {
    try {
      const result = await requestRoute(provider, originLat, originLng, destLat, destLng, mode);
      if (result) return jsonResponse(result, 200, 'public, s-maxage=300, stale-while-revalidate=900');
    } catch {
      // Continue to the next provider without exposing upstream details.
    }
  }

  return jsonResponse(
    {
      error: 'تعذر إيجاد مسار حقيقي الآن. تحقق من اتصال الإنترنت وحاول مجدداً.',
      code: 'ROUTING_UNAVAILABLE',
    },
    503,
    'no-store',
  );
}
