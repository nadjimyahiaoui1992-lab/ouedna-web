'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Phone, Mail, Clock, Star, ChevronLeft,
  ArrowRight, Menu, Landmark, Tent, Camera, Quote, Sun, ImageIcon, Sparkles, Heart
} from 'lucide-react';

// --- Types ---
type Place = {
  id: string | number; name: string; category?: string; description?: string;
  cover_url?: any; image_url?: any; gallery?: any; lat?: number; lng?: number;
};
type OldMemory = { id: string | number; image_url: any; caption?: string; year?: string | number; };
type Testimonial = { id: string | number; name?: string; message: string; photos?: any; created_at?: string; };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const HERO_IMG = 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=2000&auto=format&fit=crop';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1542601098-8fc114e148e2?q=80&w=800&auto=format&fit=crop';

// --- دوال تحليل الصور من قاعدة البيانات ---
function parseImages(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((item) => String(item).replace(/["'[\]]/g, '').trim()).filter(Boolean);
  if (typeof input === 'object') {
    try { return Object.values(input).flatMap((v) => parseImages(v)); } catch { return []; }
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try { return parseImages(JSON.parse(trimmed)); } catch { /* ignore */ }
    }
    if (trimmed.includes(',')) return trimmed.split(',').map((s) => s.replace(/["'[\]]/g, '').trim()).filter(Boolean);
    const cleaned = trimmed.replace(/["'[\]]/g, '').trim();
    if (cleaned) return [cleaned];
  }
  return [];
}

function getPlaceImages(place: Place): string[] {
  const imagesSet = new Set<string>();
  const BUCKET_NAME = 'IMAGES';
  const formatUrl = (img: string) => {
    if (img.startsWith('http')) return img;
    const cleanImgPath = img.replace(/^\/+/, '');
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${cleanImgPath}`;
  };
  if (place.image_url) parseImages(place.image_url).forEach((img) => imagesSet.add(formatUrl(img)));
  if (place.cover_url) parseImages(place.cover_url).forEach((img) => imagesSet.add(formatUrl(img)));
  if (place.gallery) parseImages(place.gallery).forEach((img) => imagesSet.add(formatUrl(img)));
  const list = Array.from(imagesSet);
  return list.length > 0 ? list : [FALLBACK_IMG];
}

// --- العادات والتقاليد ---
const TRADITIONS = [
  { title: 'الزي التقليدي الصحراوي', desc: 'زي أصيل يعكس هوية المنطقة وتراثها العريق', img: 'https://images.unsplash.com/photo-1596742572435-08146c52bbec?q=80&w=500' },
  { title: 'صناعة الحلي الفضية', desc: 'حرفة تقليدية متوارثة في صناعة الحلي الفضية', img: 'https://images.unsplash.com/photo-1611085583191-a3b1a60d6c96?q=80&w=500' },
  { title: 'مهرجان الوادي السياحي', desc: 'احتفال سنوي يعكس الثقافة والتراث المحلي', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=500' },
  { title: 'الأطباق التقليدية', desc: 'أطباق شهية تعبر عن المذاق الأصيل للمنطقة', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500' },
  { title: 'فن الحناء', desc: 'زينة تقليدية ذات رموز ومعاني جميلة', img: 'https://images.unsplash.com/photo-1590424600373-1f196666142c?q=80&w=500' },
];

export default function ExploreClient({ places = [], oldMemories = [], testimonials = [] }: { places?: Place[], oldMemories?: OldMemory[], testimonials?: Testimonial[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredPlace = places.length > 0 ? places[0] : null;
  const featuredImages = featuredPlace ? getPlaceImages(featuredPlace) : [];
  const coverImg = featuredImages[0] || FALLBACK_IMG;
  const thumbs = featuredImages.slice(1, 4);
  const remainingImgs = Math.max(featuredImages.length - 4, 0);

  return (
    <div className="min-h-screen bg-[#070d10] text-white font-sans selection:bg-amber-500/30 overflow-x-hidden" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        * { font-family: 'Tajawal', sans-serif; }
      `}</style>

      {/* --- القائمة العلوية --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-[#050b0d]/95 backdrop-blur-md py-3 shadow-lg border-b border-white/5' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-teal-600 to-amber-500 rounded-full flex items-center justify-center p-1">
              <div className="w-full h-full bg-[#050b0d] rounded-full flex items-center justify-center">
                <Sun size={20} className="text-amber-500" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-1">سوف <span className="text-amber-500">360</span></h1>
              <p className="text-[9px] text-gray-400 font-medium">منصة سياحية ذكية لولاية الوادي</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-gray-300">
            <a href="#" className="text-amber-500 border-b-2 border-amber-500 pb-1">الرئيسية</a>
            <a href="#" className="hover:text-amber-400 transition-colors">من نحن</a>
            <a href="#" className="hover:text-amber-400 transition-colors">اتصل بنا</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-white/5 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 text-xs font-bold items-center gap-4">
              <button className="hover:text-amber-400 flex items-center gap-1.5 transition-colors"><span>🇫🇷</span> Français</button>
              <button className="hover:text-amber-400 flex items-center gap-1.5 transition-colors"><span>🇬🇧</span> English</button>
              <button className="text-amber-400 flex items-center gap-1.5 border-r border-white/20 pr-4"><span>🇩🇿</span> العربية</button>
            </div>
            <button className="lg:hidden p-2 bg-white/5 rounded-xl border border-white/10"><Menu size={20} /></button>
          </div>
        </div>
      </nav>

      {/* --- الهيرو والخدمات --- */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center pb-32">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMG} alt="غروب الشمس في الوادي" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070d10]/70 via-[#070d10]/40 to-[#070d10]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center mt-20">
          <div className="mb-6 inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 rounded-full">
            <Sun size={14} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">الجزائر &mdash; ولاية الوادي (السوف)</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl text-white">اكتشف سحر ولاية الوادي</h2>
          <h3 className="text-xl md:text-2xl text-amber-400 font-bold mb-6">حيث تلتقي الطبيعة الخلابة بالتراث العريق</h3>
          <p className="text-gray-300 max-w-2xl text-sm md:text-base leading-relaxed">
            ولاية الوادي، جوهرة الجنوب الجزائري، تزخر بمناظر طبيعية خلابة كالكثبان الرملية والواحات الخضراء، وتتميز بتاريخ عريق وثقافة أصيلة تجعلها وجهة سياحية فريدة من نوعها.
          </p>
        </div>

        <div className="absolute -bottom-16 left-0 right-0 z-20 container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: Tent, title: 'طبيعة خلابة', desc: 'كثبان رملية ذهبية وواحات خضراء ساحرة', active: true },
              { icon: Landmark, title: 'تراث عريق', desc: 'معالم تاريخية عريقة وقصور صحراوية' },
              { icon: Sparkles, title: 'ثقافة أصيلة', desc: 'عادات وتقاليد متوارثة وحرف يدوية فريدة' },
              { icon: Heart, title: 'ضيافة سخية', desc: 'شعب كريم يرحب بزواره من كل مكان' },
              { icon: Camera, title: 'تجارب مميزة', desc: 'مغامرات صحراوية وتجارب لا تنسى' }
            ].map((srv, i) => (
              <div key={i} className={`bg-[#0b1619]/90 backdrop-blur-xl border rounded-[2rem] p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-2 cursor-pointer ${srv.active ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-white/10'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${srv.active ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                  <srv.icon size={26} strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-sm text-white mb-2">{srv.title}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">{srv.desc}</p>
                {srv.active && <div className="mt-4 w-8 h-1 bg-amber-500 rounded-full" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- المعالم (ديناميكي) --- */}
      <section className="pt-32 pb-20 relative z-10 bg-[#070d10]" id="landmarks">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <MapPin size={24} />
                <span className="text-xs font-bold uppercase tracking-wider">الوجهات</span>
              </div>
              <h2 className="text-3xl font-black text-white">معالم ولاية الوادي</h2>
              <p className="text-gray-400 text-sm mt-2">أروع الوجهات السياحية والتاريخية في ولاية الوادي</p>
            </div>
            {places.length > 1 && (
              <button 
                onClick={() => setShowAllPlaces(!showAllPlaces)}
                className="px-6 py-2.5 rounded-full border border-white/20 text-xs font-bold hover:bg-white/10 transition-colors hidden sm:flex items-center gap-2"
              >
                {showAllPlaces ? 'إخفاء المعالم' : 'عرض الكل'} <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {!featuredPlace ? (
            <div className="text-center py-20 bg-[#0b1619] rounded-[3rem] border border-white/5">
              <Landmark size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-bold">لا توجد معالم مضافة في قاعدة البيانات حالياً.</p>
            </div>
          ) : (
            <div className="bg-[#0b1619] rounded-[3rem] border border-white/5 p-4 sm:p-6 flex flex-col lg:flex-row gap-8 shadow-2xl relative overflow-hidden mb-8">
              <div className="lg:w-1/2 flex flex-col justify-center px-2 py-4 lg:py-8 order-2 lg:order-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Landmark size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">{featuredPlace.category || 'معلم سياحي'}</span>
                  </div>
                  <button className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors">
                    <Heart size={18} />
                  </button>
                </div>
                
                <h3 className="text-4xl sm:text-5xl font-black mb-3 text-white">{featuredPlace.name}</h3>
                
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  <span className="font-bold text-xl mr-2">4.8</span>
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-8 text-sm sm:text-base line-clamp-4">
                  {featuredPlace.description || 'لا يوجد وصف متاح لهذا المعلم في قاعدة البيانات حالياً.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <MapPin className="text-amber-500" size={24} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold mb-1">الموقع (إحداثيات)</p>
                      <p className="text-xs font-bold text-white">
                        {featuredPlace.lat && featuredPlace.lng ? `${featuredPlace.lat.toFixed(4)}, ${featuredPlace.lng.toFixed(4)}` : 'غير متوفر'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="text-amber-500" size={24} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold mb-1">الهاتف</p>
                      <p className="text-xs font-bold text-gray-400" dir="ltr">غير متوفر</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="text-amber-500" size={24} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold mb-1">البريد الإلكتروني</p>
                      <p className="text-xs font-bold text-gray-400">غير متوفر</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock className="text-amber-500" size={24} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold mb-1">ساعات العمل</p>
                      <p className="text-xs font-bold text-gray-400">حسب الإدارة المحلية</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <button 
                    onClick={() => router.push(`/map?destination=${featuredPlace.name}`)}
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-sm"
                  >
                    موقع المعلم على الخريطة
                  </button>
                  <button 
                    onClick={() => router.push(`/map?destination=${featuredPlace.name}&autoRoute=true`)}
                    className="flex-1 bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowRight size={18} className="rotate-180" /> الاتجاهات (مسار)
                  </button>
                </div>
              </div>

              <div className="lg:w-1/2 relative rounded-[2.5rem] overflow-hidden min-h-[400px] order-1 lg:order-2 group">
                <img src={coverImg} alt={featuredPlace.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070d10]/90 via-transparent to-transparent" />
                
                <div className="absolute top-6 right-6 bg-black/40 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1">
                  <ImageIcon size={14} /> معرض الصور
                </div>
                
                {thumbs.length > 0 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10 w-[90%] justify-center">
                    {thumbs.map((img, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl border-2 border-white/20 overflow-hidden cursor-pointer hover:border-amber-500 transition-colors">
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {remainingImgs > 0 && (
                      <div className="w-16 h-16 rounded-xl border-2 border-white/20 bg-black/70 flex items-center justify-center font-bold text-sm cursor-pointer hover:border-amber-500 transition-colors text-white backdrop-blur-sm">
                        +{remainingImgs}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {showAllPlaces && places.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {places.slice(1).map((place) => {
                const pImgs = getPlaceImages(place);
                return (
                  <div key={place.id} className="bg-[#0b1619] rounded-3xl border border-white/5 overflow-hidden group hover:border-amber-500/30 transition-all">
                    <div className="relative h-48">
                      <img src={pImgs[0]} alt={place.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1619] to-transparent" />
                      <span className="absolute top-4 right-4 bg-black/50 backdrop-blur text-amber-400 text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
                        {place.category || 'سياحة'}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white mb-2">{place.name}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-4">{place.description}</p>
                      <button onClick={() => router.push(`/map?destination=${place.name}`)} className="w-full bg-white/5 hover:bg-amber-500 hover:text-black text-white text-sm font-bold py-2.5 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2">
                        عرض التفاصيل <ChevronLeft size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --- عادات وتقاليد (ثابت) --- */}
      <section className="py-20 bg-[#070d10]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Tent size={24} />
                <h2 className="text-3xl font-black text-white">عادات وتقاليد ولاية الوادي</h2>
              </div>
            </div>
            <button className="px-6 py-2.5 rounded-full border border-white/20 text-xs font-bold hover:bg-white/10 transition-colors hidden sm:block">
              عرض الكل
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {TRADITIONS.map((trad, idx) => (
              <div key={idx} className="relative rounded-3xl overflow-hidden aspect-[3/4] group cursor-pointer border border-white/10">
                <img src={trad.img} alt={trad.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070d10] via-black/40 to-transparent opacity-90" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-center">
                  <h4 className="text-white font-bold text-sm mb-2 group-hover:text-amber-400 transition-colors">{trad.title}</h4>
                  <p className="text-[10px] text-gray-300 leading-relaxed">{trad.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- الأرشيف (ديناميكي) --- */}
      <section className="py-20 bg-[#070d10]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center gap-2 text-teal-500 mb-2">
                <Camera size={24} />
                <h2 className="text-3xl font-black text-white">ذكرى في ولاية الوادي</h2>
              </div>
              <p className="text-gray-400 text-sm mt-2">لمحات من الأرشيف تحكي وجه الوادي عبر الزمن</p>
            </div>
          </div>

          {oldMemories.length === 0 ? (
            <div className="text-center py-10 bg-[#0b1619] rounded-3xl border border-white/5">
              <p className="text-gray-500">لم تُضف صور أرشيفية في قاعدة البيانات بعد.</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {oldMemories.map((m) => {
                const mImgs = parseImages(m.image_url);
                const imgSrc = mImgs[0] || FALLBACK_IMG;
                return (
                  <div key={m.id} className="relative break-inside-avoid rounded-2xl overflow-hidden border border-white/5 group">
                    <img src={imgSrc} alt={m.caption || 'ذكرى'} className="w-full object-cover sepia-[.3] group-hover:sepia-0 transition-all duration-500" />
                    {m.year && <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-amber-300 border border-white/10">{m.year}</div>}
                    {m.caption && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-gray-200">{m.caption}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --- آراء الزوار (ديناميكي) --- */}
      <section className="py-20 bg-[#070d10]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <div className="flex items-center gap-2 text-amber-500">
              <Quote size={24} />
              <div>
                <h2 className="text-3xl font-black text-white">آراء واقتراحات الزوار</h2>
                <p className="text-gray-400 text-xs mt-1">ما يقوله الزوار عن زيارتهم لولاية الوادي</p>
              </div>
            </div>
            <button className="bg-amber-500 text-black font-bold py-2.5 px-6 rounded-xl text-xs hover:bg-amber-400 transition-colors shadow-lg">
              أكتب رأيك
            </button>
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center py-10 bg-[#0b1619] rounded-3xl border border-white/5">
              <p className="text-gray-500">لا توجد تجارب منشورة في قاعدة البيانات بعد. كن أول المشاركين!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-[#0b1619] rounded-3xl p-6 border border-white/5 relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-amber-400 text-lg">
                          {(t.name || 'ز').charAt(0)}
                        </div>
                        <h4 className="font-bold text-sm text-white">{t.name || 'زائر مجهول'}</h4>
                      </div>
                    </div>
                    <div className="flex gap-1 text-amber-400 mb-4">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">&quot;{t.message}&quot;</p>
                  </div>
                  {t.created_at && (
                    <span className="text-[10px] text-gray-600 block mt-auto border-t border-white/5 pt-3">
                      {new Date(t.created_at).toLocaleDateString('ar-DZ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- الفوتر --- */}
      <footer className="bg-[#050b0d] border-t border-white/5 pt-16 pb-8 mt-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-tr from-teal-600 to-amber-500 rounded-full flex items-center justify-center p-1">
                  <div className="w-full h-full bg-[#050b0d] rounded-full flex items-center justify-center">
                    <Sun size={20} className="text-amber-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white">سوف 360</h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                منصة سياحية ذكية لولاية الوادي، اكتشف جمال الوادي ومعالمها السياحية وتراثها العريق من خلال منصة رقمية ذكية.
              </p>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black transition-colors flex items-center justify-center text-sm">𝕏</button>
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black transition-colors flex items-center justify-center text-sm">in</button>
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black transition-colors flex items-center justify-center text-sm">fb</button>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">روابط سريعة</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ChevronLeft size={14}/> الرئيسية</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ChevronLeft size={14}/> المعالم السياحية</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ChevronLeft size={14}/> العادات والتقاليد</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ChevronLeft size={14}/> من نحن</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">تواصل معنا</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-3"><Phone size={16} className="text-amber-500" /> <span dir="ltr">+213 32 12 34 56</span></li>
                <li className="flex items-center gap-3"><Mail size={16} className="text-amber-500" /> info@souf360.dz</li>
                <li className="flex items-center gap-3"><MapPin size={16} className="text-amber-500" /> مدينة الوادي، الجزائر</li>
                <li className="flex items-center gap-3 text-xs"><Clock size={16} className="text-amber-500" /> من 08:00 ص إلى 18:00 م</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">تطبيق الهاتف</h4>
              <p className="text-xs text-gray-400 mb-4">حمل تطبيق سوف 360 واستكشف المعالم السياحية بسهولة.</p>
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl py-3 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-bold text-white">Google Play</span>
                </button>
                <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl py-3 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-bold text-white">App Store</span>
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} سوف 360 - جميع الحقوق محفوظة</p>
            <p className="mt-2 md:mt-0">منصة السياحة التفاعلية لولاية الوادي</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
