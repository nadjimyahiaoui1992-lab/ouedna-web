'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getPlacesFromDB, Place } from '@/data/places';
import { Compass } from 'lucide-react';

const SoufMap = dynamic(() => import('@/components/map/SoufMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-[#0f172a] text-white">
      <div className="text-center space-y-3 p-4">
        <Compass className="mx-auto text-amber-400 animate-spin-slow" size={40} />
        <p className="text-sm sm:text-base">جاري تحميل الخريطة التفاعلية...</p>
      </div>
    </div>
  ),
});

function MapContent() {
  const searchParams = useSearchParams();
  const destinationParam = searchParams.get('destination');
  const placeIdParam = searchParams.get('placeId');
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const autoRouteParam = searchParams.get('autoRoute') === 'true';

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getPlacesFromDB();
      setPlaces(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f172a] flex items-center justify-center text-white">
        <div className="text-center px-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-lg">جاري جلب المعالم الحقيقية من قاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <main dir="rtl" className="min-h-[100dvh] bg-[#0f172a] text-white flex flex-col overflow-hidden">
      <SoufMap
        places={places}
        initialDestinationQuery={destinationParam}
        initialPlaceId={placeIdParam}
        initialLat={latParam ? parseFloat(latParam) : null}
        initialLng={lngParam ? parseFloat(lngParam) : null}
        initialAutoRoute={autoRouteParam}
      />
    </main>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#0f172a] flex items-center justify-center text-white">
          جاري التحميل...
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}