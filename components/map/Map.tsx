'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Compass, Plus, Minus, LocateFixed, Maximize, Minimize } from 'lucide-react';
import { Place } from '@/data/places';

/* ============================================================
   أيقونات العلامات (Markers) — تصنيف تلقائي احترافي
   ============================================================ */

interface CategoryStyle {
  emoji: string;
  bgColor: string;
  keywords: string[];
}

const CATEGORY_STYLES: CategoryStyle[] = [
  {
    emoji: '🏨',
    bgColor: '#2563eb', // أزرق
    keywords: ['فندق', 'فنادق', 'نزل', 'استراحة', 'شقق فندقية'],
  },
  {
    emoji: '🍽️',
    bgColor: '#ea580c', // برتقالي
    keywords: ['مطعم', 'مطاعم', 'أكل', 'مأكولات', 'وجبات', 'مقهى', 'مقاهي', 'كافيه', 'حلويات'],
  },
  {
    emoji: '🏥',
    bgColor: '#dc2626', // أحمر
    keywords: ['صحي', 'مستشفى', 'مستشفيات', 'عيادة', 'عيادات', 'صيدلي', 'صيدلية', 'طوارئ', 'طبي'],
  },
  {
    emoji: '🛒',
    bgColor: '#16a34a', // أخضر
    keywords: ['سوق', 'أسواق', 'تجاري', 'تسوق', 'محل', 'محلات', 'مول'],
  },
  {
    emoji: '🕌',
    bgColor: '#0d9488', // فيروزي
    keywords: ['مسجد', 'مساجد', 'جامع', 'مصلى'],
  },
  {
    emoji: '🎓',
    bgColor: '#4338ca', // نيلي
    keywords: ['مدرسة', 'مدارس', 'جامعة', 'معهد', 'تعليم', 'تعليمي'],
  },
  {
    emoji: '🏦',
    bgColor: '#0369a1', // أزرق داكن
    keywords: ['بنك', 'بنوك', 'مصرف', 'صراف'],
  },
  {
    emoji: '⛽',
    bgColor: '#b45309', // كهرماني
    keywords: ['وقود', 'محطة', 'بنزين', 'غاز'],
  },
  {
    emoji: '🌳',
    bgColor: '#15803d', // أخضر داكن
    keywords: ['حديقة', 'حدائق', 'منتزه', 'ترفيه', 'ترفيهي'],
  },
  {
    emoji: '🏛️',
    bgColor: '#7c3aed', // بنفسجي
    keywords: ['تاريخ', 'ثقاف', 'معلم', 'أثري', 'متحف', 'حكومي', 'إدارة', 'بلدية'],
  },
];

const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  emoji: '📍',
  bgColor: '#7c3aed',
  keywords: [],
};

const getCategoryStyle = (category: string): CategoryStyle => {
  const normalized = category?.trim() ?? '';
  const match = CATEGORY_STYLES.find((style) =>
    style.keywords.some((keyword) => normalized.includes(keyword))
  );
  return match ?? DEFAULT_CATEGORY_STYLE;
};

const getCategoryIcon = (category: string) => {
  const { emoji, bgColor } = getCategoryStyle(category);

  return L.divIcon({
    className: 'soufmap-cat-icon',
    html: `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:32px;height:32px;
        background:linear-gradient(145deg, ${bgColor}, ${bgColor}dd);
        border:2.5px solid white;border-radius:50%;
        box-shadow:0 4px 10px rgba(0,0,0,0.35);
        font-size:15px;
      ">${emoji}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

// نقطة البداية: موقع الزائر — دائرة زرقاء نابضة (Pulse)
const buildUserIcon = (moving: boolean) =>
  L.divIcon({
    className: 'soufmap-user-icon',
    html: `
      <style>
        @keyframes soufmapPulse { 0% { transform: scale(0.6); opacity: 0.55; } 100% { transform: scale(1.9); opacity: 0; } }
      </style>
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;width:20px;height:20px;border-radius:50%;background:#3b82f6;opacity:0.55;animation:soufmapPulse 1.8s ease-out infinite;"></span>
        <span style="position:relative;width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:11px;line-height:1;">
          ${moving ? '🚗' : ''}
        </span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

// نقطة النهاية: المعلم — دبوس أحمر (Pin)
const destinationIcon = L.divIcon({
  className: 'soufmap-dest-icon',
  html: `
    <div style="position:relative;width:34px;height:46px;">
      <div style="
        position:absolute;top:0;left:5px;width:24px;height:24px;
        background:#dc2626;border:3px solid #ffffff;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,0.45);
      "></div>
      <div style="
        position:absolute;top:8px;left:13px;width:8px;height:8px;
        background:#ffffff;border-radius:50%;
      "></div>
    </div>
  `,
  iconSize: [34, 46],
  iconAnchor: [17, 44],
});

/* ============================================================
   مكوّنات مساعدة تعمل داخل سياق الخريطة (useMap)
   ============================================================ */

function FollowOrFit({
  isNavigating,
  userLocation,
  routeCoordinates,
  selectedPlace,
}: {
  isNavigating: boolean;
  userLocation: { lat: number; lng: number } | null;
  routeCoordinates: [number, number][];
  selectedPlace: Place | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (isNavigating && userLocation) {
      // أثناء الملاحة الحيّة: تتبّع الزائر عن قرب
      map.setView([userLocation.lat, userLocation.lng], 18, { animate: true });
      return;
    }
    if (!isNavigating && routeCoordinates.length > 1) {
      // بعد حساب المسار: عرض المسار كاملاً من نقطة الانطلاق إلى الوجهة.
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const bounds = L.latLngBounds(routeCoordinates as L.LatLngExpression[]);
      map.fitBounds(
        bounds,
        isMobile
          ? { paddingTopLeft: [40, 100], paddingBottomRight: [40, 40] }
          : { paddingTopLeft: [60, 140], paddingBottomRight: [420, 60] }
      );
      return;
    }
    if (selectedPlace) {
      map.setView([selectedPlace.lat, selectedPlace.lng], 16, { animate: true });
    }
  }, [isNavigating, userLocation, routeCoordinates, selectedPlace, map]);

  return null;
}

function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [map]);
  return null;
}

/** أزرار التحكّم العائمة أعلى يسار الخريطة (بوصلة / تكبير / تصغير / تحديد الموقع / ملء الشاشة) */
function MapControls({
  onLocateUser,
  routeCoordinates,
  defaultCenter,
}: {
  onLocateUser: () => void;
  routeCoordinates: [number, number][];
  defaultCenter: [number, number];
}) {
  const map = useMap();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (wrapperRef.current) {
      L.DomEvent.disableClickPropagation(wrapperRef.current);
      L.DomEvent.disableScrollPropagation(wrapperRef.current);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleReorient = () => {
    if (routeCoordinates.length > 1) {
      map.fitBounds(L.latLngBounds(routeCoordinates as L.LatLngExpression[]), { padding: [60, 60] });
    } else {
      map.setView(defaultCenter, 13, { animate: true });
    }
  };

  const handleFullscreen = () => {
    const el = map.getContainer();
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const ctrlBtnClass =
    'flex items-center justify-center w-9 h-9 rounded-xl bg-[#101a35] text-white border border-white/10 shadow-lg hover:bg-[#182246] active:scale-95 transition-all';

  return (
    <div
      ref={wrapperRef}
      className="soufmap-controls absolute top-4 left-4 z-[1000] flex flex-col gap-2"
      style={{ zIndex: 1000 }}
    >
      <button type="button" onClick={handleReorient} aria-label="إعادة توجيه الخريطة" className={ctrlBtnClass}>
        <Compass size={18} />
      </button>
      <div className="flex flex-col rounded-xl overflow-hidden border border-white/10 shadow-lg">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          aria-label="تكبير"
          className="flex items-center justify-center w-9 h-9 bg-[#101a35] text-white hover:bg-[#182246] active:scale-95 transition-all border-b border-white/10"
        >
          <Plus size={18} />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          aria-label="تصغير"
          className="flex items-center justify-center w-9 h-9 bg-[#101a35] text-white hover:bg-[#182246] active:scale-95 transition-all"
        >
          <Minus size={18} />
        </button>
      </div>
      <button
        type="button"
        onClick={onLocateUser}
        aria-label="تحديد موقعي الحالي"
        title="تحديد موقعي الحالي"
        className={`${ctrlBtnClass} !bg-sky-600 hover:!bg-sky-500 text-white`}
      >
        <LocateFixed size={18} />
      </button>
      <button type="button" onClick={handleFullscreen} aria-label="ملء الشاشة" className={ctrlBtnClass}>
        {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
      </button>
    </div>
  );
}

/* ============================================================
   أنواع البيانات
   ============================================================ */

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  type?: 'depart' | 'straight' | 'turn-left' | 'turn-right' | 'roundabout' | 'arrive' | string;
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  estimated?: boolean;
  steps?: RouteStep[];
}

interface MapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  mapTheme?: 'day' | 'night';
  travelMode?: 'car' | 'walk' | 'motorcycle';
  userLocation?: { lat: number; lng: number } | null;
  routeTarget?: Place | null;
  onRouteInfoCalculated?: (info: RouteInfo | null) => void;
  onRouteStatusChange?: (status: { loading: boolean; error: string | null }) => void;
  onLocateUser?: () => void;
  isNavigating?: boolean;
}

const DEFAULT_CENTER: [number, number] = [33.3683, 6.8667]; // وادي سوف

export default function Map({
  places,
  selectedPlace,
  onSelectPlace,
  mapTheme = 'day',
  travelMode = 'car',
  userLocation = null,
  routeTarget = null,
  onRouteInfoCalculated,
  onRouteStatusChange,
  onLocateUser,
  isNavigating = false,
}: MapProps) {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : selectedPlace
    ? [selectedPlace.lat, selectedPlace.lng]
    : DEFAULT_CENTER;

  // A CSS night treatment on the already-reliable OSM source avoids a blank map
  // when a third-party dark-tile CDN is blocked or temporarily unavailable.
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  // حساب مسار حقيقي: البداية دائماً موقع الزائر الحالي (userLocation)، والنهاية دائماً المعلم المختار (routeTarget)
  useEffect(() => {
    let cancelled = false;

    async function fetchRoute() {
      if (!userLocation || !routeTarget) {
        setRouteCoordinates([]);
        if (onRouteInfoCalculated) onRouteInfoCalculated(null);
        if (onRouteStatusChange) onRouteStatusChange({ loading: false, error: null });
        return;
      }

      if (onRouteStatusChange) onRouteStatusChange({ loading: true, error: null });

      try {
        const params = new URLSearchParams({
          originLat: String(userLocation.lat),
          originLng: String(userLocation.lng),
          destLat: String(routeTarget.lat),
          destLng: String(routeTarget.lng),
          mode: travelMode,
        });
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`/api/route?${params.toString()}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        setRouteCoordinates(data.coordinates as [number, number][]);

        if (onRouteInfoCalculated) {
          onRouteInfoCalculated({
            distanceKm: data.distanceKm,
            durationMin: data.durationMin,
            estimated: !!data.estimated,
            steps: Array.isArray(data.steps) ? data.steps : undefined,
          });
        }
        if (onRouteStatusChange) onRouteStatusChange({ loading: false, error: null });
      } catch (err) {
        console.error('تعذّر الوصول لخدمة حساب المسار الداخلية:', err);
        if (!cancelled) {
          setRouteCoordinates([]);
          if (onRouteInfoCalculated) onRouteInfoCalculated(null);
          if (onRouteStatusChange) {
            onRouteStatusChange({
              loading: false,
              error: 'تحقّق من اتصالك بالإنترنت وحاول مجدداً.',
            });
          }
        }
      }
    }

    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [userLocation, routeTarget, travelMode, onRouteInfoCalculated, onRouteStatusChange]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={isNavigating ? 17 : 13}
      className={`soufmap-container${mapTheme === 'night' ? ' soufmap-container--night' : ''}`}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer key={mapTheme} attribution={tileAttribution} url={tileUrl} />

      <ResizeHandler />
      <FollowOrFit
        isNavigating={isNavigating}
        userLocation={userLocation}
        routeCoordinates={routeCoordinates}
        selectedPlace={selectedPlace}
      />
      <MapControls
        onLocateUser={() => onLocateUser && onLocateUser()}
        routeCoordinates={routeCoordinates}
        defaultCenter={defaultCenter}
      />

      {/* خط المسار: طبقة تبطين داكنة + خط أزرق علوي بأسلوب تطبيقات الملاحة */}
      {routeCoordinates.length > 0 && (
        <>
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#0b1220', weight: 10, opacity: 0.35, lineJoin: 'round', lineCap: 'round' }}
          />
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }}
          />
        </>
      )}

      {/* نقطة البداية: موقع الزائر الحالي */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={buildUserIcon(isNavigating)}>
          <Tooltip permanent direction="top" offset={[0, -30]} className="soufmap-tag soufmap-tag-user">
            موقعك الحالي
          </Tooltip>
        </Marker>
      )}

      {/* نقطة النهاية: المعلم المستهدف (فقط أثناء وجود مسار نشط) */}
      {routeTarget && (
        <Marker position={[routeTarget.lat, routeTarget.lng]} icon={destinationIcon}>
          <Tooltip permanent direction="top" offset={[0, -40]} className="soufmap-tag soufmap-tag-dest">
            {routeTarget.name}
          </Tooltip>
        </Marker>
      )}

      {/* بقية المعالم على الخريطة */}
      {places
        .filter((p) => !routeTarget || p.id !== routeTarget.id)
        .map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={getCategoryIcon(place.category)}
            eventHandlers={{
              click: () => onSelectPlace(place),
            }}
          />
        ))}
    </MapContainer>
  );
}
