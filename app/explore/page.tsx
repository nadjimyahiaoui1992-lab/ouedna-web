import { createClient } from '@supabase/supabase-js';
import ExploreClient from './ExploreClient';

// منع التخزين المؤقت لجلب البيانات مباشرة من قاعدة البيانات في كل زيارة
export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1) المعالم السياحية — جدول places
  //    الأعمدة المتوقعة: id, name, category, description, cover_url, gallery (jsonb: string[]), lat, lng
  const { data: places } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: true });

  // 2) ذكريات قديمة — جدول old_memories
  //    الأعمدة المتوقعة: id, image_url, caption, year
  const { data: oldMemories } = await supabase
    .from('old_memories')
    .select('*')
    .order('year', { ascending: true });

  // 3) تجارب الزوار المعتمدة فقط — جدول testimonials
  //    الأعمدة المتوقعة: id, name, message, photos (jsonb: string[]), status ('pending' | 'approved'), created_at
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <ExploreClient
      places={places ?? []}
      oldMemories={oldMemories ?? []}
      testimonials={testimonials ?? []}
    />
  );
}