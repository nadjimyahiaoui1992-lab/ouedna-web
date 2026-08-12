import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Map, Compass, Award, Clock3, Sparkles, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full flex flex-col text-white overflow-hidden"
      style={{ fontFamily: "'Tajawal', 'IBM Plex Sans Arabic', sans-serif" }}
    >
      {/* خطوط عربية مميزة: تجوال للعناوين، آي بي إم بلكس للنصوص */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap');
        @keyframes riseIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes driftSlow { from { transform: translateX(0); } to { transform: translateX(-4%); } }
        .rise-1 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .rise-2 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .rise-3 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
        .rise-4 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
        .rise-5 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.65s both; }
        .dune-drift { animation: driftSlow 40s linear infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .rise-1, .rise-2, .rise-3, .rise-4, .rise-5, .dune-drift { animation: none !important; }
        }
      `}</style>

      {/* خلفية الصحراء: كثبان ذهبية وواحة نخيل، تعكس طبيعة واد سوف الفلاحية وسط الرمال */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1770557386874-739c55a381f3?q=80&w=1920&auto=format&fit=crop"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
        {/* تدرج من سماء ليلية نيلية أعلى الصورة إلى عتمة سفلية، يحاكي غروب الوادي */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-black/20 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay" />
      </div>

      {/* خط أفق القِباب: توقيع بصري مرسوم يدويًا يحيل إلى لقب "مدينة الألف قبة وقبة" */}
      <div className="absolute inset-x-0 bottom-0 z-[1] h-24 md:h-32 opacity-90 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
          <path
            d="M0 120 L0 74 Q20 74 20 60 A18 18 0 0 1 56 60 Q56 74 76 74 L110 74 Q110 60 122 60 A14 14 0 0 1 150 60 Q150 74 162 74 L205 74 Q205 52 222 52 A24 24 0 0 1 270 52 Q270 74 287 74 L330 74 Q330 62 342 62 A15 15 0 0 1 372 62 Q372 74 384 74 L430 74 Q430 46 452 46 A28 28 0 0 1 508 46 Q508 74 530 74 L575 74 Q575 60 587 60 A14 14 0 0 1 615 60 Q615 74 627 74 L672 74 Q672 50 692 50 A26 26 0 0 1 744 50 Q744 74 764 74 L805 74 Q805 62 817 62 A15 15 0 0 1 847 62 Q847 74 859 74 L905 74 Q905 44 928 44 A29 29 0 0 1 986 44 Q986 74 1009 74 L1050 74 Q1050 60 1062 60 A14 14 0 0 1 1090 60 Q1090 74 1102 74 L1200 74 L1200 120 Z"
            fill="#050505"
            fillOpacity="0.9"
          />
        </svg>
      </div>

      {/* شارة علوية صغيرة */}
      <div className="relative z-10 pt-7 flex justify-center rise-1">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-400/40 px-4 py-1.5 rounded-full text-amber-300 text-[11px] font-bold tracking-wide backdrop-blur-md">
          <Sparkles size={13} className="text-amber-400" />
          <span>ALGERIA 360 AI • مشاركة رسمية في IA Tour Algérie 2026</span>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto text-center px-5 space-y-7 py-10">
        <div className="space-y-5">
          <h1 className="rise-2 text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
            ALGERIA <span className="text-amber-500">360 AI</span>
          </h1>

          <p className="rise-3 text-lg md:text-2xl font-bold text-gray-100 drop-shadow max-w-2xl mx-auto leading-snug">
            Discover Algeria. Intelligently. (مع ريادة وادي سوف • Souf360)
          </p>

          <p className="rise-3 text-sm md:text-base text-gray-300 max-w-lg mx-auto leading-relaxed font-medium">
            المنصة السياحية الوطنية الذكية المدعومة بالذكاء الاصطناعي، الخرائط التفاعلية، الواقع المعزز، وتجارب الزوار الموثقة.
          </p>
        </div>

        {/* أزرار التوجيه */}
        <div className="rise-4 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/explore"
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold px-9 py-4 rounded-xl shadow-[0_8px_30px_rgba(245,158,11,0.35)] transition-all duration-300 hover:scale-[1.03] text-sm"
          >
            <MapPin size={18} className="transition-transform group-hover:-translate-y-0.5" />
            <span>استكشف المعالم</span>
          </Link>

          <Link
            href="/map"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 text-white font-bold px-9 py-4 rounded-xl border border-white/25 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] text-sm"
          >
            <Map size={18} className="text-sky-300" />
            <span>عرض الخريطة</span>
          </Link>
        </div>
      </div>

      {/* فاصل زخرفي: خط الكثبان النجمية، إشارة إلى الشكل الفريد لكثبان سوف */}
      <div className="relative z-10 w-full overflow-hidden h-6 opacity-40">
        <svg className="dune-drift w-[140%]" viewBox="0 0 1400 24" preserveAspectRatio="none" fill="none">
          <path
            d="M0 18 Q 35 4, 70 18 T 140 18 T 210 18 T 280 18 T 350 18 T 420 18 T 490 18 T 560 18 T 630 18 T 700 18 T 770 18 T 840 18 T 910 18 T 980 18 T 1050 18 T 1120 18 T 1190 18 T 1260 18 T 1330 18 T 1400 18"
            stroke="#f59e0b"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* شريط الإحصائيات ومحاور المسابقة */}
      <div className="rise-5 relative z-10 w-full max-w-5xl mx-auto px-5 pb-9 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-white/10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {[
            { icon: Compass, label: 'معالم وطنية', value: '360+' },
            { icon: Sparkles, label: 'مساعد ذكي RAG', value: 'AI 24/7' },
            { icon: Award, label: 'مسابقة IA Tour', value: '2026' },
            { icon: Clock3, label: 'ريادة Souf360', value: '100%' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center justify-center gap-1.5 py-4 px-2 text-center">
              <Icon className="text-amber-400" size={20} strokeWidth={2} />
              <span className="text-white/90 font-semibold text-xs">{label}</span>
              <span className="text-amber-500 font-extrabold text-base">{value}</span>
            </div>
          ))}
        </div>

        {/* بطاقة محاور مسابقة IA Tour Algérie 2026 */}
        <div className="bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-amber-950/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 text-right shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500 text-black font-black text-[11px] px-2.5 py-0.5 rounded-lg">IA Tour 2026</span>
            <span className="text-white font-black text-sm">محاور الابتكار في المنصة الوطنية</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-200">
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
              <strong className="text-amber-400 block mb-0.5">01. Rêve (الواقع المعزز)</strong>
              جولات افتراضية 360° ومعالم الوادي.
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
              <strong className="text-amber-400 block mb-0.5">02. Sur-Mesure (الذكاء الاصطناعي)</strong>
              مساعد سياحي تفاعلي وبرامج رحلات.
            </div>
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
              <strong className="text-amber-400 block mb-0.5">03. Performance (التحليلات)</strong>
              لوحة تحكم ذكية وإدارة وطنية.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
