'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Phone, Mail, Clock, Star, ChevronLeft, ChevronRight,
  ArrowRight, Landmark, Tent, Camera, Quote, ImageIcon,
  Sparkles, Heart, Bookmark, Menu, X, Search, Compass,
} from 'lucide-react';

// =====================================================================================
// أيقونات التواصل الاجتماعي (SVG مضمّنة، لا تعتمد على إصدار lucide-react)
// =====================================================================================
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

// =====================================================================================
// الشعار — هوية بصرية مخصّصة لسوف 360: قوس شمس فوق قبّة (عمارة "الڨطاية" التقليدية
// المميزة لولاية الوادي) وموجة كثيب رملي أسفلها، بتدرّج ذهبي/فيروزي.
// =====================================================================================
const BrandLogo = ({ size = 44 }: { size?: number }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]">
      <defs>
        <linearGradient id="souf-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="souf-teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="#050b0d" stroke="url(#souf-gold)" strokeWidth="2" />
      <path d="M16 54 A34 34 0 0 1 84 54" fill="none" stroke="url(#souf-gold)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M8 70 Q26 57 50 70 T92 70" fill="none" stroke="url(#souf-teal)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M36 63 Q36 42 50 42 Q64 42 64 63 Z" fill="url(#souf-gold)" />
      <rect x="47" y="35" width="6" height="9" rx="2" fill="url(#souf-gold)" />
      <circle cx="50" cy="30" r="2.6" fill="url(#souf-gold)" />
    </svg>
  </div>
);

// خط قباب متكرر (زخرفة توقيعية) يُستخدم كفاصل بين الأقسام بدل الفواصل الخطية التقليدية
const DomeDivider = ({ className = '', tone = '#0b1619' }: { className?: string; tone?: string }) => (
  <div className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`} aria-hidden="true">
    <svg viewBox="0 0 240 22" preserveAspectRatio="none" className="w-full h-4 sm:h-6" style={{ color: tone }}>
      <path d="M0 22 L0 15 Q10 3 20 15 Q30 3 40 15 Q50 3 60 15 Q70 3 80 15 Q90 3 100 15 Q110 3 120 15 Q130 3 140 15 Q150 3 160 15 Q170 3 180 15 Q190 3 200 15 Q210 3 220 15 Q230 3 240 15 L240 22 Z" fill="currentColor" />
    </svg>
  </div>
);

// =====================================================================================
// Types
// =====================================================================================
type Place = {
  id: string | number; name: string; category?: string; description?: string;
  cover_url?: any; image_url?: any; gallery?: any; lat?: number; lng?: number;
};
type OldMemory = { id: string | number; image_url: any; caption?: string; year?: string | number; };
type Testimonial = { id: string | number; name?: string; message: string; photos?: any; created_at?: string; };
type Lang = 'ar' | 'fr' | 'en';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const HERO_IMG = 'https://images.unsplash.com/photo-1628491097588-638300689372?q=80&w=2000&auto=format&fit=crop';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1542601098-8fc114e148e2?q=80&w=800&auto=format&fit=crop';

// =====================================================================================
// دوال تحليل الصور القادمة من قاعدة البيانات (Supabase Storage) — بدون تغيير في المنطق
// =====================================================================================
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

const TRADITION_IMAGES = [
  'https://images.unsplash.com/photo-1596742572435-08146c52bbec?q=80&w=500',
  'https://images.unsplash.com/photo-1611085583191-a3b1a60d6c96?q=80&w=500',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=500',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500',
  'https://images.unsplash.com/photo-1590424600373-1f196666142c?q=80&w=500',
];

const STARS = [1, 2, 3, 4, 5];

const MEMORY_AVATARS = [
  'https://i.pravatar.cc/150?img=47',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=33',
  'https://i.pravatar.cc/150?img=44',
];
const TESTIMONIAL_AVATARS = [
  'https://i.pravatar.cc/150?img=14',
  'https://i.pravatar.cc/150?img=45',
  'https://i.pravatar.cc/150?img=15',
  'https://i.pravatar.cc/150?img=48',
];

// =====================================================================================
// الترجمات
// =====================================================================================
const translations: Record<Lang, any> = {
  ar: {
    dir: 'rtl',
    nav: { contact: 'اتصل بنا', about: 'المعالم', home: 'الرئيسية', tagline: 'منصة سياحية ذكية لولاية الوادي', menu: 'القائمة' },
    search: { placeholder: 'ابحث عن معلم، واحة أو منطقة...', btn: 'بحث' },
    hero: {
      eyebrow: 'مدينة الألف قبة',
      title: 'اكتشف سحر ولاية الوادي',
      subtitle: 'حيث تلتقي الطبيعة الخلابة بالتراث العريق',
      paragraph: 'ولاية الوادي، جوهرة الجنوب الجزائري، تزخر بمناظر طبيعية خلابة كالكثبان الرملية والواحات الخضراء، وتتميز بتاريخ عريق وثقافة أصيلة تجعلها وجهة سياحية فريدة من نوعها.',
      cta1: 'استكشف المعالم', cta2: 'شاهد الخريطة',
    },
    stats: { places: 'معلم سياحي', memories: 'ذكرى أرشيفية', testimonials: 'رأي زائر' },
    services: [
      { title: 'طبيعة خلابة', desc: 'كثبان رملية ذهبية وواحات خضراء ساحرة' },
      { title: 'تراث عريق', desc: 'معالم تاريخية عريقة وقصور صحراوية' },
      { title: 'ثقافة أصيلة', desc: 'عادات وتقاليد متوارثة وحرف يدوية فريدة' },
      { title: 'ضيافة سخية', desc: 'شعب كريم يرحب بزواره من كل مكان' },
      { title: 'تجارب مميزة', desc: 'مغامرات صحراوية وتجارب لا تنسى' },
    ],
    landmarks: {
      label: 'الوجهات', title: 'معالم ولاية الوادي', desc: 'أروع الوجهات السياحية والتاريخية في ولاية الوادي',
      showAll: 'عرض الكل', hideAll: 'إخفاء المعالم', empty: 'لا توجد معالم مضافة في قاعدة البيانات حالياً.',
      defaultCategory: 'معلم تاريخي', address: 'العنوان', defaultCity: 'مدينة الوادي',
      phone: 'الهاتف', notAvailable: 'غير متوفر', email: 'البريد الإلكتروني',
      hours: 'ساعات العمل', hoursValue: 'حسب الإدارة المحلية',
      mapBtn: 'موقع المعلم على الخريطة', directionsBtn: 'الاتجاهات (مسار)', gallery: 'معرض الصور',
      defaultDesc: 'لا يوجد وصف متاح لهذا المعلم في قاعدة البيانات حالياً.',
      viewDetails: 'عرض التفاصيل', defaultPlaceCategory: 'سياحة', featured: 'الأكثر زيارة',
    },
    traditions: {
      title: 'عادات وتقاليد ولاية الوادي', showAll: 'عرض الكل',
      items: [
        { title: 'الزي التقليدي الصحراوي', desc: 'زي أصيل يعكس هوية المنطقة وتراثها العريق' },
        { title: 'صناعة الحلي الفضية', desc: 'حرفة تقليدية متوارثة في صناعة الحلي الفضية' },
        { title: 'مهرجان الوادي السياحي', desc: 'احتفال سنوي يعكس الثقافة والتراث المحلي' },
        { title: 'الأطباق التقليدية', desc: 'أطباق شهية تعبر عن المذاق الأصيل للمنطقة' },
        { title: 'فن الحناء', desc: 'زينة تقليدية ذات رموز ومعاني جميلة' },
      ],
    },
    memories: {
      title: 'ذكرى في ولاية الوادي', desc: 'لمحات من الأرشيف تحكي وجه الوادي عبر الزمن', showAll: 'عرض الكل',
      empty: 'لم تُضف صور أرشيفية في قاعدة البيانات بعد.',
      archiveMemory: 'ذكرى من الأرشيف', defaultCaption: 'لحظة من ذاكرة ولاية الوادي',
      samples: [
        { name: 'سارة م.', location: 'الجزائر', quote: 'تجربة لا تُنسى، جمال الطبيعة وحسن الضيافة جعلا رحلتي مميزة جدا', stars: 5 },
        { name: 'أحمد ك.', location: 'تونس', quote: 'اكتشفت أماكن رائعة وتعرفت على ثقافة جميلة تستحق الزيارة', stars: 5 },
        { name: 'محمد ب.', location: 'ليبيا', quote: 'الوادي جوهرة الجنوب الجزائري، أنصح الجميع بزيارتها', stars: 5 },
        { name: 'خديجة ل.', location: 'المغرب', quote: 'التراث والتاريخ والطبيعة في مكان واحد، تجربة رائعة', stars: 5 },
      ],
    },
    testimonials: {
      title: 'آراء واقتراحات الزوار', desc: 'ما يقوله الزوار عن زيارتهم لولاية الوادي', writeBtn: 'أكتب رأيك',
      empty: 'لا توجد تجارب منشورة في قاعدة البيانات بعد. كن أول المشاركين!', anonymous: 'زائر مجهول',
      samples: [
        { name: 'خالد ر.', location: 'الجزائر', quote: 'موقع رائع ومعلومات مفيدة. أتمنى إضافة المزيد من المعالم السياحية', stars: 4, date: '2024-07-20' },
        { name: 'ليلى ع.', location: 'تونس', quote: 'تجربة ممتازة، الموقع سهل الاستخدام والخرائط دقيقة جدا', stars: 5, date: '2024-07-18' },
        { name: 'عمر س.', location: 'ليبيا', quote: 'مقترح: إضافة خاصية الحجز المباشر للفنادق والمنتجعات', stars: 5, date: '2024-07-15' },
        { name: 'فاطمة م.', location: 'الجزائر', quote: 'شكرا على هذا الموقع الرائع، ساعدني كثيرا في التخطيط لرحلتي', stars: 4, date: '2024-07-12' },
      ],
    },
    footer: {
      desc: 'منصة سياحية ذكية لولاية الوادي، اكتشف جمال الوادي ومعالمها السياحية وتراثها العريق من خلال منصة رقمية ذكية.',
      quickLinks: 'روابط سريعة',
      links: ['الرئيسية', 'المعالم السياحية', 'الفعاليات', 'المدونة', 'الأسئلة الشائعة'],
      contactUs: 'تواصل معنا', address: 'مدينة الوادي، الجزائر', hours: 'من 08:00 ص إلى 18:00 م',
      appTitle: 'تطبيق الهاتف', appDesc: 'حمل تطبيق سوف 360 واستكشف المعالم السياحية بسهولة.',
      copyright: 'جميع الحقوق محفوظة', bottomTagline: 'منصة السياحة التفاعلية لولاية الوادي',
    },
  },
  fr: {
    dir: 'ltr',
    nav: { contact: 'Contactez-nous', about: 'Sites', home: 'Accueil', tagline: "Plateforme touristique intelligente d'El Oued", menu: 'Menu' },
    search: { placeholder: 'Rechercher un site, une oasis...', btn: 'Rechercher' },
    hero: {
      eyebrow: 'La ville aux mille coupoles',
      title: "Découvrez la magie de la wilaya d'El Oued",
      subtitle: 'Où la nature magnifique rencontre le patrimoine authentique',
      paragraph: "La wilaya d'El Oued, joyau du sud algérien, regorge de paysages naturels magnifiques tels que les dunes de sable et les oasis verdoyantes, et se distingue par une histoire ancienne et une culture authentique qui en font une destination touristique unique en son genre.",
      cta1: 'Explorer les sites', cta2: 'Voir la carte',
    },
    stats: { places: 'sites touristiques', memories: 'souvenirs archivés', testimonials: "avis de visiteurs" },
    services: [
      { title: 'Nature magnifique', desc: 'Dunes de sable doré et oasis verdoyantes enchanteresses' },
      { title: 'Patrimoine ancestral', desc: 'Sites historiques anciens et palais du désert' },
      { title: 'Culture authentique', desc: 'Coutumes ancestrales et artisanat unique' },
      { title: 'Hospitalité généreuse', desc: 'Un peuple généreux qui accueille ses visiteurs de partout' },
      { title: 'Expériences uniques', desc: 'Aventures désertiques et expériences inoubliables' },
    ],
    landmarks: {
      label: 'Destinations', title: "Sites touristiques d'El Oued", desc: "Les plus belles destinations touristiques et historiques d'El Oued",
      showAll: 'Tout afficher', hideAll: 'Masquer', empty: "Aucun site n'a encore été ajouté à la base de données.",
      defaultCategory: 'Site historique', address: 'Adresse', defaultCity: "Ville d'El Oued",
      phone: 'Téléphone', notAvailable: 'Non disponible', email: 'E-mail',
      hours: "Heures d'ouverture", hoursValue: "Selon l'administration locale",
      mapBtn: 'Localiser sur la carte', directionsBtn: 'Itinéraire', gallery: 'Galerie photos',
      defaultDesc: "Aucune description disponible pour ce site pour le moment.",
      viewDetails: 'Voir les détails', defaultPlaceCategory: 'Tourisme', featured: 'Le plus visité',
    },
    traditions: {
      title: "Coutumes et traditions d'El Oued", showAll: 'Tout afficher',
      items: [
        { title: 'Costume traditionnel du désert', desc: "Un costume authentique reflétant l'identité et le patrimoine de la région" },
        { title: 'Bijouterie en argent', desc: "Un artisanat traditionnel transmis dans la fabrication des bijoux en argent" },
        { title: "Festival touristique d'El Oued", desc: 'Une célébration annuelle reflétant la culture et le patrimoine local' },
        { title: 'Plats traditionnels', desc: 'Des plats savoureux reflétant le goût authentique de la région' },
        { title: 'Art du henné', desc: 'Une parure traditionnelle aux symboles et significations magnifiques' },
      ],
    },
    memories: {
      title: "Souvenirs d'El Oued", desc: "Des aperçus des archives racontant l'histoire d'El Oued à travers le temps", showAll: 'Tout afficher',
      empty: "Aucune photo d'archive n'a encore été ajoutée à la base de données.",
      archiveMemory: "Souvenir d'archive", defaultCaption: "Un moment de la mémoire d'El Oued",
      samples: [
        { name: 'Sara M.', location: 'Algérie', quote: "Une expérience inoubliable, la beauté de la nature et l'hospitalité ont rendu mon voyage exceptionnel", stars: 5 },
        { name: 'Ahmed K.', location: 'Tunisie', quote: "J'ai découvert des lieux magnifiques et une culture qui mérite vraiment le détour", stars: 5 },
        { name: 'Mohamed B.', location: 'Libye', quote: "El Oued est le joyau du sud algérien, je recommande à tout le monde de le visiter", stars: 5 },
        { name: 'Khadija L.', location: 'Maroc', quote: 'Patrimoine, histoire et nature réunis en un seul endroit, une expérience formidable', stars: 5 },
      ],
    },
    testimonials: {
      title: 'Avis et suggestions des visiteurs', desc: "Ce que disent les visiteurs de leur visite à El Oued", writeBtn: 'Donnez votre avis',
      empty: "Aucun avis publié dans la base de données pour le moment. Soyez le premier à participer !", anonymous: 'Visiteur anonyme',
      samples: [
        { name: 'Khaled R.', location: 'Algérie', quote: "Un site formidable et des informations utiles. J'aimerais voir plus de sites touristiques ajoutés", stars: 4, date: '2024-07-20' },
        { name: 'Leila A.', location: 'Tunisie', quote: 'Excellente expérience, le site est facile à utiliser et les cartes sont très précises', stars: 5, date: '2024-07-18' },
        { name: 'Omar S.', location: 'Libye', quote: "Suggestion : ajouter une option de réservation directe pour les hôtels et complexes touristiques", stars: 5, date: '2024-07-15' },
        { name: 'Fatima M.', location: 'Algérie', quote: "Merci pour ce site formidable, il m'a beaucoup aidée à planifier mon voyage", stars: 4, date: '2024-07-12' },
      ],
    },
    footer: {
      desc: "Plateforme touristique intelligente d'El Oued, découvrez la beauté d'El Oued, ses sites touristiques et son patrimoine ancestral à travers une plateforme numérique intelligente.",
      quickLinks: 'Liens rapides',
      links: ['Accueil', 'Sites touristiques', 'Événements', 'Blog', 'Foire aux questions'],
      contactUs: 'Contactez-nous', address: "Ville d'El Oued, Algérie", hours: 'De 08h00 à 18h00',
      appTitle: 'Application mobile', appDesc: "Téléchargez l'application Souf 360 et explorez facilement les sites touristiques.",
      copyright: 'Tous droits réservés', bottomTagline: "Plateforme touristique interactive de la wilaya d'El Oued",
    },
  },
  en: {
    dir: 'ltr',
    nav: { contact: 'Contact Us', about: 'Landmarks', home: 'Home', tagline: 'Smart tourism platform for El Oued Province', menu: 'Menu' },
    search: { placeholder: 'Search a landmark, an oasis...', btn: 'Search' },
    hero: {
      eyebrow: 'The City of a Thousand Domes',
      title: 'Discover the Magic of El Oued Province',
      subtitle: 'Where stunning nature meets rich heritage',
      paragraph: 'El Oued Province, the jewel of southern Algeria, is rich with breathtaking landscapes such as golden sand dunes and green oases, and stands out with an ancient history and authentic culture that make it a truly unique tourist destination.',
      cta1: 'Explore Landmarks', cta2: 'View Map',
    },
    stats: { places: 'tourist sites', memories: 'archived memories', testimonials: 'visitor reviews' },
    services: [
      { title: 'Stunning Nature', desc: 'Golden sand dunes and enchanting green oases' },
      { title: 'Ancient Heritage', desc: 'Ancient historical landmarks and desert palaces' },
      { title: 'Authentic Culture', desc: 'Inherited customs and unique handicrafts' },
      { title: 'Generous Hospitality', desc: 'A generous people welcoming visitors from everywhere' },
      { title: 'Unique Experiences', desc: 'Desert adventures and unforgettable experiences' },
    ],
    landmarks: {
      label: 'Destinations', title: 'Landmarks of El Oued', desc: 'The finest tourist and historical destinations in El Oued',
      showAll: 'Show All', hideAll: 'Hide Landmarks', empty: 'No landmarks have been added to the database yet.',
      defaultCategory: 'Historical Site', address: 'Address', defaultCity: 'El Oued City',
      phone: 'Phone', notAvailable: 'Not available', email: 'Email',
      hours: 'Working Hours', hoursValue: 'As per local administration',
      mapBtn: 'Locate on Map', directionsBtn: 'Directions', gallery: 'Photo Gallery',
      defaultDesc: 'No description is available for this landmark yet.',
      viewDetails: 'View Details', defaultPlaceCategory: 'Tourism', featured: 'Most Visited',
    },
    traditions: {
      title: 'Customs and Traditions of El Oued', showAll: 'Show All',
      items: [
        { title: 'Traditional Desert Attire', desc: "An authentic outfit reflecting the region's identity and heritage" },
        { title: 'Silver Jewelry Making', desc: 'A traditional craft passed down in silver jewelry making' },
        { title: 'El Oued Tourism Festival', desc: 'An annual celebration reflecting local culture and heritage' },
        { title: 'Traditional Dishes', desc: "Delicious dishes reflecting the region's authentic flavor" },
        { title: 'Henna Art', desc: 'A traditional adornment with beautiful symbols and meanings' },
      ],
    },
    memories: {
      title: 'Memories of El Oued', desc: "Glimpses from the archive telling El Oued's story through time", showAll: 'Show All',
      empty: 'No archival photos have been added to the database yet.',
      archiveMemory: 'Archive Memory', defaultCaption: "A moment from El Oued's memory",
      samples: [
        { name: 'Sara M.', location: 'Algeria', quote: 'An unforgettable experience, the beauty of nature and warm hospitality made my trip truly special', stars: 5 },
        { name: 'Ahmed K.', location: 'Tunisia', quote: 'I discovered amazing places and learned about a culture that truly deserves a visit', stars: 5 },
        { name: 'Mohamed B.', location: 'Libya', quote: 'El Oued is the jewel of southern Algeria, I recommend everyone visit it', stars: 5 },
        { name: 'Khadija L.', location: 'Morocco', quote: 'Heritage, history and nature all in one place, a wonderful experience', stars: 5 },
      ],
    },
    testimonials: {
      title: 'Visitor Reviews & Suggestions', desc: 'What visitors say about their visit to El Oued', writeBtn: 'Write a Review',
      empty: 'No reviews have been published in the database yet. Be the first to share!', anonymous: 'Anonymous Visitor',
      samples: [
        { name: 'Khaled R.', location: 'Algeria', quote: 'A great site with useful information. I would love to see more tourist landmarks added', stars: 4, date: '2024-07-20' },
        { name: 'Leila A.', location: 'Tunisia', quote: 'Excellent experience, the site is easy to use and the maps are very accurate', stars: 5, date: '2024-07-18' },
        { name: 'Omar S.', location: 'Libya', quote: 'Suggestion: add a direct booking feature for hotels and resorts', stars: 5, date: '2024-07-15' },
        { name: 'Fatima M.', location: 'Algeria', quote: 'Thanks for this great site, it helped me a lot in planning my trip', stars: 4, date: '2024-07-12' },
      ],
    },
    footer: {
      desc: 'Smart tourism platform for El Oued Province, discover the beauty of El Oued, its tourist landmarks and ancient heritage through a smart digital platform.',
      quickLinks: 'Quick Links',
      links: ['Home', 'Tourist Landmarks', 'Events', 'Blog', 'FAQ'],
      contactUs: 'Contact Us', address: 'El Oued City, Algeria', hours: 'From 8:00 AM to 6:00 PM',
      appTitle: 'Mobile App', appDesc: 'Download the Souf 360 app and explore tourist landmarks with ease.',
      copyright: 'All rights reserved', bottomTagline: 'Interactive tourism platform of El Oued Province',
    },
  },
};

// =====================================================================================
// المكوّن الرئيسي
// =====================================================================================
export default function ExploreClient({ places = [], oldMemories = [], testimonials = [] }: { places?: Place[], oldMemories?: OldMemory[], testimonials?: Testimonial[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [lang, setLang] = useState<Lang>('ar');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const memoriesTrackRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];
  const dir = t.dir;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // إغلاق قائمة الجوال تلقائياً عند تغيير حجم الشاشة إلى سطح مكتب
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollMemories = (side: 'start' | 'end') => {
    const el = memoriesTrackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    const sign = dir === 'rtl' ? (side === 'start' ? 1 : -1) : (side === 'start' ? -1 : 1);
    el.scrollBy({ left: amount * sign, behavior: 'smooth' });
  };

  const featuredPlace = places.length > 0 ? places[0] : null;
  const featuredImages = featuredPlace ? getPlaceImages(featuredPlace) : [];
  const totalImages = featuredImages.length;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [featuredPlace?.id]);

  const safeActiveIndex = totalImages > 0 ? activeImageIndex % totalImages : 0;
  const coverImg = featuredImages[safeActiveIndex] || FALLBACK_IMG;
  const thumbOrder = Array.from({ length: totalImages }, (_, i) => (safeActiveIndex + 1 + i) % totalImages)
    .filter((i) => i !== safeActiveIndex);
  const thumbs = thumbOrder.slice(0, 3).map((i) => ({ img: featuredImages[i], index: i }));
  const remainingImgs = Math.max(thumbOrder.length - 3, 0);

  const goToImage = (index: number) => {
    if (totalImages === 0) return;
    setActiveImageIndex(((index % totalImages) + totalImages) % totalImages);
  };
  const nextImage = () => goToImage(safeActiveIndex + 1);
  const prevImage = () => goToImage(safeActiveIndex - 1);
  const localeMap: Record<Lang, string> = { ar: 'ar-DZ', fr: 'fr-FR', en: 'en-US' };

  const LANGS: { code: Lang; label: string; tag: string; tagBg: string }[] = [
    { code: 'fr', label: 'Français', tag: 'FR', tagBg: 'bg-blue-600' },
    { code: 'en', label: 'English', tag: 'EN', tagBg: 'bg-red-700' },
    { code: 'ar', label: 'العربية', tag: 'DZ', tagBg: 'bg-emerald-700' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/map?destination=${encodeURIComponent(q)}` : '/map');
  };

  const NAV_ITEMS = [
    { href: '#top', label: t.nav.home },
    { href: '#landmarks', label: t.nav.about },
    { href: '#footer', label: t.nav.contact },
  ];

  return (
    <div id="top" className="min-h-screen bg-[#070d10] text-white font-sans selection:bg-amber-500/30 overflow-x-hidden" dir={dir}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap');
        * { font-family: 'Tajawal', sans-serif; }
        .font-display { font-family: 'Cairo', 'Tajawal', sans-serif; }
        .memories-track::-webkit-scrollbar { display: none; }
        .memories-track { scrollbar-width: none; -ms-overflow-style: none; }
        .container { width: 100%; max-width: 1280px; margin-left: auto; margin-right: auto; }
        html { scroll-behavior: smooth; }
        @keyframes driftSlow { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .drift-bg { animation: driftSlow 60s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .drift-bg { animation: none; } }
      `}</style>

      {/* ============================= القائمة العلوية ============================= */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-[#050b0d]/95 backdrop-blur-md shadow-lg border-b border-white/5' : 'bg-gradient-to-b from-black/70 to-transparent'}`}>
        {/* شريط اللغات */}
        <div className={`container mx-auto px-4 sm:px-6 flex items-center justify-between overflow-hidden transition-all duration-500 ${isScrolled ? 'h-0 opacity-0' : 'h-9 opacity-100'}`}>
          <div className="flex items-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] font-bold text-gray-200 leading-none">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                className={`flex items-center gap-1.5 transition-colors leading-none ${lang === l.code ? 'text-amber-400' : 'hover:text-amber-400'}`}
              >
                <span className={`w-4 h-3 rounded-[2px] ${l.tagBg} text-white text-[7px] flex items-center justify-center leading-none shrink-0`}>{l.tag}</span> {l.label}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2.5 text-gray-400">
            <a href="#" aria-label="Facebook" className="hover:text-amber-400 transition-colors"><FacebookIcon size={13} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-amber-400 transition-colors"><InstagramIcon size={13} /></a>
            <a href="#" aria-label="YouTube" className="hover:text-amber-400 transition-colors"><YoutubeIcon size={13} /></a>
          </div>
        </div>

        {/* الشريط الرئيسي */}
        <div className={`container mx-auto px-4 sm:px-6 flex justify-between items-center ${isScrolled ? 'py-2.5' : 'py-3.5'}`}>
          <div className="flex items-center gap-3">
            <BrandLogo size={isScrolled ? 40 : 46} />
            <div>
              <h1 className="text-lg sm:text-xl font-display font-black tracking-tight leading-none">سوف <span className="text-amber-500">360</span></h1>
              <p className="text-[9px] text-gray-400 font-medium mt-0.5 hidden sm:block">{t.nav.tagline}</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-9 text-sm font-bold text-gray-200">
            {NAV_ITEMS.map((item, i) => (
              <a key={i} href={item.href} className={i === 0 ? 'text-amber-500 border-b-2 border-amber-500 pb-1' : 'hover:text-amber-400 transition-colors'}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/map')}
              className="hidden sm:flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
            >
              <Compass size={15} /> {t.hero.cta2}
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
              aria-label={t.nav.menu}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* قائمة الجوال المنسدلة */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} h-full w-[80%] max-w-xs bg-[#0b1619] border-white/5 ${dir === 'rtl' ? 'border-l' : 'border-r'} p-6 flex flex-col transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={36} />
              <h2 className="text-base font-display font-black">سوف <span className="text-amber-500">360</span></h2>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center"><X size={18} /></button>
          </div>
          <div className="flex flex-col gap-1 text-sm font-bold text-gray-200">
            {NAV_ITEMS.map((item, i) => (
              <a key={i} href={item.href} onClick={() => setIsMenuOpen(false)} className="py-3 px-3 rounded-xl hover:bg-white/5 hover:text-amber-400 transition-colors">
                {item.label}
              </a>
            ))}
          </div>
          <button
            onClick={() => { setIsMenuOpen(false); router.push('/map'); }}
            className="mt-6 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            <Compass size={16} /> {t.hero.cta2}
          </button>
          <div className="mt-auto flex items-center gap-4 justify-center text-gray-400 pt-6 border-t border-white/5">
            <a href="#" aria-label="Facebook" className="hover:text-amber-400"><FacebookIcon size={16} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-amber-400"><InstagramIcon size={16} /></a>
            <a href="#" aria-label="YouTube" className="hover:text-amber-400"><YoutubeIcon size={16} /></a>
            <a href="#" aria-label="X" className="hover:text-amber-400"><XIcon size={16} /></a>
          </div>
        </div>
      </div>

      {/* ============================= الهيرو ============================= */}
      <section className="relative flex flex-col justify-center items-center pt-28 pb-14 sm:pt-36 sm:pb-16 min-h-[620px] sm:min-h-[680px] md:min-h-[760px]">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMG} alt="غروب الشمس في الوادي" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070d10]/75 via-[#070d10]/50 to-[#070d10]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d10] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col items-center text-center max-w-4xl">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 text-amber-300 text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-full mb-5">
            <Sparkles size={13} /> {t.hero.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black mb-4 drop-shadow-2xl text-white leading-tight">{t.hero.title}</h2>
          <h3 className="text-base sm:text-xl md:text-2xl text-amber-400 font-bold mb-7">{t.hero.subtitle}</h3>

          <div className="bg-black/25 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-5 sm:px-10 sm:py-6 mb-8">
            <p className="text-gray-200 max-w-2xl text-sm md:text-base leading-loose">
              {t.hero.paragraph}
            </p>
          </div>

          {/* شريط بحث سريع يوجّه إلى صفحة الخريطة */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-xl flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 mb-8 shadow-2xl">
            <Search size={18} className="text-gray-300 shrink-0 mx-2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search.placeholder}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-400 min-w-0"
            />
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-xl transition-colors shrink-0">
              {t.search.btn}
            </button>
          </form>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => document.getElementById('landmarks')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 px-7 rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-sm flex items-center gap-2"
            >
              {t.hero.cta1} <ArrowRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          </div>

          {/* إحصائيات حقيقية من قاعدة البيانات */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-10 w-full max-w-lg">
            {[
              { value: places.length, label: t.stats.places },
              { value: oldMemories.length, label: t.stats.memories },
              { value: testimonials.length, label: t.stats.testimonials },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl py-4 px-2">
                <p className="text-2xl sm:text-3xl font-display font-black text-amber-400">{s.value}+</p>
                <p className="text-[10px] sm:text-[11px] text-gray-300 font-bold mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= بطاقات الخدمات ============================= */}
      <section className="relative z-20 bg-[#070d10] px-4 sm:px-6 -mt-8 sm:-mt-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[Tent, Landmark, Sparkles, Heart, Camera].map((Icon, i) => {
              const srv = t.services[i];
              const active = i === 0;
              return (
                <div key={i} className={`bg-[#0b1619]/90 backdrop-blur-xl border rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer ${active ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-white/10'} ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 border ${active ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white mb-2">{srv.title}</h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{srv.desc}</p>
                  {active && <div className="mt-4 w-8 h-1 bg-amber-500 rounded-full" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================= المعالم (ديناميكي) ============================= */}
      <section className="pt-16 pb-20 relative z-10 bg-[#070d10]" id="landmarks">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <MapPin size={22} />
                <span className="text-xs font-bold uppercase tracking-wider">{t.landmarks.label}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">{t.landmarks.title}</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-lg">{t.landmarks.desc}</p>
            </div>
            {places.length > 1 && (
              <button
                onClick={() => setShowAllPlaces(!showAllPlaces)}
                className="px-6 py-2.5 rounded-full border border-white/20 text-xs font-bold hover:bg-white/10 hover:border-amber-500/40 transition-colors hidden sm:flex items-center gap-2 shrink-0"
              >
                {showAllPlaces ? t.landmarks.hideAll : t.landmarks.showAll} <ChevronLeft size={16} className={dir === 'ltr' ? 'rotate-180' : ''} />
              </button>
            )}
          </div>

          {!featuredPlace ? (
            <div className="text-center py-20 bg-[#0b1619] rounded-[3rem] border border-white/5">
              <Landmark size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-bold">{t.landmarks.empty}</p>
            </div>
          ) : (
            <div className="bg-[#0b1619] rounded-[2rem] sm:rounded-[3rem] border border-white/5 p-4 sm:p-6 flex flex-col lg:flex-row gap-8 shadow-2xl relative overflow-hidden mb-8">
              <div className="lg:w-1/2 flex flex-col justify-center px-2 py-4 lg:py-8 order-2 lg:order-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Landmark size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">{featuredPlace.category || t.landmarks.defaultCategory}</span>
                  </div>
                  <button className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-500 hover:border-amber-500/30 transition-colors">
                    <Heart size={18} />
                  </button>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full mb-3 border border-amber-500/20">
                  <Star size={11} fill="currentColor" /> {t.landmarks.featured}
                </span>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black mb-3 text-white">{featuredPlace.name}</h3>

                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  <span className="font-bold text-xl ml-2">4.8</span>
                  {STARS.map((s) => <Star key={s} size={16} fill="currentColor" />)}
                </div>

                <p className="text-gray-300 leading-relaxed mb-8 text-sm sm:text-base line-clamp-4">
                  {featuredPlace.description || t.landmarks.defaultDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <MapPin className="text-amber-500" size={24} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold mb-1">{t.landmarks.address}</p>
                      <p className="text-xs font-bold text-white">
                        {featuredPlace.lat && featuredPlace.lng ? `${featuredPlace.lat.toFixed(4)}, ${featuredPlace.lng.toFixed(4)}` : t.landmarks.defaultCity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="text-amber-500" size={24} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold mb-1">{t.landmarks.phone}</p>
                      <p className="text-xs font-bold text-gray-400" dir="ltr">{t.landmarks.notAvailable}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="text-amber-500" size={24} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold mb-1">{t.landmarks.email}</p>
                      <p className="text-xs font-bold text-gray-400">{t.landmarks.notAvailable}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock className="text-amber-500" size={24} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold mb-1">{t.landmarks.hours}</p>
                      <p className="text-xs font-bold text-gray-400">{t.landmarks.hoursValue}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <button
                    onClick={() => router.push(`/map?destination=${featuredPlace.name}`)}
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-sm"
                  >
                    {t.landmarks.mapBtn}
                  </button>
                  <button
                    onClick={() => router.push(`/map?destination=${featuredPlace.name}&autoRoute=true`)}
                    className="flex-1 bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} /> {t.landmarks.directionsBtn}
                  </button>
                </div>
              </div>

              <div className="lg:w-1/2 relative rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden min-h-[260px] sm:min-h-[340px] lg:min-h-[420px] order-1 lg:order-2 group">
                <img src={coverImg} alt={featuredPlace.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070d10]/90 via-transparent to-transparent" />

                <button className="absolute top-6 left-6 w-10 h-10 bg-black/40 backdrop-blur rounded-xl border border-white/10 flex items-center justify-center text-white hover:text-amber-400 transition-colors">
                  <Bookmark size={16} />
                </button>

                <div className="absolute top-6 right-6 bg-black/40 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1">
                  <ImageIcon size={14} /> {t.landmarks.gallery}
                </div>

                {thumbs.length > 0 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 w-[92%] justify-center">
                    <button
                      type="button"
                      onClick={prevImage}
                      className="w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:border-amber-500 transition-colors shrink-0"
                    >
                      <ChevronRight size={16} />
                    </button>
                    {thumbs.map((thumb) => (
                      <button
                        type="button"
                        key={thumb.index}
                        onClick={() => goToImage(thumb.index)}
                        className="w-16 h-16 rounded-xl border-2 border-white/20 overflow-hidden cursor-pointer hover:border-amber-500 transition-colors shrink-0"
                      >
                        <img src={thumb.img} alt="Thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {remainingImgs > 0 && (
                      <button
                        type="button"
                        onClick={nextImage}
                        className="w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:border-amber-500 transition-colors shrink-0 text-[10px] font-bold"
                      >
                        +{remainingImgs}
                      </button>
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
                  <div key={place.id} className="bg-[#0b1619] rounded-3xl border border-white/5 overflow-hidden group hover:border-amber-500/30 hover:-translate-y-1 transition-all shadow-lg">
                    <div className="relative h-48">
                      <img src={pImgs[0]} alt={place.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1619] to-transparent" />
                      <span className="absolute top-4 right-4 bg-black/50 backdrop-blur text-amber-400 text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
                        {place.category || t.landmarks.defaultPlaceCategory}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-display font-bold text-white mb-2">{place.name}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-4">{place.description}</p>
                      <button onClick={() => router.push(`/map?destination=${place.name}`)} className="w-full bg-white/5 hover:bg-amber-500 hover:text-black text-white text-sm font-bold py-2.5 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2">
                        {t.landmarks.viewDetails} <ChevronLeft size={16} className={dir === 'ltr' ? 'rotate-180' : ''} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <DomeDivider tone="#0b1619" />

      {/* ============================= عادات وتقاليد (ثابت) ============================= */}
      <section className="py-14 sm:py-20 bg-[#0b1619]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-10">
            <div className="flex items-center gap-2 text-amber-500">
              <Tent size={22} />
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">{t.traditions.title}</h2>
            </div>
            <button className="px-6 py-2.5 rounded-full border border-white/20 text-xs font-bold hover:bg-white/10 hover:border-amber-500/40 transition-colors hidden sm:block">
              {t.traditions.showAll}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {t.traditions.items.map((trad: { title: string; desc: string }, idx: number) => (
              <div key={idx} className="relative rounded-3xl overflow-hidden aspect-[3/4] group cursor-pointer border border-white/10">
                <img src={TRADITION_IMAGES[idx]} alt={trad.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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

      {/* ============================= ذكرى في ولاية الوادي (ديناميكي - كاروسيل) ============================= */}
      <section className="py-14 sm:py-20 bg-[#070d10]" id="memories">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center gap-2 text-teal-500 mb-2">
                <Camera size={22} />
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white">{t.memories.title}</h2>
              </div>
              <p className="text-gray-400 text-sm mt-2">{t.memories.desc}</p>
            </div>
            <button className="px-6 py-2.5 rounded-full border border-white/20 text-xs font-bold hover:bg-white/10 hover:border-teal-500/40 transition-colors hidden sm:block">
              {t.memories.showAll}
            </button>
          </div>

          {oldMemories.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.memories.samples.map((s: { name: string; location: string; quote: string; stars: number }, i: number) => (
                <div key={i} className="bg-[#f6ead9] text-[#2a1c10] rounded-3xl p-5 border border-black/5 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 shrink-0">
                      <img src={MEMORY_AVATARS[i % MEMORY_AVATARS.length]} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2a1c10]">{s.name}</p>
                      <p className="text-[10px] font-bold text-[#2a1c10]/60">{s.location}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-4 flex-1">&quot;{s.quote}&quot;</p>
                  <div className="flex gap-1 text-amber-500">
                    {STARS.slice(0, s.stars).map((st) => <Star key={st} size={13} fill="currentColor" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => scrollMemories('end')}
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0b1619] border border-white/10 items-center justify-center hover:border-amber-500 hover:text-amber-400 transition-colors shadow-lg"
              >
                <ChevronRight size={18} />
              </button>
              <div ref={memoriesTrackRef} className="memories-track flex gap-5 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory">
                {oldMemories.map((m) => {
                  const mImgs = parseImages(m.image_url);
                  const imgSrc = mImgs[0] || FALLBACK_IMG;
                  return (
                    <div key={m.id} className="snap-start shrink-0 w-64 bg-[#f6ead9] text-[#2a1c10] rounded-3xl p-5 border border-black/5 shadow-xl flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 shrink-0">
                          <img src={imgSrc} alt={m.caption || t.memories.archiveMemory} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          {m.year && <p className="text-[10px] font-bold text-amber-700">{m.year}</p>}
                          <p className="text-xs font-bold text-[#2a1c10]/70">{t.memories.archiveMemory}</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4 flex-1">
                        &quot;{m.caption || t.memories.defaultCaption}&quot;
                      </p>
                      <div className="flex gap-1 text-amber-500">
                        {STARS.map((s) => <Star key={s} size={13} fill="currentColor" />)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => scrollMemories('start')}
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0b1619] border border-white/10 items-center justify-center hover:border-amber-500 hover:text-amber-400 transition-colors shadow-lg"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================= آراء الزوار (ديناميكي) ============================= */}
      <section className="py-14 sm:py-20 bg-[#070d10]" id="testimonials">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <div className="flex items-center gap-2 text-amber-500">
              <Quote size={22} />
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white">{t.testimonials.title}</h2>
                <p className="text-gray-400 text-xs mt-1">{t.testimonials.desc}</p>
              </div>
            </div>
            <button className="bg-amber-500 text-black font-bold py-2.5 px-6 rounded-xl text-xs hover:bg-amber-400 transition-colors shadow-lg shrink-0">
              {t.testimonials.writeBtn}
            </button>
          </div>

          {testimonials.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.testimonials.samples.map((s: { name: string; location: string; quote: string; stars: number; date: string }, i: number) => (
                <div key={i} className="bg-[#f6ead9] text-[#2a1c10] rounded-3xl p-6 border border-black/5 shadow-xl relative flex flex-col justify-between">
                  <div>
                    <div className="flex gap-3 items-center mb-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/30 shrink-0">
                        <img src={TESTIMONIAL_AVATARS[i % TESTIMONIAL_AVATARS.length]} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#2a1c10]">{s.name}</h4>
                        <p className="text-[10px] font-bold text-[#2a1c10]/60">{s.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 text-amber-500 mb-4">
                      {STARS.slice(0, s.stars).map((st) => <Star key={st} size={12} fill="currentColor" />)}
                    </div>
                    <p className="text-xs text-[#2a1c10]/80 leading-relaxed mb-4">&quot;{s.quote}&quot;</p>
                  </div>
                  <span className="text-[10px] text-[#2a1c10]/50 block mt-auto border-t border-black/10 pt-3">{s.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((tItem) => (
                <div key={tItem.id} className="bg-[#f6ead9] text-[#2a1c10] rounded-3xl p-6 border border-black/5 shadow-xl relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-700 text-lg">
                          {(tItem.name || t.testimonials.anonymous).charAt(0)}
                        </div>
                        <h4 className="font-bold text-sm text-[#2a1c10]">{tItem.name || t.testimonials.anonymous}</h4>
                      </div>
                    </div>
                    <div className="flex gap-1 text-amber-500 mb-4">
                      {STARS.map((s) => <Star key={s} size={12} fill="currentColor" />)}
                    </div>
                    <p className="text-xs text-[#2a1c10]/80 leading-relaxed mb-4">&quot;{tItem.message}&quot;</p>
                  </div>
                  {tItem.created_at && (
                    <span className="text-[10px] text-[#2a1c10]/50 block mt-auto border-t border-black/10 pt-3">
                      {new Date(tItem.created_at).toLocaleDateString(localeMap[lang])}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================= الفوتر ============================= */}
      <footer id="footer" className="bg-[#050b0d] border-t border-white/5 pt-16 pb-8 mt-10 relative overflow-hidden">
        <DomeDivider tone="#070d10" className="absolute -top-px left-0 right-0 rotate-180" />
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BrandLogo size={42} />
                <h3 className="text-2xl font-display font-black text-white">سوف 360</h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                {t.footer.desc}
              </p>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black transition-colors flex items-center justify-center"><FacebookIcon size={16} /></button>
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black transition-colors flex items-center justify-center"><InstagramIcon size={16} /></button>
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black transition-colors flex items-center justify-center"><YoutubeIcon size={16} /></button>
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black transition-colors flex items-center justify-center"><XIcon size={16} /></button>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">{t.footer.quickLinks}</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                {t.footer.links.map((link: string, i: number) => (
                  <li key={i}><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ChevronLeft size={14} className={dir === 'ltr' ? 'rotate-180' : ''} /> {link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">{t.footer.contactUs}</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-3"><Phone size={16} className="text-amber-500" /> <span dir="ltr">+213 32 12 34 56</span></li>
                <li className="flex items-center gap-3"><Mail size={16} className="text-amber-500" /> info@souf360.dz</li>
                <li className="flex items-center gap-3"><MapPin size={16} className="text-amber-500" /> {t.footer.address}</li>
                <li className="flex items-center gap-3 text-xs"><Clock size={16} className="text-amber-500" /> {t.footer.hours}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">{t.footer.appTitle}</h4>
              <p className="text-xs text-gray-400 mb-4">{t.footer.appDesc}</p>
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
            <p>&copy; {new Date().getFullYear()} سوف 360 - {t.footer.copyright}</p>
            <p className="mt-2 md:mt-0">{t.footer.bottomTagline}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}