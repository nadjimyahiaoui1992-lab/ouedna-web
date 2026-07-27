import { createClient } from '@supabase/supabase-js';
import ExploreClient from './ExploreClient';

// منع التخزين المؤقت لجلب البيانات مباشرة من قاعدة البيانات في كل زيارة
export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1) المعالم السياحية — جدول places
  const { data: placesData } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: true });

  // 2) التراث — جدول heritage (الجدول الذي لم يكن موجوداً في الكود القديم)
  const { data: heritageData } = await supabase
    .from('heritage')
    .select('*')
    .order('created_at', { ascending: false });

  // 💡 تحويل بيانات التراث لكي تفهمها واجهة العرض وتدمجها مع المعالم
  const formattedHeritage = (heritageData || []).map((item) => ({
    id: `heritage-${item.id}`, // تمييز الـ ID لتجنب تعارض المفاتيح (Keys)
    name: item.title,          // تحويل حقل العنوان
    description: item.text,    // تحويل حقل النص
    cover_url: item.image,     // تحويل الصورة لتعرض كغلاف
    category: 'تراث'           // إضافة تصنيف ثابت لتظهر في الفلاتر بشكل جميل
  }));

  // دمج المعالم الأصلية مع المعالم التراثية في قائمة واحدة
  const allPlaces = [...(placesData || []), ...formattedHeritage];

  // 3) ذكريات قديمة — جدول old_memories
  // ⚠️ قمنا بتغيير الترتيب إلى created_at بدلاً من year لتجنب خطأ تعطل الخادم
  const { data: oldMemories } = await supabase
    .from('old_memories')
    .select('*')
    .order('created_at', { ascending: false });

  // 4) تجارب الزوار المعتمدة فقط — جدول testimonials
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <ExploreClient
      places={allPlaces}
      oldMemories={oldMemories ?? []}
      testimonials={testimonials ?? []}
    />
  );
}
