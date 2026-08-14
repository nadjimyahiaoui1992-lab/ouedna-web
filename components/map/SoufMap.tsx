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
  Bike,
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
  embedded?: boolean;
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
  embedded = false,
  initialDestinationQuery,
  initialPlaceId = null,
  initialLat = null,
  initialLng = null,
  initialAutoRoute = false,
  }: {
    places: Place[];
    embedded?: boolean;
  initialDestinationQuery?: string | null;
  initialPlaceId?: string | null;
  initialLat?: number | null;
  initialLng?: number | null;
  initialAutoRoute?: boolean;
}) {
  const { dir, t } = useLanguage();
  const [mapTheme, setMapTheme] = useState<'day' | 'night'>('day');
  const [travelMode, setTravelMode] = useState<'car' | 'walk' | 'motorcycle'>('car');
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
    <div dir={dir} className={`relative w-full ${embedded ? 'h-full' : 'h-[100dvh]'} flex flex-col bg-[#0b1220] text-white overflow-hidden`}>
      {/* ===================== الشريط العلوي ===================== */}
      <header className={`${embedded ? 'hidden ' : ''}shrink-0 z-[1100] bg-[#0e1730] border-b border-white/10 shadow-lg`}>
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
                  {routeInfo && !isRouteLoading && !routeError && (
                    <div className="flex items-center gap-2.5 mt-0.5 text-[11px] font-bold text-gray-300">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Clock size={11} /> {routeInfo.durationMin} {t('minutesShort')}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <RouteIcon size={11} /> {routeInfo.distanceKm} {t('kmShort')}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsPanelCollapsed(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 shrink-0"
                  aria-label={t('expandPanel')}
                >
                  <ChevronUp size={16} />
                </button>
                {isNavigating && (
                  <button
                    onClick={handleCloseRoute}
                    className="p-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white shrink-0"
                    aria-label={t('endNavigation')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            <div className={`p-4 pt-0 space-y-3 ${isPanelCollapsed ? 'hidden' : ''}`}>
              {/* عنوان اللوحة */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">{t('tripDetails')}</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsPanelCollapsed(true)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                    aria-label={t('collapsePanel')}
                    title={t('collapsePanel')}
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={handleCloseRoute}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 md:hidden"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* بطاقة المسار: البداية (موقعك) → النهاية (المعلم) */}
              <div className="bg-[#0b1428] rounded-2xl border border-white/10 p-3.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-gray-200">{t('route')}</span>
                  <button
                    onClick={handleLocateUser}
                    title={t('refreshLocation')}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sky-400"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center pt-0.5">
                    <span className="w-3 h-3 rounded-full bg-sky-500 ring-4 ring-sky-500/25" />
                    <span className="w-px flex-1 min-h-[18px] border-e border-dashed border-white/25 my-1" />
                    <MapPin size={16} className="text-rose-500 -mt-0.5" />
                  </div>
                  <div className="flex-1 space-y-3.5 text-xs">
                    <div className="font-bold text-gray-200">{t('yourCurrentLocation')}</div>
                    <div className="font-bold text-white truncate">{routeTarget.name}</div>
                  </div>
                </div>
              </div>

              {/* نوع التنقل */}
              <div className="bg-[#0b1428] rounded-2xl border border-white/10 p-3.5">
                <span className="text-xs font-black text-gray-200">{t('travelMode')}</span>
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  <button
                    onClick={() => setTravelMode('car')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      travelMode === 'car' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Car size={15} /> {t('byCar')}
                  </button>
                  <button
                    onClick={() => setTravelMode('walk')}
                    className={`flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      travelMode === 'walk' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Footprints size={15} /> {t('byFoot')}
                  </button>
                  <button
                    onClick={() => setTravelMode('motorcycle')}
                    className={`flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      travelMode === 'motorcycle' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Bike size={15} /> دراجة نارية
                  </button>
                </div>
              </div>

              {/* حالة التحميل */}
              {isRouteLoading && (
                <div className="bg-[#0b1428] rounded-2xl border border-white/10 p-4 flex items-center gap-2 text-xs font-bold text-sky-300">
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t('calculatingRoute')}</span>
                </div>
              )}

              {/* حالة الخطأ */}
              {!isRouteLoading && routeError && (
                <div className="bg-[#0b1428] rounded-2xl border border-rose-500/30 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <AlertTriangle size={16} />
                    <span>{routeError}</span>
                  </div>
                  <button
                    onClick={() => routeTarget && handleRequestRoute(routeTarget)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <Navigation size={13} />
                    <span>{t('retry')}</span>
                  </button>
                </div>
              )}

              {/* تفاصيل الرحلة الناجحة */}
              {!isRouteLoading && !routeError && routeInfo && (
                <>
                  <div className="bg-[#0b1428] rounded-2xl border border-white/10 p-3.5">
                    <span className="text-xs font-black text-gray-200">{t('tripDetails')}</span>
                    <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
                      <div className="bg-white/5 rounded-xl py-2.5">
                        <div className="text-[10px] text-gray-400 mb-1">{t('turns')}</div>
                        <div className="text-sm font-black text-white">{routeInfo.steps?.length ?? '—'}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl py-2.5">
                        <div className="text-[10px] text-gray-400 mb-1">{t('estimatedTime')}</div>
                        <div className="text-sm font-black text-emerald-400">{routeInfo.durationMin} {t('minutesShort')}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl py-2.5">
                        <div className="text-[10px] text-gray-400 mb-1">{t('distance')}</div>
                        <div className="text-sm font-black text-amber-400">{routeInfo.distanceKm} {t('kmShort')}</div>
                      </div>
                    </div>
                    {routeInfo.estimated && (
                      <div className="text-[10px] text-amber-300/80 mt-2 text-center">
                        {t('estimatedRouteNote')}
                      </div>
                    )}
                  </div>

                  {/* تعليمات الطريق */}
                  <div className="bg-[#0b1428] rounded-2xl border border-white/10 p-3.5">
                    <span className="text-xs font-black text-gray-200">{t('directions')}</span>
                    <div className="mt-2.5 space-y-0.5 max-h-52 overflow-y-auto no-scrollbar">
                      {(routeInfo.steps && routeInfo.steps.length > 0
                        ? routeInfo.steps
                        : ([
                            { instruction: 'انطلق من موقعك الحالي', distanceMeters: 0, type: 'depart' },
                            {
                              instruction: `تابع باتجاه ${routeTarget.name}`,
                              distanceMeters: routeInfo.distanceKm * 1000,
                              type: 'straight',
                            },
                            { instruction: `وصلت إلى وجهتك: ${routeTarget.name}`, distanceMeters: 0, type: 'arrive' },
                          ] as RouteStep[])
                      ).map((step, idx) => {
                        const Icon = stepIcon(step.type);
                        return (
                          <div key={idx} className="flex items-center justify-between gap-2 py-2 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon size={14} className="text-sky-400 shrink-0" />
                              <span className="text-[11px] text-gray-200 truncate">{step.instruction}</span>
                            </div>
                            {step.distanceMeters > 0 && (
                              <span className="text-[10px] text-gray-400 shrink-0">{formatMeters(step.distanceMeters, t('kmShort'))}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* بدء / إيقاف التتبع الحي */}
                  <button
                    onClick={() => setIsNavigating((v) => !v)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold shadow-lg transition-all ${
                      isNavigating ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isNavigating ? <Square size={13} /> : <Play size={13} />}
                    <span>{isNavigating ? t('stopTracking') : t('startTrip')}</span>
                  </button>
                </>
              )}

              {/* إنهاء الملاحة */}
              <button
                onClick={handleCloseRoute}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg transition-colors"
              >
                <X size={15} />
                <span>{t('endNavigation')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== بطاقة المعلم المختار ===================== */}
        {showPlaceCard && selectedPlace && (
          <div
            className={`absolute z-[900] left-1/2 -translate-x-1/2 bottom-24 w-[calc(100%-1.5rem)] max-w-sm
                        md:left-auto md:translate-x-0 md:bottom-4 md:w-80
                        ${routeTarget ? 'hidden md:block md:end-[400px]' : 'md:end-4'}
                        bg-[#101a35]/97 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden`}
          >
            <div className={`relative w-full h-28 overflow-hidden ${categoryBadgeClasses(selectedPlace.category).replace('bg-', 'bg-gradient-to-br from-')} to-[#101a35]`}>
              {selectedPlace.image && !placeImageFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={selectedPlace.image}
                  src={selectedPlace.image}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setPlaceImageFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-white/80">
                  <Camera size={22} className="opacity-70" />
                  <span className="text-[10px] font-bold opacity-70">{t('noImageAvailable')}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent" />
              <button
                onClick={() => toggleSaved(selectedPlace.id)}
                className="absolute top-2 end-2 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white"
                aria-label={t('saveLandmark')}
              >
                <Bookmark size={14} fill={savedPlaceIds.has(selectedPlace.id) ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-2 start-2 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white"
                aria-label={t('close')}
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black text-sm text-white leading-tight">{selectedPlace.name}</h3>
                <span className={`shrink-0 text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${categoryBadgeClasses(selectedPlace.category)}`}>
                  {selectedPlace.category}
                </span>
              </div>

              {selectedPlace.description && (
                <p className="text-[11px] text-gray-400 line-clamp-2">{selectedPlace.description}</p>
              )}

              <div className="flex items-center gap-3 text-[11px] text-gray-300">
                {typeof (selectedPlace as { rating?: number }).rating === 'number' && (
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Star size={12} fill="currentColor" /> {(selectedPlace as { rating?: number }).rating}
                  </span>
                )}
                {cardRouteInfo && (
                  <>
                    <span className="flex items-center gap-1 font-bold">
                      <RouteIcon size={12} /> {cardRouteInfo.distanceKm} {t('kmShort')}
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      <Clock size={12} /> {cardRouteInfo.durationMin} {t('minutesShort')}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  isCurrentRouteTarget && routeInfo ? setIsNavigating(true) : handleRequestRoute(selectedPlace)
                }
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                <Navigation size={14} />
                <span>{isCurrentRouteTarget && routeInfo ? t('startNavigation') : t('viewRouteHere')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== شريط التصنيفات السريع (سفلي) ===================== */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-[900] ${routeTarget ? 'hidden md:flex' : 'flex'}
                      items-center gap-1.5 bg-[#101a35]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-1.5`}
        >
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategoryKey === cat.key;
            const hasResults = (places || []).some((p) => cat.match(p.category));
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategoryKey(isActive ? null : cat.key)}
                className={`relative flex flex-col items-center gap-1 px-3.5 py-2 rounded-xl text-[10px] font-bold transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon size={17} />
                <span className="hidden sm:inline">{t(cat.labelKey)}</span>
                {hasResults && <span className="absolute top-1 start-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />}
              </button>
            );
          })}
        </div>

        {/* ===================== مبدّل النهار / الليل ===================== */}
        <div className={`absolute bottom-4 start-4 z-[900] ${routeTarget ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center bg-[#101a35]/95 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-2xl">
            <button
              onClick={() => setMapTheme('day')}
              className={`p-2 rounded-full transition-colors ${mapTheme === 'day' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-white'}`}
              aria-label={t('dayMode')}
            >
              <Sun size={15} />
            </button>
            <button
              onClick={() => setMapTheme('night')}
              className={`p-2 rounded-full transition-colors ${mapTheme === 'night' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              aria-label={t('nightMode')}
            >
              <Moon size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== نافذة الطوارئ ===================== */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101a35] border border-white/15 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
            <button onClick={() => setShowEmergencyModal(false)} className="absolute top-4 start-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 text-rose-500">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-base text-white">{t('emergencyTitle')}</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <a href="tel:14" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-rose-900/40 border border-white/5 transition-colors">
                <span className="font-bold text-white">{t('civilProtection')}</span>
                <span className="flex items-center gap-1 bg-rose-600 text-white px-2.5 py-1 rounded-lg font-bold">
                  <PhoneCall size={12} /> 14
                </span>
              </a>
              <a href="tel:1548" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-rose-900/40 border border-white/5 transition-colors">
                <span className="font-bold text-white">{t('police')}</span>
                <span className="flex items-center gap-1 bg-rose-600 text-white px-2.5 py-1 rounded-lg font-bold">
                  <PhoneCall size={12} /> 1548
                </span>
              </a>
              <a href="tel:1021" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-rose-900/40 border border-white/5 transition-colors">
                <span className="font-bold text-white">{t('gendarmerie')}</span>
                <span className="flex items-center gap-1 bg-rose-600 text-white px-2.5 py-1 rounded-lg font-bold">
                  <PhoneCall size={12} /> 1021
                </span>
              </a>
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="mt-5 w-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
