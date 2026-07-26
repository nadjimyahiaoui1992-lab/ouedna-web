"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Search,
  Navigation,
  AlertTriangle,
  PhoneCall,
  Play,
  Square,
  Clock,
  Route as RouteIcon,
  CornerUpRight,
  Loader2,
  Menu,
  X,
  Sun,
  Moon,
  Car,
  Footprints,
  Utensils,
  BedDouble,
  Camera,
  MessageCircle,
  RefreshCw,
  Star,
  Bookmark,
  ArrowUp,
  CornerUpLeft,
  RotateCw,
  Flag,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Place } from '@/data/places';
import { RouteInfo, RouteStep } from './Map';
import { LanguageProvider, useLanguage, DictKey } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <MapLoadingFallback />,
});

function MapLoadingFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex-1 w-full h-full flex items-center justify-center bg-[#0b1220]">
      <div className="text-center space-y-3 p-4">
        <Navigation className="mx-auto text-amber-400 animate-spin-slow" size={36} />
        <h3 className="text-sm font-bold text-white">{t('loadingMap')}</h3>
      </div>
    </div>
  );
}

type NavTab = { key: DictKey; href: string; active?: boolean };

const NAV_TABS: NavTab[] = [
  { key: 'events', href: '/events' },
  { key: 'restaurants', href: '/restaurants' },
  { key: 'hotels', href: '/hotels' },
  { key: 'landmarks', href: '/landmarks' },
  { key: 'map', href: '/map', active: true },
];

const QUICK_CATEGORIES: { key: string; labelKey: DictKey; icon: React.ElementType; match: (c: string) => boolean }[] = [
  { key: 'restaurants', labelKey: 'categoryRestaurants', icon: Utensils, match: (c) => c.includes('مطعم') || c.includes('مطاعم') },
  { key: 'hotels', labelKey: 'categoryHotels', icon: BedDouble, match: (c) => c.includes('فندق') || c.includes('فنادق') },
  { key: 'landmarks', labelKey: 'categoryLandmarks', icon: Camera, match: (c) => c.includes('تاريخ') || c.includes('ثقاف') },
  { key: 'services', labelKey: 'categoryServices', icon: MessageCircle, match: (c) => c.includes('صحي') || c.includes('خدم') || c.includes('سوق') },
];

function categoryBadgeClasses(category: string) {
  if (category.includes('فنادق')) return 'bg-blue-600/90';
  if (category.includes('صحي') || category.includes('خدم')) return 'bg-rose-600/90';
  if (category.includes('أسواق')) return 'bg-emerald-600/90';
  if (category.includes('مطعم')) return 'bg-orange-600/90';
  return 'bg-violet-600/90';
}

function stepIcon(type?: string) {
  switch (type) {
    case 'turn-left':
      return CornerUpLeft;
    case 'turn-right':
      return CornerUpRight;
    case 'roundabout':
      return RotateCw;
    case 'arrive':
      return Flag;
    case 'depart':
      return Navigation;
    default:
      return ArrowUp;
  }
}

function formatMeters(m: number, kmLabel: string) {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} ${kmLabel}`;
  return `${Math.round(m)} م`;
}

export default function SoufMap(props: {
  places: Place[];
  initialDestinationQuery?: string | null;
  initialPlaceId?: string | null;
  initialLat?: number | null;
  initialLng?: number | null;
  initialAutoRoute?: boolean;
}) {
  return (
    <LanguageProvider>
      <SoufMapInner {...props} />
    </LanguageProvider>
  );
}

function SoufMapInner({
  places,
  initialDestinationQuery,
  initialPlaceId = null,
  initialLat = null,
  initialLng = null,
  initialAutoRoute = false,
}: {
  places: Place[];
  initialDestinationQuery?: string | null;
  initialPlaceId?: string | null;
  initialLat?: number | null;
  initialLng?: number | null;
  initialAutoRoute?: boolean;
}) {
  const { dir, t } = useLanguage();
  const [mapTheme, setMapTheme] = useState<'day' | 'night'>('day');
  const [travelMode, setTravelMode] = useState<'car' | 'walk'>('car');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialDestinationQuery || '');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string | number>>(new Set());
  const [placeImageFailed, setPlaceImageFailed] = useState(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeTarget, setRouteTarget] = useState<Place | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // لوحة تفاصيل الرحلة: تُطوى تلقائياً عند بدء الملاحة الحية حتى تظهر الخريطة والمسار وتقدّم الرحلة
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const searchWrapRef = useRef<HTMLDivElement>(null);

  // مثبّتة بـ useCallback حتى لا تتغيّر مرجعيتها في كل تصيير،
  // لأن Map.tsx يعتمد عليها كـ dependency في useEffect الخاص بحساب المسار.
  const handleRouteInfoCalculated = useCallback((info: RouteInfo | null) => {
    setRouteInfo(info);
  }, []);

  const handleRouteStatusChange = useCallback(({ loading, error }: { loading: boolean; error: string | null }) => {
    setIsRouteLoading(loading);
    setRouteError(error);
  }, []);

  const activeCategory = QUICK_CATEGORIES.find((c) => c.key === selectedCategoryKey) || null;

  const filteredPlaces = useMemo(() => {
    return (places || []).filter((place) => {
      const matchesCategory = activeCategory ? activeCategory.match(place.category) : true;
      return matchesCategory;
    });
  }, [places, activeCategory]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return (places || [])
      .filter((p) => p.name.toLowerCase().includes(q) || p.municipality?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [places, searchQuery]);

  // إغلاق قائمة اقتراحات البحث عند النقر خارجها
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // إعادة ضبط حالة فشل تحميل الصورة كلّما تغيّر المعلم المختار
  useEffect(() => {
    setPlaceImageFailed(false);
  }, [selectedPlace?.id]);

  // اطوِ لوحة التفاصيل تلقائياً بمجرد بدء الملاحة الحية، حتى تظهر الخريطة ويتابع الزائر تقدّم رحلته ومساره
  useEffect(() => {
    if (isNavigating) setIsPanelCollapsed(true);
  }, [isNavigating]);

  // تتبّع حي لموقع الزائر أثناء الملاحة النشطة
  useEffect(() => {
    let watchId: number | null = null;
    if (isNavigating && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error('خطأ في التتبع الحي:', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationError('متصفحك لا يدعم تحديد الموقع الجغرافي.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationError(null);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setLocationError('تعذّر الوصول لموقعك، تأكد من تفعيل خدمة الموقع GPS.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // نقطة البداية = موقع الزائر الحالي دائماً، نقطة النهاية = المعلم المختار دائماً
  const handleRequestRoute = (place: Place) => {
    setIsNavigating(false);
    setRouteError(null);
    setSelectedPlace(place);
    setSearchFocused(false);
    setIsPanelCollapsed(false);

    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationError(null);
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setRouteTarget(place);
        },
        () => {
          setLocationError('تعذّر تحديد موقعك تلقائياً، تم استخدام موقع افتراضي بولاية الوادي.');
          setUserLocation({ lat: 33.3683, lng: 6.8667 });
          setRouteTarget(place);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setRouteTarget(place);
    }
  };

  // تركيز تلقائي مرّة واحدة عند الوصول من صفحة الاستكشاف عبر زر "عرض على الخريطة":
  // نحدّد المعلم بالأولوية: المعرّف، ثم الإحداثيات، ثم الاسم — ونعرض بطاقته ونمركز الخريطة عليه مباشرة
  // (أو نبدأ المسار تلقائياً إذا طُلب ذلك عبر autoRoute=true)، دون أي خروج لخرائط خارجية.
  const initialFocusAppliedRef = useRef(false);

  useEffect(() => {
    if (initialFocusAppliedRef.current) return;
    if (!places || places.length === 0) return;
    if (!initialPlaceId && initialLat == null && initialLng == null && !initialDestinationQuery) return;

    let target: Place | undefined;

    if (initialPlaceId) {
      target = places.find((p) => String(p.id) === String(initialPlaceId));
    }
    if (!target && initialLat != null && initialLng != null) {
      target = places.find(
        (p) => Math.abs(p.lat - initialLat) < 0.0008 && Math.abs(p.lng - initialLng) < 0.0008
      );
    }
    if (!target && initialDestinationQuery) {
      const q = initialDestinationQuery.trim().toLowerCase();
      target = places.find((p) => p.name.trim().toLowerCase() === q);
    }

    if (target) {
      initialFocusAppliedRef.current = true;
      if (initialAutoRoute) {
        handleRequestRoute(target);
      } else {
        setSelectedPlace(target);
        setSearchFocused(false);
        setIsPanelCollapsed(false);
      }
    }
  }, [places, initialPlaceId, initialLat, initialLng, initialDestinationQuery, initialAutoRoute]);

  const handleCloseRoute = () => {
    setRouteTarget(null);
    setRouteInfo(null);
    setIsNavigating(false);
    setRouteError(null);
    setIsPanelCollapsed(false);
  };

  const toggleSaved = (id: string | number) => {
    setSavedPlaceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showPlaceCard = !!selectedPlace && !isNavigating;
  const isCurrentRouteTarget = !!(routeTarget && selectedPlace && routeTarget.id === selectedPlace.id);
  const cardRouteInfo = isCurrentRouteTarget ? routeInfo : null;

  return (
    <div dir={dir} className="relative w-full h-[100dvh] flex flex-col bg-[#0b1220] text-white overflow-hidden">
      {/* ===================== الشريط العلوي ===================== */}
      <header className="shrink-0 z-[1100] bg-[#0e1730] border-b border-white/10 shadow-lg">
        <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5">
          {/* الشعار + شريط البحث */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <a href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl sm:text-2xl">🌴</span>
              <span className="hidden sm:flex flex-col leading-tight">
                <span className="font-black text-sm sm:text-base text-white">سوف 360</span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 -mt-0.5">{t('brandTagline')}</span>
              </span>
            </a>

            <div ref={searchWrapRef} className="relative hidden md:block w-full max-w-md">
              <div className="flex items-center bg-[#141f3d] border border-white/10 rounded-xl px-3 py-2 focus-within:border-amber-500 transition-colors">
                <input
                  type="text"
                  placeholder={t('mapSearchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="flex-1 bg-transparent text-white text-xs placeholder:text-gray-500 focus:outline-none"
                />
                <Search size={16} className="text-amber-400 shrink-0" />
              </div>

              {searchFocused && searchQuery.trim() && (
                <div className="absolute top-[calc(100%+6px)] start-0 end-0 bg-[#111c38] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPlace(p);
                          setSearchFocused(false);
                        }}
                        className="w-full text-start px-3 py-2.5 hover:bg-white/5 flex items-center justify-between gap-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-xs font-bold text-white truncate">{p.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{p.category}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-[11px] text-gray-400 text-center">{t('mapNoResults')}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* روابط التنقل + اللغة + القائمة */}
          <div className="flex items-center gap-2 shrink-0">
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_TABS.map((tab) => (
                <a
                  key={tab.key}
                  href={tab.href}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    tab.active ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {t(tab.key)}
                </a>
              ))}
            </nav>

            <div className="hidden sm:block">
              <LanguageSwitcher compact />
            </div>

            <button
              onClick={() => setShowEmergencyModal(true)}
              title={t('emergencyServices')}
              className="p-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors"
            >
              <AlertTriangle size={16} />
            </button>

            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* قائمة الجوال المنسدلة: البحث + الروابط */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0e1730] px-4 py-3 space-y-3">
            <div className="flex items-center bg-[#141f3d] border border-white/10 rounded-xl px-3 py-2.5">
              <input
                type="text"
                placeholder={t('mapSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-xs placeholder:text-gray-500 focus:outline-none"
              />
              <Search size={16} className="text-amber-400" />
            </div>
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="space-y-1">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlace(p);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-start px-3 py-2 rounded-lg bg-white/5 text-xs font-bold text-white"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <div className="flex flex-col gap-1 flex-1">
                {NAV_TABS.map((tab) => (
                  <a
                    key={tab.key}
                    href={tab.href}
                    className={`px-2 py-2 text-xs font-bold rounded-lg ${
                      tab.active ? 'text-amber-400 bg-amber-500/10' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {t(tab.key)}
                  </a>
                ))}
              </div>
              <LanguageSwitcher compact />
            </div>
          </div>
        )}
      </header>

      {/* رسالة خطأ تحديد الموقع */}
      {locationError && (
        <div className="absolute top-16 start-3 end-3 z-[1050] pointer-events-none flex justify-center">
          <div className="pointer-events-auto bg-rose-950/95 backdrop-blur-md border border-rose-500/40 text-rose-200 text-[11px] font-bold px-3.5 py-2.5 rounded-xl shadow-xl flex items-center gap-2 max-w-sm">
            <span>{locationError}</span>
            <button onClick={() => setLocationError(null)} className="shrink-0 text-rose-300 hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ===================== منطقة الخريطة ===================== */}
      <div className="relative flex-1 min-h-0">
        <DynamicMap
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
          mapTheme={mapTheme}
          travelMode={travelMode}
          userLocation={userLocation}
          routeTarget={routeTarget}
          onRouteInfoCalculated={handleRouteInfoCalculated}
          onRouteStatusChange={handleRouteStatusChange}
          onLocateUser={handleLocateUser}
          isNavigating={isNavigating}
        />

        {/* ===================== لوحة المسار (يمين على الحاسوب / لوحة سفلية على الجوال) ===================== */}
        {routeTarget && (
          <div
            className={`fixed inset-x-0 bottom-0 z-[950] overflow-y-auto rounded-t-3xl transition-[max-height] duration-300 ease-out
                       md:absolute md:inset-x-auto md:bottom-auto md:top-4 md:end-4 md:w-[380px] md:rounded-2xl
                       bg-[#101a35]/97 backdrop-blur-md border border-white/10 shadow-2xl
                       ${isPanelCollapsed ? 'max-h-[104px] md:max-h-[104px]' : 'max-h-[75vh] md:max-h-[calc(100%-2rem)]'}`}
          >
            {/* مقبض قابل للنقر لطيّ/بسط اللوحة — يتيح رؤية الخريطة والمسار وتقدّم الرحلة */}
            <button
              type="button"
              onClick={() => setIsPanelCollapsed((v) => !v)}
              className="w-full flex justify-center pt-2 pb-1"
              aria-label={isPanelCollapsed ? t('expandPanel') : t('collapsePanel')}
            >
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </button>

            {/* ===== شريط مصغّر يظهر عند طيّ اللوحة (أثناء التتبع الحي غالباً) ===== */}
            {isPanelCollapsed && (
              <div className="px-4 pb-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white truncate">{routeTarget.name}</div>
                  {routeIn