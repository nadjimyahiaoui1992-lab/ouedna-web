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

function isValidCoordinate(latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function parseMode(value: string | null): TravelMode {
  switch (value) {
    case 'walk':
      return 'walk';
    case 'motorcycle':
      return 'motorcycle';
    default:
      return 'car';
  }
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
    { baseUrl: LEGACY_CAR_ROUTER, profile: 'driving' }
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

  if (type === 'depart') {
    return { instruction: `انطلق من موقعك الحالي${road}`, distanceMeters, type: 'depart' };
  }
  if (type === 'arrive') {
    return { instruction: 'وصلت إلى وجهتك', distanceMeters, type: 'arrive' };
  }
  if (type === 'roundabout' || type === 'rotary') {
    return { instruction: `تابع عبر الدوار${road}`, distanceMeters, type: 'roundabout' };
  }
  if (modifier.includes('left')) {
    return { instruction: `انعطف يساراً${road}`, distanceMeters, type: 'turn-left' };
  }
  if (modifier.includes('right')) {
    return { instruction: `انعطف يميناً${road}`, distanceMeters, type: 'turn-right' };
  }
  return { instruction: `تابع للأمام${road}`, distanceMeters, type: 'straight' };
}

async function requestRoute(
  provider: RouteProvider,
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  mode: TravelMode
) {
  const url = new URL(
    `${provider.baseUrl}/route/v1/${provider.profile}/${originLng},${originLat};${destLng},${destLat}`
  );
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
    if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const geometry = route.geometry?.coordinates;
    if (!Array.isArray(geometry) || geometry.length < 2) return null;
    const rawSteps = Array.isArray(route.legs)
      ? route.legs.flatMap((leg: { steps?: unknown }) =>
          Array.isArray(leg.steps) ? leg.steps : []
        )
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const originLat = Number(searchParams.get('originLat'));
  const originLng = Number(searchParams.get('originLng'));
  const destLat = Number(searchParams.get('destLat'));
  const destLng = Number(searchParams.get('destLng'));
  const mode = parseMode(searchParams.get('mode'));

  if (!isValidCoordinate(originLat, originLng) || !isValidCoordinate(destLat, destLng)) {
    return NextResponse.json({ error: 'إحداثيات غير صالحة.' }, { status: 400 });
  }

  for (const provider of providersFor(mode)) {
    try {
      const result = await requestRoute(provider, originLat, originLng, destLat, destLng, mode);
      if (result) return NextResponse.json(result, { status: 200 });
    } catch {
      // Essayez le fournisseur suivant sans exposer les détails internes.
    }
  }

  return NextResponse.json(
    {
      error: 'تعذر إيجاد مسار حقيقي الآن. تحقق من اتصال الإنترنت وحاول مجدداً.',
      code: 'ROUTING_UNAVAILABLE',
    },
    { status: 503 }
  );
}
