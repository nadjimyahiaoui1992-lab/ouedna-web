'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Compass, MapPin, Sparkles, ImageIcon, Upload,
  Landmark as LandmarkIcon, ChevronLeft, ChevronRight, X,
  MessageSquareHeart, Camera, Quote, Sun, Award, Clock3,
  Search, Tag, Heart, Share2, Check, Info, Navigation2, Maximize2, Minimize2
} from 'lucide-react';
import { LanguageProvider, useLanguage, useAutoTranslate, DictKey } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type Place = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  description?: string;
  text?: string;
  cover_url?: any;
  image_url?: any;
  image?: any;
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
  'https://images.unsplash.com/photo-1548508492-4e551980894f?q=80&w=2000&auto=format&fit=crop';

const FAVORITES_KEY = 'souf360_favorites';
const TESTIMONIALS_BUCKET = 'testimonials-photos';

// ============================= دالة تحليل الصور =============================
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
        // تجاهل الخطأ
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
  
  // ⚠️ هام: تأكد أن هذا الاسم يطابق اسم سلة التخزين الخاصة بالمعالم في Supabase
  // إذا كانت الصور ترفع في سلة اسمها 'images' أو 'souf360'، قم بتغيير الكلمة هنا
  const BUCKET_NAME = 'places'; 

  const formatUrl = (img: string) => {
    if (img.startsWith('http')) return img;
    const cleanImgPath = img.replace(/^\/+/, '');
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${cleanImgPath}`;
  };

  if (place.image_url) parseImages(place.image_url).forEach((img) => imagesSet.add(formatUrl(img)));
  if (place.image) parseImages(place.image).forEach((img) => imagesSet.add(formatUrl(img)));
  if (place.cover_url) parseImages(place.cover_url).forEach((img) => imagesSet.add(formatUrl(img)));
  if (place.gallery) parseImages(place.gallery).forEach((img) => imagesSet.add(formatUrl(img)));

  const list = Array.from(imagesSet);
  return list.length > 0 ? list : [FALLBACK_IMG];
}

function buildInternalMapUrl(place: Place): string {
  const params = new URLSearchParams();
  params.set('placeId', String(place.id));
  if (typeof place.lat === 'number') params.set('lat', String(place.lat));
  if (typeof place.lng === 'number') params.set('lng', String(place.lng));
  if (place.name || place.title) params.set('destination', (place.name || place.title) as string);
  return `/map?${params.toString()}`;
}

/* ============================= الهوية البصرية الموحّدة ============================= */
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

/* ============================= الخلفية الجديدة (واحة في غروب الشمس) ============================= */
function GhoutBackdrop() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1548508492-4e551980894f?q=80&w=2000&auto=format&fit=crop')`,
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908]/95 via-[#0a0908]/80 to-[#0a0908]" />
      <div className="absolute inset-0 bg-[#0a0908]/60 backdrop-blur-[2px]" />
    </div>
  );
}

function SectionEyebrow({ icon: Icon, eyebrow, title, subtitle }: { icon: any; eyebrow: string; title: string; subtitle: string; }) {
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

export default function ExploreClient(props: { places: Place[]; oldMemories: OldMemory[]; testimonials: Testimonial[]; }) {
  return (
    <LanguageProvider>
      <ExploreClientInner {...props} />
    </LanguageProvider>
  );
}

function ExploreClientInner({ places, oldMemories, testimonials }: { places: Place[]; oldMemories: OldMemory[]; testimonials: Testimonial[]; }) {
  const { dir, t } = useLanguage();
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('__all__');
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {
      // تجاهل
    }
  }, []);

  const toggleFavorite = (id: string | number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => p.category && set.add(p.category));
    return ['__all__', ...Array.from(set)];
  }, [places]);

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchCategory = activeCategory === '__all__' || p.category === activeCategory;
      const searchStr = `${p.name || ''} ${p.title || ''} ${p.description || ''} ${p.text || ''}`.toLowerCase();
      const matchSearch = !searchQuery.trim() || searchStr.includes(searchQuery.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [places, activeCategory, searchQuery]);

  return (
    <div dir={dir} className="relative min-h-screen bg-[#0a0908] text-white selection:bg-amber-500/30" style={{ fontFamily: "'Tajawal', 'IBM Plex Sans Arabic', sans-serif" }}>
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

      <GhoutBackdrop />

      <div className="relative z-10">
        <TopNav />
        <Hero places={places} oldMemories={oldMemories} testimonials={testimonials} />
        <DuneDivider />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-14 sm:space-y-20 pb-20">
          <LandmarksSection
            places={filteredPlaces}
            totalCount={places.length}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onOpen={setActivePlace}
          />
          <MemoriesGallery memories={oldMemories} />
          <WilayaIntro />
          <VisitorExperiences testimonials={testimonials} onShare={() => setShareOpen(true)} />
        </div>

        <Footer />
      </div>

      {activePlace && (
        <PlaceModal
          place={activePlace}
          isFavorite={favorites.has(activePlace.id)}
          onToggleFavorite={() => toggleFavorite(activePlace.id)}
          onClose={() => setActivePlace(null)}
        />
      )}
      {shareOpen && <ShareExperienceModal onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function TopNav() {
  const { t } = useLanguage();
  return (
    <nav className="sticky top-0 z-40 bg-[#0a0908]/80 backdrop-blur-xl border-b border-white/5 px-4 py-2.5 sm:py-3.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark size={24} className="text-amber-500" />
          <span className="text-lg sm:text-xl font-black tracking-tight text-white">
            Souf <span className="text-amber-500">Explorer</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <Link href="/" className="flex items-center gap-1 text-xs sm:text-sm font-bold text-stone-400 hover:text-white transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full">
            <ChevronRight size={16} className="rtl:inline ltr:hidden" />
            <ChevronLeft size={16} className="rtl:hidden ltr:inline" />
            {t('home')}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero({ places, oldMemories, testimonials }: { places: Place[]; oldMemories: OldMemory[]; testimonials: Testimonial[]; }) {
  const { t } = useLanguage();
  const stats = [
    { icon: Compass, label: t('statLandmarks'), value: `${places.length}+` },
    { icon: Camera, label: t('statMemories'), value: `${oldMemories.length}+` },
    { icon: Award, label: t('statTestimonials'), value: `${testimonials.length}+` },
    { icon: Clock3, label: t('statLive'), value: '24/7' },
  ];

  return (
    <header className="relative w-full overflow-hidden">
      <div className="relative h-[46vh] sm:h-[56vh] min-h-[360px] max-h-[560px] w-full">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2000&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/60 via-black/30 to-[#0a0908]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay" />
        <DomeSkyline fill="#0a0908" className="absolute inset-x-0 bottom-0 w-full h-20 sm:h-28 opacity-90 pointer-events-none" />

        <div className="relative z-10 h-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-14 sm:pb-20">
          <div className="rise-1 inline-flex items-center gap-2 w-max bg-amber-500/15 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-amber-300 text-[11px] font-bold tracking-wide backdrop-blur-md mb-4">
            <Sun size={13} className="text-amber-400" />
            <span>{t('heroBadge')}</span>
          </div>
          <h1 className="rise-2 text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] mb-3 max-w-3xl drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
            {t('heroTitle1')}
            <br />
            <span className="text-amber-500">{t('heroTitle2')}</span>
          </h1>
          <p className="rise-3 text-stone-300 text-xs sm:text-base max-w-xl leading-relaxed font-medium">
            {t('heroDesc')}
          </p>
        </div>
      </div>

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

function PlaceCard({ place, isFav, onOpen, onToggleFavorite, onShowOnMap }: { place: Place; isFav: boolean; onOpen: () => void; onToggleFavorite: () => void; onShowOnMap: () => void; }) {
  const { t } = useLanguage();
  const placeImgs = getPlaceImages(place);
  const coverImg = placeImgs[0];
  
  const name = useAutoTranslate(place.name);
  const description = useAutoTranslate(place.description);
  const category = useAutoTranslate(place.category);

  return (
    <div className="group relative rounded-[1.5rem] overflow-hidden border border-white/5 bg-[#15120e] shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 hover:border-amber-500/20 transition-all duration-300">
      <button onClick={onOpen} className="block w-full text-start" aria-label={name}>
        <div className="relative h-48">
          <img
            src={coverImg}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15120e] via-[#15120e]/20 to-transparent" />
          
          {place.category && (
            <span className="absolute top-3 end-3 bg-black/40 backdrop-blur text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/20">
              {category}
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5 pb-0">
          <h3 className="text-base sm:text-lg font-bold mb-1 text-white">{name}</h3>
          <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed mb-4">{description}</p>
        </div>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        aria-label={isFav ? t('removeFromFavorites') : t('addToFavorites')}
        className={`absolute top-3 start-3 rounded-full p-1.5 backdrop-blur border transition ${
          isFav ? 'bg-amber-500 border-amber-500 text-black' : 'bg-black/40 border-white/10 text-white hover:border-amber-400/50'
        }`}
      >
        <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
      </button>
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex gap-2">
        <button onClick={onOpen} className="flex-1 bg-white/5 group-hover:bg-amber-500 group-hover:text-black text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5">
          {t('viewDetailsNav')} <ChevronLeft size={16} className="rtl:inline ltr:hidden" />
          <ChevronRight size={16} className="rtl:hidden ltr:inline" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onShowOnMap(); }}
          aria-label={t('showOnPlatformMap')}
          className="shrink-0 flex items-center justify-center w-10 sm:w-11 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-amber-300 rounded-xl border border-white/5 transition"
        >
          <MapPin size={15} />
        </button>
      </div>
    </div>
  );
}

function LandmarksSection({ places, totalCount, categories, activeCategory, onCategoryChange, searchQuery, onSearchChange, favorites, onToggleFavorite, onOpen }: any) {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <section>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <SectionEyebrow icon={MapPin} eyebrow={t('destinationsEyebrow')} title={t('discoverLandmarks')} subtitle={`${t('landmarksSubtitle')} (${totalCount})`} />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-xl ps-10 pe-3 py-2.5 text-sm outline-none transition placeholder:text-stone-500"
          />
        </div>
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat: string) => (
              <CategoryButton key={cat} cat={cat} active={activeCategory === cat} onClick={() => onCategoryChange(cat)} />
            ))}
          </div>
        )}
      </div>
      {places.length === 0 ? (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-stone-400">{totalCount === 0 ? t('noPlacesYet') : t('noSearchResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {places.map((place: Place) => (
            <PlaceCard key={place.id} place={place} isFav={favorites.has(place.id)} onOpen={() => onOpen(place)} onToggleFavorite={() => onToggleFavorite(place.id)} onShowOnMap={() => router.push(buildInternalMapUrl(place))} />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryButton({ cat, active, onClick }: { cat: string; active: boolean; onClick: () => void }) {
  const { t } = useLanguage();
  const label = useAutoTranslate(cat === '__all__' ? null : cat);
  const display = cat === '__all__' ? t('categoryAll') : label;
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition ${
        active ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-stone-300 border-white/10 hover:border-amber-500/40 hover:text-amber-300'
      }`}
    >
      <Tag size={12} /> {display}
    </button>
  );
}

// ============================= إضافة التكبير (Fullscreen Lightbox) لمعرض الصور =============================
function SwipeableGallery({ images, activeIdx, setActiveIdx, alt }: { images: string[]; activeIdx: number; setActiveIdx: (i: number) => void; alt: string; }) {
  const { t } = useLanguage();
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImg = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveIdx((activeIdx + 1) % images.length); };
  const prevImg = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveIdx((activeIdx - 1 + images.length) % images.length); };

  const onPointerDown = (e: React.PointerEvent) => {
    if (images.length <= 1) return;
    startX.current = e.clientX;
    deltaX.current = 0;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    deltaX.current = e.clientX - startX.current;
  };
  const onPointerUp = () => {
    if (startX.current === null) return;
    const threshold = 50;
    if (deltaX.current > threshold) prevImg();
    else if (deltaX.current < -threshold) nextImg();
    startX.current = null;
    deltaX.current = 0;
    setDragging(false);
  };

  return (
    <>
      <div
        className="relative h-48 sm:h-72 bg-black/40 touch-pan-y select-none group"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
      >
        <img 
          src={images[activeIdx]} 
          alt={`${alt} - ${activeIdx + 1}`} 
          draggable={false} 
          className={`w-full h-full object-cover transition-opacity cursor-pointer ${dragging ? 'opacity-90' : 'group-hover:opacity-95'}`} 
          onClick={() => setIsFullscreen(true)}
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171310] via-transparent to-black/20 pointer-events-none" />
        
        {/* زر التكبير بملء الشاشة */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
          className="absolute top-3 start-3 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition opacity-0 group-hover:opacity-100 shadow-md"
          title="عرض الصورة بملء الشاشة"
        >
          <Maximize2 size={16} />
        </button>

        {images.length > 1 && (
          <>
            <button onClick={prevImg} aria-label={t('previousImage')} className="absolute top-1/2 -translate-y-1/2 start-3 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition">
              <ChevronRight size={18} className="rtl:inline ltr:hidden" />
              <ChevronLeft size={18} className="rtl:hidden ltr:inline" />
            </button>
            <button onClick={nextImg} aria-label={t('nextImage')} className="absolute top-1/2 -translate-y-1/2 end-3 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition">
              <ChevronLeft size={18} className="rtl:inline ltr:hidden" />
              <ChevronRight size={18} className="rtl:hidden ltr:inline" />
            </button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
              {activeIdx + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* نافذة العرض بملء الشاشة (Lightbox) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl" onClick={() => setIsFullscreen(false)}>
          <button className="absolute top-4 end-4 sm:top-6 sm:end-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition z-50">
            <Minimize2 size={20} />
          </button>
          <img 
            src={images[activeIdx]} 
            className="max-w-full max-h-[85vh] object-contain p-2 sm:p-6 drop-shadow-2xl" 
            alt="Fullscreen" 
            onClick={(e) => e.stopPropagation()} 
          />
          {images.length > 1 && (
            <>
              <button onClick={prevImg} className="absolute top-1/2 -translate-y-1/2 start-4 sm:start-8 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition shadow-lg">
                <ChevronRight size={24} className="rtl:inline ltr:hidden" />
                <ChevronLeft size={24} className="rtl:hidden ltr:inline" />
              </button>
              <button onClick={nextImg} className="absolute top-1/2 -translate-y-1/2 end-4 sm:end-8 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition shadow-lg">
                <ChevronLeft size={24} className="rtl:inline ltr:hidden" />
                <ChevronRight size={24} className="rtl:hidden ltr:inline" />
              </button>
              {/* مصغرات للصور أسفل الشاشة */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] p-2 hide-scrollbar">
                {images.map((imgUrl, idx) => (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }} className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition ${idx === activeIdx ? 'border-amber-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                    <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function PlaceModal({ place, isFavorite, onToggleFavorite, onClose }: { place: Place; isFavorite: boolean; onToggleFavorite: () => void; onClose: () => void; }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);

  const images = useMemo(() => getPlaceImages(place), [place]);
  
  const name = useAutoTranslate(place.name);
  const description = useAutoTranslate(place.description);
  const category = useAutoTranslate(place.category);

  const handleShowOnMap = () => router.push(buildInternalMapUrl(place));
  const handleShare = async () => {
    const shareData = { title: name, text: description, url: typeof window !== 'undefined' ? window.location.href : '' };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6" onClick={onClose}>
      <div className="relative w-full sm:max-w-2xl max-h-[80vh] sm:max-h-[85vh] overflow-y-auto bg-[#171310] rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label={t('close')} className="absolute top-4 end-4 z-30 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 transition shadow-lg">
          <X size={18} />
        </button>

        <div className="relative">
          <SwipeableGallery images={images} activeIdx={activeImg} setActiveIdx={setActiveImg} alt={name || 'Place image'} />
          {images.length > 1 && (
            <>
              <div className="flex overflow-x-auto gap-2 p-3 bg-[#12100c] border-b border-white/5">
                {images.map((imgUrl, idx) => (
                  <button key={idx} onClick={() => setActiveImg(idx)} className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition ${idx === activeImg ? 'border-amber-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }} />
                  </button>
                ))}
              </div>
              <p className="text-center text-[10px] text-stone-500 py-1.5 bg-[#12100c] border-b border-white/5">{t('swipeHint')}</p>
            </>
          )}
        </div>

        <div className="p-4 sm:p-7">
          <div className="flex items-start justify-between gap-3 mb-3">
            
            {place.category ? (
              <span className="bg-amber-500/20 text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/20 inline-block">
                {category}
              </span>
            ) : <span />}

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onToggleFavorite} aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')} className={`rounded-full p-1.5 sm:p-2 border transition ${isFavorite ? 'bg-amber-500 border-amber-500 text-black' : 'bg-white/5 border-white/10 text-white hover:border-amber-400/50'}`}>
                <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button onClick={handleShare} aria-label={t('shareLandmark')} className="rounded-full p-1.5 sm:p-2 border bg-white/5 border-white/10 text-white hover:border-amber-400/50 transition">
                {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
              </button>
            </div>
          </div>

          <h3 className="text-lg sm:text-2xl font-black mb-3 sm:mb-4 text-white">{name}</h3>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 sm:p-5 mb-5 sm:mb-6">
            <div className="flex items-center gap-2 mb-2.5 text-amber-400">
              <Info size={15} />
              <span className="text-xs font-bold">{t('aboutLandmark')}</span>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">{description || t('noDescription')}</p>
          </div>

          <button onClick={handleShowOnMap} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 sm:py-3.5 rounded-2xl border border-amber-500 transition text-xs sm:text-sm shadow-lg">
            <Navigation2 size={16} /> {t('showOnMap')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================= مكونات الذكريات ============================= */
function MemoriesGallery({ memories }: { memories: OldMemory[] }) {
  const { t } = useLanguage();
  
  if (!memories || memories.length === 0) return null;

  return (
    <section>
      <div className="mb-5">
        <SectionEyebrow 
          icon={ImageIcon} 
          eyebrow={t('archiveEyebrow')} 
          title={t('oldMemories')}
          subtitle={t('memoriesSubtitle')} 
        />
      </div>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {memories.map((memory) => (
          <MemoryTile key={memory.id} memory={memory} />
        ))}
      </div>
    </section>
  );
}

function MemoryTile({ memory }: { memory: OldMemory }) {
  const mImgs = parseImages(memory.image_url);
  const imgSrc = mImgs[0] || FALLBACK_IMG;
  const caption = useAutoTranslate(memory.caption);
  
  return (
    <div className="relative break-inside-avoid rounded-xl overflow-hidden border border-white/5 group">
      <img 
        src={imgSrc} 
        alt={caption || 'memory'} 
        className="w-full object-cover sepia-[.35] contrast-105 group-hover:sepia-0 transition-all duration-500" 
        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }} 
      />
      {(memory.caption || memory.year) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
          <p className="text-white text-xs font-bold">{caption}</p>
          {memory.year && <p className="text-amber-300 text-[10px]">{memory.year}</p>}
        </div>
      )}
    </div>
  );
}

function WilayaIntro() {
  const { t } = useLanguage();
  return (
    <section className="relative rounded-[1.75rem] overflow-hidden border border-amber-500/10 bg-gradient-to-br from-[#1a140c] to-[#0f0c08] p-6 sm:p-10 text-center">
      <div className="absolute -top-16 -start-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -end-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <LandmarkIcon className="relative mx-auto text-amber-500 mb-3" size={26} />
      <h3 className="relative text-xl sm:text-3xl font-black mb-3 text-white">{t('wilayaTitle')}</h3>
      <p className="relative text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">{t('wilayaDesc')}</p>
    </section>
  );
}

function VisitorExperiences({ testimonials, onShare }: { testimonials: Testimonial[]; onShare: () => void; }) {
  const { t } = useLanguage();
  return (
    <section>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <SectionEyebrow icon={Sparkles} eyebrow={t('communityEyebrow')} title={t('visitorExperiences')} subtitle={t('experiencesSubtitle')} />
        <button onClick={onShare} className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm transition shrink-0">
          <Upload size={14} /> {t('shareYourExperience')}
        </button>
      </div>
      {testimonials.length === 0 ? (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-stone-400">{t('beFirstToShare')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((tst) => (
            <TestimonialCard key={tst.id} testimonial={tst} />
          ))}
        </div>
      )}
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { t } = useLanguage();
  const tPhotos = parseImages(testimonial.photos);
  const message = useAutoTranslate(testimonial.message);
  const name = useAutoTranslate(testimonial.name);
  return (
    <div className="bg-[#15120e] rounded-2xl overflow-hidden border border-white/5 shadow-lg p-4">
      {tPhotos.length > 0 && (
        <div className="flex overflow-x-auto gap-2 mb-3 pb-1">
          {tPhotos.map((p, idx) => (
            <img key={idx} src={p} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10" alt="" />
          ))}
        </div>
      )}
      <Quote className="text-amber-500/50 mb-2" size={16} />
      <p className="text-stone-300 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-3">{message}</p>
      <p className="text-amber-400 text-xs font-bold">{name || t('visitorFallbackName')}</p>
    </div>
  );
}

function ShareExperienceModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) { setError(t('messageRequired')); return; }
    setSubmitting(true); setError('');
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const path = `testimonials/${Date.now()}-${safeName}`;
        const { error: uploadErr } = await supabase.storage.from(TESTIMONIALS_BUCKET).upload(path, file, { cacheControl: '3600', upsert: false });
        if (uploadErr) throw new Error(`upload:${uploadErr.message}`);
        const { data } = supabase.storage.from(TESTIMONIALS_BUCKET).getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
      const { error: insertErr } = await supabase.from('testimonials').insert({ name: name.trim() || null, message: message.trim(), photos: uploadedUrls, status: 'pending' });
      if (insertErr) throw new Error(`insert:${insertErr.message}`);
      setDone(true);
    } catch (err: any) {
      console.error('فشل إرسال تجربة الزائر:', err);
      const raw = String(err?.message || '');
      if (raw.startsWith('upload:')) setError(`${t('sendError')} (${raw.replace('upload:', '')})`);
      else if (raw.startsWith('insert:')) setError(`${t('sendError')} (${raw.replace('insert:', '')})`);
      else setError(t('sendError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full sm:max-w-md bg-[#171310] rounded-2xl border border-white/10 shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label={t('close')} className="absolute top-4 end-4 bg-white/5 hover:bg-white/10 text-white rounded-full p-1.5 transition">
          <X size={16} />
        </button>

        {done ? (
          <div className="text-center py-6">
            <MessageSquareHeart className="mx-auto text-amber-500 mb-3" size={32} />
            <h3 className="text-lg font-bold mb-1">{t('thankYouForSharing')}</h3>
            <p className="text-stone-400 text-xs">{t('pendingReviewNote')}</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1">{t('shareYourExperience')}</h3>
            <p className="text-stone-400 text-xs mb-4">{t('shareModerationNote')}</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('yourNameOptional')} className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm mb-3 outline-none focus:border-amber-500/50" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder={t('howWasYourTrip')} className="w-full bg-[#0a0908] border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm mb-3 outline-none focus:border-amber-500/50 resize-none" />
            <label className="flex items-center justify-center gap-2 border border-dashed border-white/15 rounded-xl py-2.5 sm:py-3 text-xs text-stone-400 cursor-pointer hover:border-amber-500/40 transition mb-3">
              <ImageIcon size={16} className="text-amber-400" />
              {files.length > 0 ? `${files.length} ${t('photosSelected')}` : t('attachPhotosOptional')}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) setFiles(Array.from(e.target.files)); }} />
            </label>
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button onClick={handleSubmit} disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold py-2.5 rounded-xl text-xs sm:text-sm transition">
              {submitting ? t('sending') : t('sendMyExperience')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#080706]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
        <div className="flex items-center gap-2">
          <LogoMark size={22} className="text-amber-500" />
          <span className="text-base font-black text-white">
            Souf <span className="text-amber-500">Explorer</span>
          </span>
        </div>
        <p className="text-stone-500 text-xs max-w-sm">{t('footerDesc')}</p>
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link href="/" className="text-stone-400 hover:text-amber-400 transition">{t('home')}</Link>
          <Link href="/map" className="text-stone-400 hover:text-amber-400 transition">{t('map')}</Link>
        </div>
      </div>
    </footer>
  );
}
