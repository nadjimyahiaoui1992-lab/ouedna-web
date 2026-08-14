import { createClient } from '@supabase/supabase-js';
import AppExploreClient from './AppExploreClient';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/config';
import PlatformFrame from '@/components/platform/PlatformFrame';

// منع التخزين المؤقت لجلب البيانات مباشرة من قاعدة البيانات في كل زيارة
export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1) المعالم السياحية فقط (بدون التراث)
  const { data: placesData } = await supabase
    .from('places')
    .select('*')
    .eq('status', 'منشور')
    .order('created_at', { ascending: false });

  const normalizedPlaces = (placesData ?? []).map((place) => ({ ...place, category: place.category || place.main_category, municipality: place.municipality || place.address }));
  return <PlatformFrame active="/explore"><AppExploreClient places={normalizedPlaces} /></PlatformFrame>;
}
