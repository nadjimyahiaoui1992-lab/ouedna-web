import { createClient } from '@supabase/supabase-js';
import ExploreClient from './ExploreClient';

// منع التخزين المؤقت لجلب البيانات مباشرة من قاعدة البيانات في كل زيارة
export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1) المعالم السياحية فقط (بدون التراث)
  const { data: placesData } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: true });

  // 2) جلب بيانات التراث (التي أضفتها أنت)
  const { data: heritageData } = await supabase
    .from('heritage')
    .select('*')
    .order('created_at', { ascending: false });

  // 3) جلب بيانات الذكريات القديمة
  const { data: oldMemoriesData } = await supabase
    .from('old_memories')
    .select('*')
    .order('created_at', { ascending: false });

  // 💡 تحويل بيانات التراث لتتطابق مع شكل "الذكريات القديمة"
  const formattedHeritageAsMemories = (heritageData || []).map((item) => ({
    id: `heritage-${item.id}`, // تمييز الـ ID لتجنب أي تعارض
    image_url: item.image,     // توجيه الصورة لمكانها الصحيح في المعرض
    // دمج العنوان مع النص ليعرض كوصف للصورة في الذكريات
    caption: item.title ? `${item.title} - ${item.text}` : item.text, 
  }));

  // 💡 دمج جدول الذكريات مع جدول التراث ليظهروا معاً في ركن الذكريات القديمة
  const allMemories = [...(oldMemoriesData || []), ...formattedHeritageAsMemories];

  // 4) تجارب الزوار المعتمدة فقط
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <ExploreClient
      places={placesData ?? []}        // نرسل المعالم النقية فقط
      oldMemories={allMemories}        // نرسل الذكريات + التراث هنا
      testimonials={testimonials ?? []}
    />
  );
}
