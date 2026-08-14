// Ouedna Vercel landing page: warm editorial travel, RTL-first, oasis green and amber sand.
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, Check, Compass, Download, History, MapPin, Navigation, Route, ShieldCheck, Sparkles, Users } from "lucide-react";

const APK_URL = "https://github.com/nadjimyahiaoui1992-lab/souf-tour/releases/download/v2.0.4/ouedna-2.0.4-universal.apk";
const RELEASE_URL = "https://github.com/nadjimyahiaoui1992-lab/souf-tour/releases/tag/v2.0.4";
const highlights = [
  { number: "01", title: "خريطة حيّة", text: "معالم قريبة، صور حقيقية، ومسار واضح من أول خطوة.", icon: MapPin },
  { number: "02", title: "دليل الطريق", text: "ملاحة صوتية وحساب للوقت بالسيارة أو المشي أو الدراجة.", icon: Navigation },
  { number: "03", title: "صوت الزوار", text: "اقرأ التجارب وشارك اقتراحاً يساعد الزائر التالي.", icon: Users },
];
const places = [
  { tag: "عمارة", title: "ملامح سوفية", text: "قباب بيضاء وظلال ترسم قصة المدينة.", image: "/ouedna/local-architecture.webp" },
  { tag: "واحة", title: "أسواق وظلال النخيل", text: "تفاصيل يومية وروائح لا تُنسى.", image: "/ouedna/palm-oasis.jpg" },
  { tag: "رمال", title: "إيقاع الكثبان", text: "طريق هادئ بين الرمل والذاكرة.", image: "/ouedna/dunes.webp" },
];

export default function LandingPage() {
  return (
    <main id="main-content" className="ouedna-site" dir="rtl">
      <header className="ouedna-header"><div className="ouedna-header__inner">
        <Link className="ouedna-brand" href="/" aria-label="Ouedna - الصفحة الرئيسية"><span className="ouedna-brand__mark"><Image src="/ouedna/mark.svg" alt="" width={36} height={36} /></span><span><strong>وادنا</strong><small>Ouedna</small></span></Link>
        <nav className="ouedna-nav" aria-label="التنقل الرئيسي"><a href="#discover">اكتشف</a><a href="#places">المعالم</a><a href="#community">صوت الزوار</a><a href="#install">طريقة التثبيت</a></nav>
        <div className="ouedna-header-actions"><a className="ouedna-header-download" href={APK_URL}><Download size={15} /> تحميل التطبيق</a><details className="ouedna-mobile-menu"><summary aria-label="فتح القائمة">☰</summary><div><a href="#discover">اكتشف</a><a href="#places">المعالم</a><a href="#community">صوت الزوار</a><a href="#install">طريقة التثبيت</a></div></details></div>
      </div></header>

      <section className="ouedna-hero"><Image className="ouedna-hero__image" src="/ouedna/hero-oasis.jpg" alt="واحة وكثبان وادي سوف عند الغروب" fill priority sizes="100vw" /><div className="ouedna-hero__veil" /><div className="ouedna-hero__dune" /><div className="ouedna-hero__content ouedna-width">
        <div className="ouedna-hero__copy"><p className="ouedna-eyebrow ouedna-eyebrow--light"><span /> الدليل السياحي لوادي سوف</p><h1>اكتشف الوادي<br /><em>على إيقاعك.</em></h1><p className="ouedna-hero__lede">من أول نظرة إلى أول طريق، يجمع لك وادنا المعالم والخرائط وحكايات الناس في تطبيق واحد، خفيف وواضح.</p><div className="ouedna-hero__actions"><a className="ouedna-button ouedna-button--amber" href={APK_URL}><Download size={18} /> حمّل وادنا مجاناً</a><a className="ouedna-light-link" href="#discover">تعرّف على التجربة <ArrowUpLeft size={16} /></a></div><div className="ouedna-hero__meta"><span><ShieldCheck size={14} /> إصدار Android 2.0.4</span><i /><span>خارج متجر Play</span></div></div>
        <div className="ouedna-route-card"><div className="ouedna-route-card__label"><Compass size={15} /> اتجاهك يبدأ من هنا</div><div className="ouedna-route-card__window"><div className="ouedna-map-lines" /><div className="ouedna-map-pin ouedna-map-pin--one"><span>واحة</span></div><div className="ouedna-map-pin ouedna-map-pin--two"><span>متحف</span></div><div className="ouedna-map-route" /></div><div className="ouedna-route-card__footer"><div><small>وجهتك التالية</small><strong>واحة النخيل</strong></div><span><Route size={14} /> 12 د</span></div></div>
      </div></section>

      <section className="ouedna-intro" id="discover"><div className="ouedna-width ouedna-intro__grid"><div className="ouedna-kicker">Ouedna / 01<i /></div><div><p className="ouedna-eyebrow">الرحلة تبدأ من المعرفة</p><h2>كل ما تحتاجه<br /><span>لتشعر بالمكان.</span></h2></div><div className="ouedna-intro__copy"><p>من قباب الوادي البيضاء إلى ظل النخيل ورائحة السوق، وادنا ليس دليلاً جامداً. إنه رفيقك في سوف: يوصلك إلى المعلم، يروي لك قصته، ويترك لك مساحة لتصنع تجربتك.</p><a className="ouedna-text-link" href="#install">لماذا وادنا؟ <ArrowUpLeft size={16} /></a></div></div></section>
      <div className="ouedna-dune-divider ouedna-width"><span>وادي سوف</span><i /></div>
      <section className="ouedna-highlights"><div className="ouedna-width ouedna-highlights__grid">{highlights.map(({ number, title, text, icon: Icon }) => <article key={number}><b>{number}</b><span><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="ouedna-places" id="places"><div className="ouedna-width"><div className="ouedna-section-heading"><div><p className="ouedna-eyebrow">من الخريطة إلى الذاكرة</p><h2>النخيل، القباب،<br /><span>وذاكرة الرمل.</span></h2></div><p>ابدأ من المعالم التي تعرفها، ثم دع وادنا يأخذك إلى أزقة سوف وتفاصيل لم تكن تبحث عنها.</p></div><div className="ouedna-places__grid">{places.map((place, index) => <article className={`ouedna-place ouedna-place--${index + 1}`} key={place.title}><div className="ouedna-place__image"><Image src={place.image} alt={place.title} fill sizes="(max-width: 680px) 50vw, 33vw" /><span>{place.tag}</span><small>وادنا / 0{index + 1}</small></div><div className="ouedna-place__body"><h3>{place.title}</h3><p>{place.text}</p><b><ArrowUpLeft size={16} /></b></div></article>)}</div></div></section>
      <section className="ouedna-journey"><Image src="/ouedna/dunes.webp" alt="كثبان وادي سوف" fill sizes="100vw" /><div className="ouedna-journey__veil" /><div className="ouedna-width ouedna-journey__content"><p>رحلتك، بطريقتك</p><h2>لا تكتفِ<br /><em>بالمشاهدة.</em></h2><span>اتبع ظلال النخيل، حدد الطريق إلى القباب، واستمع إلى الحكاية متى وجدت شيئاً يستحق.</span><a className="ouedna-button ouedna-button--outline" href={APK_URL}>ابدأ رحلتك <ArrowUpLeft size={17} /></a></div><div className="ouedna-journey__index">02 <i /> الخريطة الحيّة</div></section>

      <section className="ouedna-community" id="community"><div className="ouedna-width ouedna-community__grid"><div><p className="ouedna-eyebrow">صوت الزوار / 03</p><h2>المكان يكبر<br /><span>بأهله.</span></h2><p>جرب، قيّم، شارك صورة من السوق أو اقترح معلماً جديداً. كل ملاحظة تساعد الزائر التالي على أن يجد الوادي كما أحببته.</p><a className="ouedna-text-link" href="#install">انضم إلى الحكاية <ArrowUpLeft size={16} /></a></div><div className="ouedna-notes"><article><History size={22} /><div><strong>ذاكرة المكان</strong><p>صور قديمة وحكايات تحفظ روح سوف.</p></div><b>01</b></article><article><Sparkles size={22} /><div><strong>تجربتك مهمة</strong><p>ملاحظتك تصل إلى الفريق وتُراجع بعناية.</p></div><b>02</b></article><article><Users size={22} /><div><strong>نكتشف معاً</strong><p>مجتمع صغير يصنع دليلاً أكبر.</p></div><b>03</b></article></div></div></section>
      <section className="ouedna-install" id="install"><div className="ouedna-width ouedna-install__grid"><div><p className="ouedna-eyebrow">جاهز للانطلاق؟ / 04</p><h2>خذ وادنا<br /><span>معك.</span></h2><p>التطبيق مجاني، خفيف، ومصمم ليعمل معك خارج المتجر. نزّل النسخة الرسمية ثم افتحها لتبدأ.</p><a className="ouedna-button ouedna-button--green" href={APK_URL}><Download size={18} /> تحميل Ouedna 2.0.4</a><a className="ouedna-release-link" href={RELEASE_URL}>عرض الإصدار والتحقق من SHA-256 <ArrowUpLeft size={15} /></a></div><div className="ouedna-install__steps"><article><b>01</b><div><strong>نزّل الملف</strong><p>اضغط على زر التحميل من هاتف Android.</p></div><Check size={17} /></article><article><b>02</b><div><strong>اسمح بالتثبيت</strong><p>فعّل السماح للمتصفح عند طلب Android ذلك.</p></div><ShieldCheck size={17} /></article><article><b>03</b><div><strong>افتح وابدأ</strong><p>ثبّت التطبيق، ثم استخدم الخريطة كما تريد.</p></div><Compass size={17} /></article></div></div></section>
      <footer className="ouedna-footer"><div className="ouedna-width ouedna-footer__top"><Link className="ouedna-brand" href="/"><span className="ouedna-brand__mark"><Image src="/ouedna/mark.svg" alt="" width={36} height={36} /></span><span><strong>وادنا</strong><small>Ouedna</small></span></Link><p>بوابة اكتشاف وادي سوف، من الموقع إلى الطريق.</p><nav><Link href="/explore">المعالم</Link><Link href="/map">الخريطة</Link><a href="#install">تحميل التطبيق</a></nav></div><div className="ouedna-width ouedna-footer__bottom"><span>© 2026 Ouedna · وادنا</span><span>صنع بحب من أجل الوادي</span></div></footer>
    </main>
  );
}
