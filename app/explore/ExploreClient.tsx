'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Compass, MapPin, Navigation, Sparkles, ImageIcon, Upload,
  Landmark as LandmarkIcon, ChevronLeft, ChevronRight, X,
  MessageSquareHeart, Loader2, Camera, Quote, Sun, Award, Clock3,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type Place = {
  id: string | number;
  name: string;
  category?: string;
  description?: string;
  cover_url?: any;
  image_url?: any;
  gallery?: any;
  lat?: number;
  lng?: number;
};

type OldMemory = {
  id: string | number;
  image_url: any;
  caption?: string;
  year?: string | number;
};

type Testimonial = {
  id: string | number;
  name?: string;
  message: string;
  photos?: any;
  created_at?: string;
};

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1542601098-8fc114e148e2?q=80&w=800&auto=format&fit=crop';

// ============================= دالة تحليل الصور الخارقة =============================
function parseImages(input: any): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map((item) => String(item).replace(/["'[\]]/g, '').trim()).filter(Boolean);
  }

  if (typeof input === 'object') {
    try {
      return Object.values(input).flatMap((v) => parseImages(v));
    } catch {
      return [];
    }
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];

    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseImages(parsed);
      } catch {
        // تجاهل الخطأ والمتابعة
      }
    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((s) => s.replace(/["'[\]]/g, '').trim())
        .filter(Boolean);
    }

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

  if (place.image_url) {
    parseImages(place.image_url).forEach((img) => imagesSet.add(formatUrl(img)));
  }

  if (place.cover_url) {
    parseImages(place.cover_url).forEach((img) => imagesSet.add(formatUrl(img)));
  }

  if (place.gallery) {
    parseImages(place.gallery).forEach((img) => imagesSet.add(formatUrl(img)));
  }

  const list = Array.from(imagesSet);
  return list.length > 0 ? list : [FALLBACK_IMG];
}

/* ============================= الهوية البصرية الموحّدة ============================= */
/* شعار "سوف 360": قبة معمارية داخل بوصلة — يوحّد الرمز بين صفحة الدخول وصفحة الاستكشاف */
function LogoMark({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.4" />
      <line x1="24" y1="4" x2="24" y2="9" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      <line x1="24" y1="39" x2="24" y2="44" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      <line x1="4" y1="24" x2="9" y2="24" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      <line x1="39" y1="24" x2="44" y2="24" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      <path d="M15 33 L15 24.5 Q15 13.5 24 11 Q33 13.5 33 24.5 L33 33 Z" fill="currentColor" />
      <rect x="12" y="33" width="24" height="3.4" rx="1.2" fill="currentColor" />
      <line x1="24" y1="11" x2="24" y2="6.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="24" cy="5.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

/* خط أفق القِباب — نفس التوقيع البصري المستخدم في صفحة الدخول لتوحيد الهوية بين الصفحتين */
function DomeSkyline({ fill = '#0a0908', className = '' }: { fill?: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
      <path
        d="M0 120 L0 74 Q20 74 20 60 A18 18 0 0 1 56 60 Q56 74 76 74 L110 74 Q110 60 122 60 A14 14 0 0 1 150 60 Q150 74 162 74 L205 74 Q205 52 222 52 A24 24 0 0 1 270 52 Q270 74 287 74 L330 74 Q330 62 342 62 A15 15 0 0 1 372 62 Q372 74 384 74 L430 74 Q430 46 452 46 A28 28 0 0 1 508 46 Q508 74 530 74 L575 74 Q575 60 587 60 A14 14 0 0 1 615 60 Q615 74 627 74 L672 74 Q672 50 692 50 A26 26 0 0 1 744 50 Q744 74 764 74 L805 74 Q805 62 817 62 A15 15 0 0 1 847 62 Q847 74 859 74 L905 74 Q905 44 928 44 A29 29 0 0 1 986 44 Q986 74 1009 74 L1050 74 Q1050 60 1062 60 A14 14 0 0 1 1090 60 Q1090 74 1102 74 L1200 74 L1200 120 Z"
        fill={fill}
      />
    </svg>
  );
}

/* الخط الرملي المتموج — فاصل زخرفي متكرر بين الأقسام، إشارة لكثبان السوف */
function DuneDivider() {
  return (
    <div className="relative z-10 w-full overflow-hidden h-6 opacity-40">
      <svg className="dune-drift w-[140%]" viewBox="0 0 1400 24" preserveAspectRatio="none" fill="none">
        <path
          d="M0 18 Q 35 4, 70 18 T 140 18 T 210 18 T 280 18 T 350 18 T 420 18 T 490 18 T 560 18 T 630 18 T 700 18 T 770 18 T 840 18 T 910 18 T 980 18 T 1050 18 T 1120 18 T 1190 18 T 1260 18 T 1330 18 T 1400 18"
          stroke="#f59e0b"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

function SectionEyebrow({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: any;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="mt-1 flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
        <Icon className="text-amber-500" size={19} strokeWidth={2} />
      </div>
      <div>
        <span className="text-[11px] font-bold text-amber-400/80 tracking-wide">{eyebrow}</span>
        <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">{title}</h2>
        <p className="text-stone-400 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

export default function ExploreClient({
  places,
  oldMemories,
  testimonials,
}: {
  places: Place[];
  oldMemories: OldMemory[];
  testimonials: Testimonial[];
}) {
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0a0908] text-white selection:bg-amber-500/30"
      style={{ fontFamily: "'Tajawal', 'IBM Plex Sans Arabic', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap');
        @keyframes riseIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes driftSlow { from { transform: translateX(0); } to { transform: translateX(-4%); } }
        .rise-1 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .rise-2 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .rise-3 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
        .dune-drift { animation: driftSlow 40s linear infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .rise-1, .rise-2, .rise-3, .dune-drift { animation: none !important; }
        }
      `}</style>

      <TopNav />
      <Hero places={places} oldMemories={oldMemories} testimonials={testimonials} />
      <DuneDivider />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-14 sm:space-y-20 pb-20">
        <LandmarksSection places={places} onOpen={setActivePlace} />
        <MemoriesGallery memories={oldMemories} />
        <WilayaIntro />
        <VisitorExperiences testimonials={testimonials} onShare={() => setShareOpen(true)} />
      </div>

      <Footer />

      {activePlace && <PlaceModal place={activePlace} onClose={() => setActivePlace(null)} />}
      {shareOpen && <ShareExperienceModal onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function TopNav() {
  return (
    <nav className="sticky top-0 z-40 bg-[#0a0908]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark size={26} className="text-amber-500" />
          <span className="text-xl font-black tracking-tight text-white">
            سوف <span className="text-amber-500">360</span>
          </span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1 text-sm font-bold text-stone-400 hover:text-white transition bg-white/5 px-3 py-1.5 rounded-full"
        >
          <ChevronRight size={16} /> الرئيسية
        </Link>
      </div>
    </nav>
  );
}

function Hero({
  places,
  oldMemories,
  testimonials,
}: {
  places: Place[];
  oldMemories: OldMemory[];
  testimonials: Testimonial[];
}) {
  const stats = [
    { icon: Compass, label: 'معالم موثّقة', value: `${places.length}+` },
    { icon: Camera, label: 'ذكريات أرشيفية', value: `${oldMemories.length}+` },
    { icon: Award, label: 'تجارب زوار', value: `${testimonials.length}+` },
    { icon: Clock3, label: 'محدّث باستمرار', value: '24/7' },
  ];

  return (
    <header className="relative w-full overflow-hidden">
      <div className="relative h-[46vh] sm:h-[56vh] min-h-[360px] max-h-[560px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-black/30 to-[#0a0908]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay" />

        <DomeSkyline fill="#0a0908" className="absolute inset-x-0 bottom-0 w-full h-20 sm:h-28 opacity-90 pointer-events-none" />

        <div className="relative z-10 h-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-14 sm:pb-20">
          <div className="rise-1 inline-flex items-center gap-2 w-max bg-amber-500/15 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-amber-300 text-[11px] font-bold tracking-wide backdrop-blur-md mb-4">
            <Sun size={13} className="text-amber-400" />
            <span>الجزائر — ولاية الوادي (السوف)</span>
          </div>

          <h1 className="rise-2 text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] mb-3 max-w-3xl drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
            اكتشف المعالم
            <br />
            <span className="text-amber-500">مدينة الألف قبة</span>
          </h1>
          <p className="rise-3 text-stone-300 text-xs sm:text-base max-w-xl leading-relaxed font-medium">
            دليلك الكامل لأجمل الوجهات في الوادي: قِباب أصيلة، غيطان نخيل، وكثبان ذهبية —
            كل معلم موثّق بصوره وموقعه على الخريطة.
          </p>
        </div>
      </div>

      {/* شريط إحصائيات حيّة — أرقام حقيقية من قاعدة البيانات وليست عناصر ثابتة */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-white/10 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center justify-center gap-1.5 py-4 sm:py-5 px-2 text-center">
              <Icon className="text-amber-400" size={19} strokeWidth={2} />
              <span className="text-white/90 font-semibold text-[11px] sm:text-sm">{label}</span>
              <span className="text-amber-500 font-extrabold text-base sm:text-lg">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function LandmarksSection({
  places,
  onOpen,
}: {
  places: Place[];
  onOpen: (p: Place) => void;
}) {
  return (
    <section>
      <SectionEyebrow
        icon={MapPin}
        eyebrow="الوجهات"
        title="اكتشف المعالم"
        subtitle="أروع الوجهات السياحية والتاريخية في ولاية الوادي"
      />

      {places.length === 0 ? (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-stone-400">لا توجد معالم مضافة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {places.map((place) => {
            const placeImgs = getPlaceImages(place);
            const coverImg = placeImgs[0];

            return (
              <button
                key={place.id}
                onClick={() => onOpen(place)}
                className="group relative text-right rounded-[1.5rem] overflow-hidden border border-white/5 bg-[#15120e] shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 hover:border-amber-500/20 transition-all duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={coverImg}
                    alt={place.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMG;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15120e] via-[#15120e]/20 to-transparent" />
                  {place.category && (
                    <span className="absolute top-3 right-3 bg-black/40 backdrop-blur text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/20">
                      {place.category}
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold mb-1 text-white">{place.name}</h3>
                  <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed mb-4">
                    {place.description}
                  </p>
                  <div className="w-full bg-white/5 group-hover:bg-amber-500 group-hover:text-black text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5">
                    عرض التفاصيل والملاحة <ChevronLeft size={16} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PlaceModal({ place, onClose }: { place: Place; onClose: () => void }) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [navigateError, setNavigateError] = useState('');

  const images = useMemo(() => getPlaceImages(place), [place]);

  const handleInternalNavigate = () => {
    if (!place.name) {
      setNavigateError('اسم المعلم غير متوفر حالياً.');
      return;
    }
    setNavigating(true);
    router.push(`/map?destination=${encodeURIComponent(place.name)}&autoRoute=true`);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-[#171310] rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 transition shadow-lg"
        >
          <X size={18} />
        </button>

        <div className="p-4 sm:p-6 pb-2 border-b border-white/5">
          <p className="text-xs text-amber-400 font-bold mb-2 flex items-center gap-1.5">
            <Camera size={14} /> اسحب يميناً ويساراً لمشاهدة صور المعلم ({images.length})
          </p>
          <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-thin scrollbar-thumb-amber-500/50">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="shrink-0 w-64 sm:w-72 h-44 sm:h-52 rounded-2xl overflow-hidden snap-center border border-white/10 relative shadow-md bg-black/40"
              >
                <img
                  src={imgUrl}
                  alt={`${place.name} - صورة ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {place.category && (
            <span className="w-max bg-amber-500/20 text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full mb-3 border border-amber-500/20 inline-block">
              {place.category}
            </span>
          )}
          <h3 className="text-xl sm:text-2xl font-black mb-2 text-white">{place.name}</h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">{place.description}</p>

          <button
            onClick={handleInternalNavigate}
            disabled={navigating}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg text-sm"
          >
            {navigating ? (
              <>
                <Loader2 size={18} className="animate-spin" /> جارٍ فتح خريطة المنصة وتفعيل المسار...
              </>
            ) : (
              <>
                <Navigation size={18} /> ابدأ الملاحة عبر خريطة سوف 360
              </>
            )}
          </button>
          {navigateError && <p className="text-amber-300 text-xs mt-2 text-center">{navigateError}</p>}
        </div>
      </div>
    </div>
  );
}

function MemoriesGallery({ memories }: { memories: OldMemory[] }) {
  return (
    <section>
      <SectionEyebrow
        icon={Camera}
        eyebrow="الأرشيف"
        title="ذكريات قديمة"
        subtitle="لمحات من الأرشيف تحكي وجه الوادي عبر الزمن"
      />

      {memories.length === 0 ? (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-stone-400">لم تُضَف صور أرشيفية بعد.</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {memories.map((m) => {
            const mImgs = parseImages(m.image_url);
            const imgSrc = mImgs[0] || FALLBACK_IMG;

            return (
              <div
                key={m.id}
                className="relative break-inside-avoid rounded-xl overflow-hidden border border-white/5 group"
              >
                <img
                  src={imgSrc}
                  alt={m.caption || 'ذكرى قديمة'}
                  className="w-full object-cover sepia-[.35] contrast-105 group-hover:sepia-0 transition-all duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                />
                {(m.caption || m.year) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
                    <p className="text-white text-xs font-bold">{m.caption}</p>
                    {m.year && <p className="text-amber-300 text-[10px]">{m.year}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function WilayaIntro() {
  return (
    <section className="relative rounded-[1.75rem] overflow-hidden border border-amber-500/10 bg-gradient-to-br from-[#1a140c] to-[#0f0c08] p-6 sm:p-10 text-center">
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <LandmarkIcon className="relative mx-auto text-amber-500 mb-3" size={26} />
      <h3 className="relative text-xl sm:text-3xl font-black mb-3 text-white">
        مدينة الألف قبة والأصالة العريقة
      </h3>
      <p className="relative text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
        تُعد ولاية الوادي (السوف) واحدة من أبرز الوجهات السياحية والثقافية في الجزائر، حيث
        تدمج بفرادة بين عبق التاريخ، وعمارة القباب التقليدية المميزة، وغيطان النخيل الممتدة،
        وسحر الكثبان الرملية الذهبية. إنها أرض الكرم والفلاحة الواحاتية.
      </p>
    </section>
  );
}

function VisitorExperiences({
  testimonials,
  onShare,
}: {
  testimonials: Testimonial[];
  onShare: () => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <SectionEyebrow
          icon={Sparkles}
          eyebrow="المجتمع"
          title="تجارب الزوار"
          subtitle="قصص وذكريات يشاركها زوار ولاية الوادي"
        />
        <button
          onClick={onShare}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm transition shrink-0"
        >
          <Upload size={14} /> شارك تجربتك
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-stone-400">كن أول من يشارك تجربته في ولاية الوادي!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => {
            const tPhotos = parseImages(t.photos);

            return (
              <div
                key={t.id}
                className="bg-[#15120e] rounded-2xl overflow-hidden border border-white/5 shadow-lg p-4"
              >
                {tPhotos.length > 0 && (
                  <div className="flex overflow-x-auto gap-2 mb-3 pb-1">
                    {tPhotos.map((p, idx) => (
                      <img key={idx} src={p} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10" alt="" />
                    ))}
                  </div>
                )}
                <Quote className="text-amber-500/50 mb-2" size={16} />
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-3">
                  {t.message}
                </p>
                <p className="text-amber-400 text-xs font-bold">{t.name || 'زائر'}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ShareExperienceModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('يرجى كتابة نص تجربتك أولاً.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const path = `testimonials/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from('testimonials-photos')
          .upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data } = supabase.storage.from('testimonials-photos').getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      const { error: insertErr } = await supabase.from('testimonials').insert({
        name: name.trim() || null,
        message: message.trim(),
        photos: uploadedUrls,
        status: 'pending',
      });
      if (insertErr) throw insertErr;

      setDone(true);
    } catch {
      setError('حدث خطأ أثناء إرسال تجربتك، حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-md bg-[#171310] rounded-2xl border border-white/10 shadow-2xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 bg-white/5 hover:bg-white/10 text-white rounded-full p-1.5 transition"
        >
          <X size={16} />
        </button>

        {done ? (
          <div className="text-center py-6">
            <MessageSquareHeart className="mx-auto text-amber-500 mb-3" size={32} />
            <h3 className="text-lg font-bold mb-1">شكراً لمشاركتك!</h3>
            <p className="text-stone-400 text-xs">تجربتك قيد المراجعة وستظهر قريباً.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1">شارك تجربتك</h3>
            <p className="text-stone-400 text-xs mb-4">تُعرض بعد مراجعة المشرفين.</p>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك الكريم (اختياري)"
              className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm mb-3 outline-none focus:border-amber-500/50"
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="كيف كانت رحلتك في الوادي؟"
              className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm mb-3 outline-none focus:border-amber-500/50 resize-none"
            />

            <label className="flex items-center justify-center gap-2 border border-dashed border-white/15 rounded-xl py-3 text-xs text-stone-400 cursor-pointer hover:border-amber-500/40 transition mb-3">
              <ImageIcon size={16} className="text-amber-400" />
              {files.length > 0 ? `${files.length} صورة مختارة` : 'أرفق صوراً (اختياري)'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) setFiles(Array.from(e.target.files));
                }}
              />
            </label>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold py-2.5 rounded-xl text-xs sm:text-sm transition"
            >
              {submitting ? 'جارٍ الإرسال...' : 'إرسال تجربتي'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#080706]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
        <div className="flex items-center gap-2">
          <LogoMark size={22} className="text-amber-500" />
          <span className="text-base font-black text-white">
            سوف <span className="text-amber-500">360</span>
          </span>
        </div>
        <p className="text-stone-500 text-xs max-w-sm">
          المنصة السياحية الرسمية لوادي سوف — دليلك الرقمي لاكتشاف مدينة الألف قبة وقبة.
        </p>
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link href="/" className="text-stone-400 hover:text-amber-400 transition">الرئيسية</Link>
          <Link href="/map" className="text-stone-400 hover:text-amber-400 transition">الخريطة</Link>
        </div>
      </div>
    </footer>
  );
}