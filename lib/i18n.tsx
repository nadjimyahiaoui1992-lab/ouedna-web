'use client';

/**
 * نظام الترجمة الموحّد لمنصة "سوف 360" — يدعم العربية والإنجليزية والفرنسية.
 * كل النصوص الظاهرة في الموقع تمرّ عبر هذا الملف حتى تُترجم تلقائياً بتبديل اللغة،
 * دون الحاجة لإعادة كتابة أي مكوّن عند إضافة لغة جديدة مستقبلاً.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Lang = 'ar' | 'en' | 'fr';

export const LANGUAGES: { code: Lang; label: string; dir: 'rtl' | 'ltr'; flag: string }[] = [
  { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇩🇿' },
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', dir: 'ltr', flag: '🇫🇷' },
];

const STORAGE_KEY = 'souf360_lang';

/* ============================= قاموس الترجمة ============================= */
/* كل مفتاح يحمل النسخ الثلاث. أضف مفتاحاً جديداً هنا فقط وسيظهر مترجماً في كل مكان يستعمله. */
export const dict = {
  // ------- التنقل العام -------
  home: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' },
  map: { ar: 'الخريطة', en: 'Map', fr: 'Carte' },
  events: { ar: 'الفعاليات', en: 'Events', fr: 'Événements' },
  restaurants: { ar: 'المطاعم', en: 'Restaurants', fr: 'Restaurants' },
  hotels: { ar: 'الفنادق', en: 'Hotels', fr: 'Hôtels' },
  landmarks: { ar: 'المعالم', en: 'Landmarks', fr: 'Sites' },
  brandTagline: { ar: 'دليلك الرقمي لاكتشاف مدينة الألف قبة وقبة', en: 'Your digital guide to the City of a Thousand Domes', fr: "Votre guide numérique de la ville aux mille coupoles" },

  // ------- Hero -------
  heroBadge: { ar: 'الجزائر — ولاية الوادي (السوف)', en: 'Algeria — El Oued Province (Souf)', fr: "Algérie — Wilaya d'El Oued (Souf)" },
  heroTitle1: { ar: 'اكتشف المعالم', en: 'Discover the Landmarks', fr: 'Découvrez les sites' },
  heroTitle2: { ar: 'مدينة الألف قبة', en: 'City of a Thousand Domes', fr: 'La ville aux mille coupoles' },
  heroDesc: {
    ar: 'دليلك الكامل لأجمل الوجهات في الوادي: قِباب أصيلة، غيطان نخيل، وكثبان ذهبية — كل معلم موثّق بصوره وموقعه على الخريطة.',
    en: 'Your complete guide to the finest destinations in El Oued: authentic domes, palm oases, and golden dunes — every landmark documented with photos and its location on the map.',
    fr: "Votre guide complet des plus belles destinations d'El Oued : coupoles authentiques, oasis de palmiers et dunes dorées — chaque site documenté avec photos et localisation sur la carte.",
  },
  statLandmarks: { ar: 'معالم موثّقة', en: 'Documented sites', fr: 'Sites documentés' },
  statMemories: { ar: 'ذكريات أرشيفية', en: 'Archive memories', fr: 'Souvenirs d\'archives' },
  statTestimonials: { ar: 'تجارب زوار', en: 'Visitor stories', fr: 'Témoignages' },
  statLive: { ar: 'محدّث باستمرار', en: 'Always updated', fr: 'Toujours à jour' },

  // ------- قسم المعالم -------
  destinationsEyebrow: { ar: 'الوجهات', en: 'Destinations', fr: 'Destinations' },
  discoverLandmarks: { ar: 'اكتشف المعالم', en: 'Discover the landmarks', fr: 'Découvrez les sites' },
  landmarksSubtitle: { ar: 'أروع الوجهات السياحية والتاريخية في ولاية الوادي', en: 'The finest tourist and historic destinations in El Oued', fr: "Les plus belles destinations touristiques et historiques d'El Oued" },
  searchPlaceholder: { ar: 'ابحث عن معلم بالاسم أو الوصف...', en: 'Search a landmark by name or description...', fr: 'Rechercher un site par nom ou description...' },
  categoryAll: { ar: 'الكل', en: 'All', fr: 'Tous' },
  noPlacesYet: { ar: 'لا توجد معالم مضافة حالياً.', en: 'No landmarks added yet.', fr: "Aucun site ajouté pour l'instant." },
  noSearchResults: { ar: 'لا توجد نتائج مطابقة لبحثك.', en: 'No results match your search.', fr: 'Aucun résultat pour votre recherche.' },
  viewDetailsNav: { ar: 'عرض التفاصيل والملاحة', en: 'View details & directions', fr: 'Voir détails & itinéraire' },
  showOnPlatformMap: { ar: 'إظهار على خريطة المنصة', en: 'Show on platform map', fr: 'Afficher sur la carte' },
  addToFavorites: { ar: 'إضافة إلى المفضلة', en: 'Add to favorites', fr: 'Ajouter aux favoris' },
  removeFromFavorites: { ar: 'إزالة من المفضلة', en: 'Remove from favorites', fr: 'Retirer des favoris' },

  // ------- نافذة المعلم -------
  close: { ar: 'إغلاق', en: 'Close', fr: 'Fermer' },
  previousImage: { ar: 'الصورة السابقة', en: 'Previous image', fr: 'Image précédente' },
  nextImage: { ar: 'الصورة التالية', en: 'Next image', fr: 'Image suivante' },
  swipeHint: { ar: 'مرّر يميناً أو يساراً لتصفّح الصور', en: 'Swipe left or right to browse photos', fr: 'Glissez pour parcourir les photos' },
  aboutLandmark: { ar: 'معلومات عن المعلم', en: 'About this landmark', fr: 'À propos de ce site' },
  showOnMap: { ar: 'إظهار على الخريطة', en: 'Show on map', fr: 'Afficher sur la carte' },
  shareLandmark: { ar: 'مشاركة المعلم', en: 'Share landmark', fr: 'Partager le site' },
  linkCopied: { ar: 'تم نسخ الرابط', en: 'Link copied', fr: 'Lien copié' },
  category: { ar: 'الفئة', en: 'Category', fr: 'Catégorie' },
  noDescription: { ar: 'لا يتوفر وصف لهذا المعلم حالياً.', en: 'No description available for this landmark yet.', fr: "Aucune description disponible pour ce site pour l'instant." },

  // ------- الذكريات -------
  archiveEyebrow: { ar: 'الأرشيف', en: 'Archive', fr: 'Archives' },
  oldMemories: { ar: 'ذكريات قديمة', en: 'Old memories', fr: 'Anciens souvenirs' },
  memoriesSubtitle: { ar: 'لمحات من الأرشيف تحكي وجه الوادي عبر الزمن', en: 'Glimpses from the archive telling the story of El Oued through time', fr: "Aperçus d'archives racontant le visage d'El Oued à travers le temps" },
  noMemoriesYet: { ar: 'لم تُضَف صور أرشيفية بعد.', en: 'No archive photos added yet.', fr: "Aucune photo d'archive ajoutée pour l'instant." },

  // ------- تعريف الولاية -------
  wilayaTitle: { ar: 'مدينة الألف قبة والأصالة العريقة', en: 'City of a Thousand Domes & Timeless Heritage', fr: 'La ville aux mille coupoles et au patrimoine ancestral' },
  wilayaDesc: {
    ar: 'تُعد ولاية الوادي (السوف) واحدة من أبرز الوجهات السياحية والثقافية في الجزائر، حيث تدمج بفرادة بين عبق التاريخ، وعمارة القباب التقليدية المميزة، وغيطان النخيل الممتدة، وسحر الكثبان الرملية الذهبية. إنها أرض الكرم والفلاحة الواحاتية.',
    en: 'El Oued Province (Souf) is one of the most prominent tourist and cultural destinations in Algeria, uniquely blending the scent of history, distinctive traditional dome architecture, sprawling palm oases, and the magic of golden sand dunes. It is a land of generosity and oasis agriculture.',
    fr: "La wilaya d'El Oued (Souf) est l'une des destinations touristiques et culturelles les plus marquantes d'Algérie, alliant avec singularité le parfum de l'histoire, une architecture traditionnelle de coupoles distinctive, de vastes oasis de palmiers et la magie des dunes dorées. C'est une terre de générosité et d'agriculture oasienne.",
  },

  // ------- تجارب الزوار -------
  communityEyebrow: { ar: 'المجتمع', en: 'Community', fr: 'Communauté' },
  visitorExperiences: { ar: 'تجارب الزوار', en: 'Visitor experiences', fr: 'Expériences des visiteurs' },
  experiencesSubtitle: { ar: 'قصص وذكريات يشاركها زوار ولاية الوادي', en: 'Stories and memories shared by visitors to El Oued', fr: "Histoires et souvenirs partagés par les visiteurs d'El Oued" },
  shareYourExperience: { ar: 'شارك تجربتك', en: 'Share your experience', fr: 'Partagez votre expérience' },
  beFirstToShare: { ar: 'كن أول من يشارك تجربته في ولاية الوادي!', en: 'Be the first to share your experience in El Oued!', fr: "Soyez le premier à partager votre expérience à El Oued !" },
  visitorFallbackName: { ar: 'زائر', en: 'Visitor', fr: 'Visiteur' },

  // ------- نافذة مشاركة التجربة -------
  shareModerationNote: { ar: 'تُعرض بعد مراجعة المشرفين.', en: 'Shown after moderator review.', fr: 'Publié après validation par un modérateur.' },
  yourNameOptional: { ar: 'اسمك الكريم (اختياري)', en: 'Your name (optional)', fr: 'Votre nom (facultatif)' },
  howWasYourTrip: { ar: 'كيف كانت رحلتك في الوادي؟', en: 'How was your trip to El Oued?', fr: 'Comment était votre voyage à El Oued ?' },
  attachPhotosOptional: { ar: 'أرفق صوراً (اختياري)', en: 'Attach photos (optional)', fr: 'Joindre des photos (facultatif)' },
  photosSelected: { ar: 'صورة مختارة', en: 'photos selected', fr: 'photos sélectionnées' },
  messageRequired: { ar: 'يرجى كتابة نص تجربتك أولاً.', en: 'Please write your experience first.', fr: "Veuillez d'abord rédiger votre expérience." },
  sendError: { ar: 'حدث خطأ أثناء إرسال تجربتك، حاول مرة أخرى.', en: 'An error occurred while sending your experience, please try again.', fr: "Une erreur s'est produite lors de l'envoi, veuillez réessayer." },
  sending: { ar: 'جارٍ الإرسال...', en: 'Sending...', fr: 'Envoi en cours...' },
  sendMyExperience: { ar: 'إرسال تجربتي', en: 'Send my experience', fr: 'Envoyer mon expérience' },
  thankYouForSharing: { ar: 'شكراً لمشاركتك!', en: 'Thank you for sharing!', fr: 'Merci pour votre partage !' },
  pendingReviewNote: { ar: 'تجربتك قيد المراجعة وستظهر قريباً.', en: 'Your experience is under review and will appear soon.', fr: 'Votre expérience est en cours de vérification et apparaîtra bientôt.' },

  // ------- التذييل -------
  footerDesc: {
    ar: 'المنصة السياحية الرسمية لوادي سوف — دليلك الرقمي لاكتشاف مدينة الألف قبة وقبة.',
    en: 'The official tourism platform for Souf — your digital guide to the City of a Thousand Domes.',
    fr: 'La plateforme touristique officielle de Souf — votre guide numérique de la ville aux mille coupoles.',
  },

  // ------- عام -------
  language: { ar: 'اللغة', en: 'Language', fr: 'Langue' },

  // ------- صفحة الخريطة -------
  mapSearchPlaceholder: { ar: 'ابحث عن معلم، فندق، مطعم...', en: 'Search a landmark, hotel, restaurant...', fr: 'Rechercher un site, un hôtel, un restaurant...' },
  mapNoResults: { ar: 'لا توجد نتائج مطابقة', en: 'No matching results', fr: 'Aucun résultat trouvé' },
  emergencyServices: { ar: 'الطوارئ والخدمات', en: 'Emergency & services', fr: 'Urgences & services' },
  emergencyTitle: { ar: 'أرقام الطوارئ والخدمات', en: 'Emergency & service numbers', fr: "Numéros d'urgence et services" },
  civilProtection: { ar: 'الحماية المدنية', en: 'Civil protection', fr: 'Protection civile' },
  police: { ar: 'الشرطة (الأمن الوطني)', en: 'Police (National Security)', fr: 'Police (Sûreté nationale)' },
  gendarmerie: { ar: 'الدرك الوطني', en: 'National Gendarmerie', fr: 'Gendarmerie nationale' },
  loadingMap: { ar: 'جاري تحميل خريطة سوف 360 التفاعلية...', en: 'Loading the interactive Souf 360 map...', fr: 'Chargement de la carte interactive Souf 360...' },
  categoryRestaurants: { ar: 'المطاعم', en: 'Restaurants', fr: 'Restaurants' },
  categoryHotels: { ar: 'الفنادق', en: 'Hotels', fr: 'Hôtels' },
  categoryLandmarks: { ar: 'معالم سياحية', en: 'Tourist sites', fr: 'Sites touristiques' },
  categoryServices: { ar: 'خدمات', en: 'Services', fr: 'Services' },
  noImageAvailable: { ar: 'لا توجد صورة متاحة', en: 'No image available', fr: 'Aucune image disponible' },
  saveLandmark: { ar: 'حفظ المعلم', en: 'Save landmark', fr: 'Enregistrer le site' },
  startNavigation: { ar: 'ابدأ الملاحة', en: 'Start navigation', fr: 'Démarrer la navigation' },
  viewRouteHere: { ar: 'عرض المسار إلى هنا', en: 'Show route here', fr: "Afficher l'itinéraire" },
  dayMode: { ar: 'الوضع النهاري', en: 'Day mode', fr: 'Mode jour' },
  nightMode: { ar: 'الوضع الليلي', en: 'Night mode', fr: 'Mode nuit' },
  tripDetails: { ar: 'تفاصيل الرحلة', en: 'Trip details', fr: 'Détails du trajet' },
  collapsePanel: { ar: 'طي اللوحة لرؤية الخريطة', en: 'Collapse panel to see the map', fr: 'Réduire le panneau pour voir la carte' },
  expandPanel: { ar: 'بسط لوحة تفاصيل الرحلة', en: 'Expand trip details panel', fr: 'Développer le panneau du trajet' },
  route: { ar: 'المسار', en: 'Route', fr: 'Itinéraire' },
  refreshLocation: { ar: 'تحديث موقعك الحالي', en: 'Refresh your current location', fr: 'Actualiser votre position' },
  yourCurrentLocation: { ar: 'موقعك الحالي', en: 'Your current location', fr: 'Votre position actuelle' },
  travelMode: { ar: 'نوع التنقل', en: 'Travel mode', fr: 'Mode de transport' },
  byCar: { ar: 'سيارة', en: 'Car', fr: 'Voiture' },
  byFoot: { ar: 'مشياً', en: 'On foot', fr: 'À pied' },
  calculatingRoute: { ar: 'جاري حساب المسار الأدق عبر الطرق...', en: 'Calculating the most accurate route...', fr: "Calcul de l'itinéraire le plus précis..." },
  retry: { ar: 'إعادة المحاولة', en: 'Retry', fr: 'Réessayer' },
  turns: { ar: 'المنعطفات', en: 'Turns', fr: 'Virages' },
  estimatedTime: { ar: 'الوقت المتوقع', en: 'Estimated time', fr: 'Temps estimé' },
  distance: { ar: 'المسافة', en: 'Distance', fr: 'Distance' },
  estimatedRouteNote: { ar: 'مسار تقديري (خط مباشر) — قد يختلف قليلاً عن الطريق الفعلي', en: 'Estimated route (straight line) — may differ slightly from the actual road', fr: "Itinéraire estimé (ligne directe) — peut différer légèrement de la route réelle" },
  directions: { ar: 'تعليمات الطريق', en: 'Directions', fr: 'Instructions' },
  stopTracking: { ar: 'إيقاف التتبع', en: 'Stop tracking', fr: 'Arrêter le suivi' },
  startTrip: { ar: 'بدء الرحلة', en: 'Start trip', fr: 'Démarrer le trajet' },
  endNavigation: { ar: 'إنهاء الملاحة', en: 'End navigation', fr: 'Terminer la navigation' },
  minutesShort: { ar: 'د', en: 'min', fr: 'min' },
  kmShort: { ar: 'كم', en: 'km', fr: 'km' },
} as const;

export type DictKey = keyof typeof dict;

/* ============================= السياق (Context) ============================= */
type LanguageContextValue = {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
    } catch {
      // تجاهل أي خطأ فالقراءة من التخزين المحلي
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // تجاهل أي خطأ فالكتابة
    }
  }, []);

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || 'rtl';

  const t = useCallback(
    (key: DictKey) => {
      const entry = dict[key];
      if (!entry) return String(key);
      return entry[lang] || entry.ar;
    },
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

/* ============================= ترجمة آلية لمحتوى قاعدة البيانات ============================= */
/* أسماء/أوصاف المعالم والذكريات والتجارب تأتي من قاعدة البيانات بالعربية فقط.
   نستعمل خدمة ترجمة مجانية (MyMemory) لترجمتها آلياً عند تبديل اللغة، مع تخزين مؤقت (cache)
   محلي حتى لا تتكرر نفس طلبات الترجمة، ومع رجوع فوري للنص الأصلي أثناء الانتظار أو عند الفشل. */
const translationCache = new Map<string, string>();

export async function autoTranslate(text: string, targetLang: Lang): Promise<string> {
  if (!text || !text.trim() || targetLang === 'ar') return text;

  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey)!;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|${targetLang}`
    );
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && typeof translated === 'string') {
      translationCache.set(cacheKey, translated);
      return translated;
    }
  } catch {
    // فشل الاتصال بخدمة الترجمة — نعيد النص الأصلي دون كسر الواجهة
  }
  return text;
}

/**
 * Hook لترجمة نص ديناميكي (قادم من قاعدة البيانات) آلياً حسب اللغة الحالية.
 * يعيد النص الأصلي فوراً، ثم يحدّثه بالنص المترجم بمجرد وصوله (تجربة استخدام سلسة دون وميض فارغ).
 */
export function useAutoTranslate(text?: string | null): string {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(text || '');

  useEffect(() => {
    let cancelled = false;
    setTranslated(text || '');
    if (!text || lang === 'ar') return;
    autoTranslate(text, lang).then((res) => {
      if (!cancelled) setTranslated(res);
    });
    return () => {
      cancelled = true;
    };
  }, [text, lang]);

  return translated;
}