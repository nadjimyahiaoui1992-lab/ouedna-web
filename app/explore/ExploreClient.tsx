'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Phone, Mail, Clock, Star, ChevronLeft, ChevronRight,
  ArrowRight, Menu, Landmark, Tent, Camera, Quote, Sun, ImageIcon,
  Sparkles, Heart, Bookmark
} from 'lucide-react';

// --- أيقونات التواصل الاجتماعي (SVG مضمّنة، لا تعتمد على إصدار lucide-react) ---
const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/></svg>
);
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1"/></svg>
);
const YoutubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.6-.46-5.3a2.9 2.9 0 0 0-2-2C18.9 4.2 12 4.2 12 4.2s-6.9 0-8.54.5a2.9 2.9 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.46 5.3a2.9 2.9 0 0 0 2 2c1.64.5 8.54.5 8.54.5s6.9 0 8.54-.5a2.9 2.9 0 0 0 2-2C23 15.6 23 12 23 12ZM9.75 15.5v-7l6.27 3.5-6.27 3.5Z"/></svg>
);
const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5.4-6.6L4.7 22H1.6l8.1-9.3L1 2h7.1l4.9 6.1L18.9 2Zm-1.2 18h1.9L7.4 3.9H5.4L17.7 20Z"/></svg>
);

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

const STARS = [1, 2, 3, 4, 5];

export default function ExploreClient({ places = [], oldMemories = [], testimonials = [] }: { places?: Place[], oldMemories?: OldMemory[], testimonials?: Testimonial[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const router = useRouter();
  const memoriesTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollMemories = (dir: 'left' | 'right') => {
    const el = memoriesTrackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? amount : -amount, behavior: 'smooth' });
  };

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
        .memories-track::-webkit-scrollbar { display: none; }
        .memories-track { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* --- القائمة العلوية --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-[#050b0d]/95 backdrop-blur-md shadow-lg border-b border-white/5' : 'bg-gradient-to-b from-black/60 to-transparent'}`}>
        {/* شريط اللغات */}
        <div className={`container mx-auto px-6 flex items-center transition-all duration-500 ${isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-9 opacity-100'}`}>
          <div className="flex items-center gap-6 text-xs font-bold text-gray-200">
            <button className="hover:text-amber-400 flex items-center gap-1.5 transition-colors"><span>🇫🇷</span> Français</button>
            <button className="hover:text-amber-400 flex items-center gap-1.5 transition-colors"><span>🇬🇧</span> English</button>
            <button className="text-amber-400 flex items-center gap-1.5 transition-colors"><span>🇩🇿</span> العربية</button>
          </div>
        </div>

        {/* الشريط الرئيسي */}
        <div className={`container mx-auto px-6 flex justify-between items-center ${isScrolled ? 'py-3' : 'py-4'}`}>
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-gray-200">
            <a href="#" className="hover:text-amber-400 transition-colors">اتصل بنا</a>
            <a href="#" className="hover:text-amber-400 transition-colors">من نحن</a>
            <a href="#" className="text-amber-500 border-b-2 border-amber-500 pb-1">الرئيسية</a>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-1">سوف <span className="text-amber-500">360</span></h1>
              <p className="text-[9px] text-gray-400 font-medium">منصة سياحية ذكية لولاية الوادي</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-tr from-teal-600 to-amber-500 rounded-full flex items-center justify-center p-1">
              <div className="w-full h-full bg-[#050b0d] rounded-full flex items-center justify-center">
                <Sun size={20} className="text-amber-500" />
              </div>
            </div>
          </div>

          <button className="lg:hidden p-2 bg-white/5 rounded-xl border border-white/10"><Menu size={20} /></button>
        </div>
      </nav>

      {/* --- الهيرو والخدمات --- */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center pb-32">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMG} alt="غروب الشمس في الوادي" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070d10]/70 via-[#070d10]/40 to-[#070d10]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center mt-16 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-black mb-4 drop-shadow-2xl text-white">اكتشف سحر ولاية الوادي</h2>
          <h3 className="text-xl md:text-2xl text-amber-400 font-bold mb-8">حيث تلتقي الطبيعة الخلابة بالتراث العريق</h3>

          <div className="bg-black/25 backdrop-blur-sm border border-white/15 rounded-2xl px-6 py-5 md:px-10 md:py-6">
            <p className="text-gray-200 max-w-2xl text-sm md:text-base leading-loose">
              ولاية الوادي، جوهرة الجنوب الجزائري، تزخر بمناظر طبيعية خلابة كالكثبان الرملية والواحات الخضراء، وتتميز بتاريخ عريق وثقافة أصيلة تجعلها وجهة سياحية فريدة من نوعها.
            </p>
          </div>
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
                    <span className="text-xs font-bold uppercase tracking-wider">{featuredPlace.category || 'معلم تاريخي'}</span>
                  </div>
                  <button className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors">
                    <Heart size={18} />
                  </button>
                </div>

                <h3 className="text-4xl sm:text-5xl font-black mb-3 text-white">{featuredPlace.name}</h3>

                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  <span className="font-bold text-xl ml-2">4.8</span>
                  {STARS.map((s) => <Star key={s} size={16} fill="currentColor" />)}
                </div>

                <p className="text-gray-300 leading-relaxed mb-8 text-sm sm:text-base line-clamp-4">
                  {featuredPlace.description || 'لا يوجد وصف متاح لهذا المعلم في قاعدة البيانات حالياً.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <MapPin className="text-amber-500" size={24} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold mb-1">العنوان</p>
                      <p className="text-xs font-bold text-white">
                        {featuredPlace.lat && featuredPlace.lng ? `${featuredPlace.lat.toFixed(4)}, ${featuredPlace.lng.toFixed(4)}` : 'مدينة الوادي'}
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

                <button className="absolute top-6 left-6 w-10 h-10 bg-black/40 backdrop-blur rounded-xl border border-white/10 flex items-center justify-center text-white hover:text-amber-400 transition-colors">
                  <Bookmark size={16} />
                </button>

                <div className="absolute top-6 right-6 bg-black/40 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1">
                  <ImageIcon size={14} /> معرض الصور
                </div>

                {thumbs.length > 0 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 w-[92%] justify-center">
                    <button className="w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:border-amber-500 transition-colors shrink-0">
                      <ChevronRight size={16} />
                    </button>
                    {thumbs.map((img, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl border-2 border-white/20 overflow-hidden cursor-pointer hover:border-amber-500 transition-colors shrink-0">
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {remainingImgs > 0 && (
                      <div className="w-16 h-16 rounded-xl border-2 border-white/20 bg-black/70 flex items-center justify-center font-bold text-sm cursor-pointer hover:border-amber-500 transition-colors text-white backdrop-blur-sm shrink-0">
                        +{remainingImgs}
                      </div>
                    )}
                    <button className="w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:border-amber-500 transition-colors shrink-0">
                      <ChevronLeft size={16} />
                    </button>
                  </div>
         
