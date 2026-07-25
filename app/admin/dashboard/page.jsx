'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { supabase } from '@/lib/client'; // استدعاء عميل Supabase

/* ---------------------------------------------------------
   أيقونات صغيرة قابلة لإعادة الاستخدام
   --------------------------------------------------------- */
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevron = ({ open }) => (
  <svg className="mr-auto transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------------------------------------------------------
   بيانات وهمية للأقسام التي لم تُربط بعد (التراث، الذكريات، الآراء)
   --------------------------------------------------------- */
const INITIAL_HERITAGE = [
  { id: 1, title: 'صناعة الزرابي التقليدية', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400', text: 'حرفة يدوية متوارثة عبر الأجيال في الوادي.' },
  { id: 2, title: 'أكلة الرفيس', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', text: 'من أشهر الأطباق التقليدية في المناسبات.' },
];
const INITIAL_MEMORIES = [
  { id: 1, name: 'أمينة ك.', image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400', text: 'زيارتي لواحة كوينين كانت تجربة لا تُنسى!', approved: true },
  { id: 2, name: 'محمد ر.', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400', text: 'مهرجان النخيل هذا العام كان رائعاً.', approved: false },
];
const INITIAL_FEEDBACKS = [
  { id: 1, name: 'خالد س.', message: 'أقترح إضافة خرائط تفاعلية لكل معلم.', date: '2026-07-10' },
  { id: 2, name: 'ليلى ب.', message: 'الموقع رائع، أتمنى دعم اللغة الفرنسية أيضاً.', date: '2026-07-15' },
];
const SITE_VISITS = 18420;
const CURRENT_USER = { name: 'نجم يحياوي', role: 'مدير عام' };

const SITE_STATUS_MAP = {
  online: { text: 'الموقع يعمل', badge: styles.badgeOnline },
  offline: { text: 'الموقع متوقف', badge: styles.badgeOffline },
  maintenance: { text: 'تحت الصيانة', badge: styles.badgeMaint },
};

const EMPTY_PLACE_FORM = { name: '', category: 'طبيعي', status: 'منشور', image: '', details: '' };

export default function DashboardPage() {
  /* ---------- تنقّل ---------- */
  const [view, setView] = useState('overview');
  const [placesMenuOpen, setPlacesMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* ---------- حالة الاتصال وحالة الموقع ---------- */
  const [dbOnline, setDbOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [siteStatus, setSiteStatus] = useState('online');
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);

  /* ---------- البيانات ---------- */
  const [places, setPlaces] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [heritageItems, setHeritageItems] = useState(INITIAL_HERITAGE);
  const [memories, setMemories] = useState(INITIAL_MEMORIES);
  const [feedbacks, setFeedbacks] = useState(INITIAL_FEEDBACKS);

  /* ---------- نموذج إضافة/تعديل معلم ---------- */
  const [showPlaceForm, setShowPlaceForm] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const [placeForm, setPlaceForm] = useState(EMPTY_PLACE_FORM);

  /* ---------- تأكيد الحذف + Toasts ---------- */
  const [confirmTarget, setConfirmTarget] = useState(null); // { type, id }
  const [toasts, setToasts] = useState([]);

  /* ---------- جلب البيانات من Supabase ---------- */
  useEffect(() => {
    fetchPlaces();
    fetchAdmins();
  }, []);

  async function fetchPlaces() {
    const { data, error } = await supabase.from('places').select('*');
    if (data && !error) {
      setPlaces(data);
      setDbOnline(true);
    } else {
      setDbOnline(false);
    }
  }

  async function fetchAdmins() {
    const { data, error } = await supabase.from('admins').select('*');
    if (data && !error) setAdmins(data);
  }

  function showToast(msg) {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }

  function goTo(v) {
    setView(v);
    setMobileSidebarOpen(false);
  }

  /* ---------- تحديث الاتصال بقاعدة البيانات ---------- */
  async function refreshDb() {
    setRefreshing(true);
    const { error } = await supabase.from('places').select('id').limit(1);
    setDbOnline(!error);
    setRefreshing(false);
    showToast(error ? 'فشل الاتصال بقاعدة البيانات' : 'تم تحديث حالة الاتصال بنجاح');
  }

  /* ---------- تغيير حالة الموقع ---------- */
  function changeSiteStatus(status) {
    setSiteStatus(status);
    setSiteMenuOpen(false);
    showToast('تم تحديث حالة الموقع إلى: ' + SITE_STATUS_MAP[status].text);
  }

  /* ---------- نموذج المعلم ---------- */
  function openAddPlace() {
    setEditingPlaceId(null);
    setPlaceForm(EMPTY_PLACE_FORM);
    setShowPlaceForm(true);
    goTo('places');
  }

  function openEditPlace(place) {
    setEditingPlaceId(place.id);
    setPlaceForm({ name: place.name, category: place.category, status: place.status, image: place.image, details: place.details });
    setShowPlaceForm(true);
  }

  function closePlaceForm() {
    setShowPlaceForm(false);
    setEditingPlaceId(null);
  }

  async function submitPlaceForm(e) {
    e.preventDefault();
    const dataToSave = {
      name: placeForm.name.trim(),
      category: placeForm.category,
      status: placeForm.status,
      image: placeForm.image.trim() || 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400',
      details: placeForm.details.trim(),
    };

    if (editingPlaceId) {
      // تعديل
      const { error } = await supabase.from('places').update(dataToSave).eq('id', editingPlaceId);
      if (!error) {
        setPlaces((prev) => prev.map((p) => (p.id === editingPlaceId ? { ...p, ...dataToSave } : p)));
        showToast('تم تحديث بيانات المعلم بنجاح');
      } else {
        showToast('حدث خطأ أثناء التحديث');
      }
    } else {
      // إضافة
      const { data: newPlace, error } = await supabase.from('places').insert([dataToSave]).select();
      if (!error && newPlace) {
        setPlaces((prev) => [...prev, newPlace[0]]);
        showToast('تمت إضافة المعلم بنجاح');
      } else {
        showToast('حدث خطأ أثناء الإضافة');
      }
    }
    closePlaceForm();
  }

  /* ---------- الذاكرة: نشر ---------- */
  function approveMemory(id) {
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, approved: true } : m)));
    showToast('تم نشر الذكرى');
  }

  /* ---------- الحذف ---------- */
  function askDelete(type, id) {
    setConfirmTarget({ type, id });
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    const { type, id } = confirmTarget;

    if (type === 'place') {
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (!error) setPlaces((prev) => prev.filter((p) => p.id !== id));
    }
    if (type === 'admin') {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if (!error) setAdmins((prev) => prev.filter((a) => a.id !== id));
    }
    if (type === 'heritage') setHeritageItems((prev) => prev.filter((h) => h.id !== id));
    if (type === 'memory') setMemories((prev) => prev.filter((m) => m.id !== id));
    if (type === 'feedback') setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    
    showToast('تم الحذف بنجاح');
    setConfirmTarget(null);
  }

  const publishedPlaces = places.filter((p) => p.status === 'منشور');
  const siteStatusInfo = SITE_STATUS_MAP[siteStatus];

  return (
    <div className="min-h-screen" style={{ background: 'var(--sand)', color: 'var(--ink)' }}>
      <div className="flex min-h-screen">

        {/* ===================== الشريط الجانبي ===================== */}
        <aside className={`${styles.sidebar} ${mobileSidebarOpen ? styles.open : ''} w-64 shrink-0 flex flex-col py-5 px-3`}>
          <div className="flex items-center gap-3 px-2 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--gold)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 20c3-6 6-9 8-16 2 7 5 10 8 16" stroke="#241705" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 20h20" stroke="#241705" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-white font-extrabold text-sm leading-tight">سوف 360</p>
              <p className="text-xs" style={{ color: '#8FA096' }}>لوحة الإدارة</p>
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="mr-auto text-white/60 hover:text-white md:hidden">✕</button>
          </div>
          <span className={`${styles.duneDivider} mx-2`} />

          <nav className="flex-1 flex flex-col gap-1 mt-2 overflow-y-auto">
            <div className={`${styles.sideLink} ${view === 'overview' ? styles.active : ''}`} onClick={() => goTo('overview')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.7" /></svg>
              لوحة المعلومات
            </div>

            <div className={`${styles.sideLink} ${view === 'admins' ? styles.active : ''}`} onClick={() => goTo('admins')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="currentColor" strokeWidth="1.7" /><path d="M16 4.5c1.7.3 3 1.9 3 3.7 0 1.8-1.3 3.4-3 3.7M21 20c0-2.8-1.9-5-4.5-5.7" stroke="currentColor" strokeWidth="1.7" /></svg>
              إدارة المشرفين
            </div>

            <div className={styles.sideLink} onClick={() => setPlacesMenuOpen((v) => !v)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" /></svg>
              إدارة المعالم
              <IconChevron open={placesMenuOpen} />
            </div>
            {placesMenuOpen && (
              <div>
                <div className={styles.sideSub} onClick={openAddPlace}>＋ إضافة معلم</div>
                <div className={`${styles.sideSub} ${view === 'places' ? styles.active : ''}`} onClick={() => goTo('places')}>قائمة وتعديل المعالم</div>
              </div>
            )}

            <div className={`${styles.sideLink} ${view === 'heritage' ? styles.active : ''}`} onClick={() => goTo('heritage')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 20V9l8-6 8 6v11" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" /></svg>
              عادات وتقاليد الوادي
            </div>

            <div className={`${styles.sideLink} ${view === 'memories' ? styles.active : ''}`} onClick={() => goTo('memories')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" /><circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.7" /><path d="M21 16l-5-4-4 3-3-2-6 5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
              ذكرى في ولاية الوادي
            </div>

            <div className={`${styles.sideLink} ${view === 'feedback' ? styles.active : ''}`} onClick={() => goTo('feedback')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12a8 8 0 1 1-3.3-6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M21 4v6h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              آراء واقتراحات
            </div>
          </nav>

          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
            <div className="flex items-center gap-2 px-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'var(--oasis)', color: '#fff' }}>ن</div>
              <div className="leading-tight">
                <p className="text-white text-sm font-bold">{CURRENT_USER.name}</p>
                <p className="text-xs" style={{ color: '#8FA096' }}>{CURRENT_USER.role}</p>
              </div>
            </div>
          </div>
        </aside>
        {mobileSidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)} />}

        {/* ===================== المحتوى الرئيسي ===================== */}
        <div className="flex-1 min-w-0">

          {/* ---------- الرأس ---------- */}
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b px-4 sm:px-6 py-3" style={{ borderColor: 'var(--line)' }}>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon} md:hidden`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>

              <Link href="/" className={`${styles.btn} ${styles.btnGhost}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                الرجوع إلى الموقع
              </Link>

              <div className="flex items-center gap-2 mr-auto">
                {/* حالة الاتصال بقاعدة البيانات */}
                <span className={`${styles.badge} ${dbOnline ? styles.badgeOnline : styles.badgeOffline}`}>
                  <span className={styles.badgeDot} />
                  {dbOnline ? 'متصل بقاعدة البيانات' : 'انقطع الاتصال بقاعدة البيانات'}
                </span>
                <button onClick={refreshDb} title="تحديث الاتصال" className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transition: 'transform .6s ease', transform: refreshing ? 'rotate(360deg)' : 'none' }}>
                    <path d="M20 11A8 8 0 0 0 5.5 6.5L4 8M4 13a8 8 0 0 0 14.5 4.5L20 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M4 4v4h4M20 20v-4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* حالة الموقع */}
                <div className="relative">
                  <button onClick={() => setSiteMenuOpen((v) => !v)} className={`${styles.badge} ${siteStatusInfo.badge}`}>
                    <span className={styles.badgeDot} />
                    {siteStatusInfo.text}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  {siteMenuOpen && (
                    <div className={`${styles.panel} absolute left-0 mt-2 w-44 p-1.5 z-30`}>
                      <button className="w-full text-right text-sm font-semibold px-3 py-2 rounded-lg hover:bg-black/5" onClick={() => changeSiteStatus('online')}>🟢 يعمل Online</button>
                      <button className="w-full text-right text-sm font-semibold px-3 py-2 rounded-lg hover:bg-black/5" onClick={() => changeSiteStatus('offline')}>🔴 متوقف Offline</button>
                      <button className="w-full text-right text-sm font-semibold px-3 py-2 rounded-lg hover:bg-black/5" onClick={() => changeSiteStatus('maintenance')}>🟡 تحت الصيانة</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 space-y-6">

            {/* ======================= نظرة عامة ======================= */}
            {view === 'overview' && (
              <section className="space-y-6">
                <div>
                  <h1 className="text-xl font-extrabold">مرحباً بك 👋</h1>
                  <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>نظرة عامة على أداء منصة الوادي السياحية</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={styles.statCard}>
                    <p className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>المعالم المنشورة</p>
                    <p className="text-2xl font-extrabold mt-1">{publishedPlaces.length}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>عدد المشرفين</p>
                    <p className="text-2xl font-extrabold mt-1">{admins.length}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>دورك الحالي</p>
                    <p className="text-2xl font-extrabold mt-1">{CURRENT_USER.role}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>زيارات الموقع</p>
                    <p className="text-2xl font-extrabold mt-1">{SITE_VISITS.toLocaleString('en-US')}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-extrabold">المعالم المنشورة حالياً</h2>
                    <span className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>{publishedPlaces.length} معلم</span>
                  </div>
                  {publishedPlaces.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {publishedPlaces.map((p) => (
                        <div key={p.id} className={styles.placeCard}>
                          <img src={p.image} alt={p.name} loading="lazy" />
                          <div className="p-3">
                            <p className="font-bold text-sm truncate">{p.name}</p>
                            <span className={`${styles.catChip} mt-1 inline-block`}>{p.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState msg="لا توجد معالم منشورة بعد" />}
                </div>
              </section>
            )}

            {/* ======================= المشرفون ======================= */}
            {view === 'admins' && (
              <section className="space-y-4">
                <h1 className="text-xl font-extrabold">إدارة المشرفين</h1>
                <div className={`${styles.panel} overflow-hidden`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-right" style={{ background: 'var(--sand-2)', color: 'var(--ink-soft)' }}>
                        <th className="px-4 py-3 font-bold">الاسم</th>
                        <th className="px-4 py-3 font-bold">البريد الإلكتروني</th>
                        <th className="px-4 py-3 font-bold">الدور</th>
                        <th className="px-4 py-3 font-bold">الحالة</th>
                        <th className="px-4 py-3 font-bold">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((a) => (
                        <tr key={a.id} className={`${styles.rowHover} border-t`} style={{ borderColor: 'var(--line)' }}>
                          <td className="px-4 py-3 font-semibold">{a.name}</td>
                          <td className="px-4 py-3" style={{ color: 'var(--ink-soft)' }}>{a.email}</td>
                          <td className="px-4 py-3"><span className={styles.catChip}>{a.role}</span></td>
                          <td className="px-4 py-3">
                            <span className={`${styles.badge} ${a.active ? styles.badgeOnline : styles.badgeOffline}`}>
                              <span className={styles.badgeDot} />{a.active ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {/* يمكنك إضافة دالة تعديل المستخدم لاحقاً */}
                              <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`} title="تعديل"><IconEdit /></button>
                              <button className={`${styles.btn} ${styles.btnClay} ${styles.btnIcon}`} title="حذف" onClick={() => askDelete('admin', a.id)}><IconTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ======================= المعالم ======================= */}
            {view === 'places' && (
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-extrabold">إدارة المعالم</h1>
                  <button onClick={openAddPlace} className={`${styles.btn} ${styles.btnOasis}`}>＋ إضافة معلم جديد</button>
                </div>

                <div className={`${styles.panel} overflow-hidden`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-right" style={{ background: 'var(--sand-2)', color: 'var(--ink-soft)' }}>
                        <th className="px-4 py-3 font-bold">المعلم</th>
                        <th className="px-4 py-3 font-bold">التصنيف</th>
                        <th className="px-4 py-3 font-bold">الحالة</th>
                        <th className="px-4 py-3 font-bold">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {places.map((p) => (
                        <tr key={p.id} className={`${styles.rowHover} border-t`} style={{ borderColor: 'var(--line)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={p.image} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                              <span className="font-semibold">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className={styles.catChip}>{p.category}</span></td>
                          <td className="px-4 py-3">
                            <span className={`${styles.badge} ${p.status === 'منشور' ? styles.badgeOnline : styles.badgeMaint}`}>
                              <span className={styles.badgeDot} />{p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`} title="تعديل" onClick={() => openEditPlace(p)}><IconEdit /></button>
                              <button className={`${styles.btn} ${styles.btnClay} ${styles.btnIcon}`} title="حذف" onClick={() => askDelete('place', p.id)}><IconTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {showPlaceForm && (
                  <div className={`${styles.panel} p-5 sm:p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-extrabold">{editingPlaceId ? 'تعديل المعلم' : 'إضافة معلم جديد'}</h2>
                      <button onClick={closePlaceForm} className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`}>✕</button>
                    </div>
                    <form onSubmit={submitPlaceForm} className="grid sm:grid-cols-2 gap-4">
                      <div className={`${styles.field} sm:col-span-2`}>
                        <label>اسم المعلم</label>
                        <input type="text" required placeholder="مثال: بحيرة أم الطيور"
                          value={placeForm.name} onChange={(e) => setPlaceForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div className={styles.field}>
                        <label>التصنيف</label>
                        <select value={placeForm.category} onChange={(e) => setPlaceForm((f) => ({ ...f, category: e.target.value }))}>
                          <option value="طبيعي">معلم طبيعي</option>
                          <option value="تراثي">معلم تراثي</option>
                          <option value="ديني">معلم ديني</option>
                          <option value="ترفيهي">ترفيهي</option>
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label>الحالة</label>
                        <select value={placeForm.status} onChange={(e) => setPlaceForm((f) => ({ ...f, status: e.target.value }))}>
                          <option value="منشور">منشور</option>
                          <option value="مسودة">مسودة</option>
                        </select>
                      </div>
                      <div className={`${styles.field} sm:col-span-2`}>
                        <label>صورة المعلم (رابط أو رفع لاحقاً عبر Supabase Storage)</label>
                        <input type="text" placeholder="https://..."
                          value={placeForm.image} onChange={(e) => setPlaceForm((f) => ({ ...f, image: e.target.value }))} />
                      </div>
                      <div className={`${styles.field} sm:col-span-2`}>
                        <label>التفاصيل</label>
                        <textarea rows={4} placeholder="وصف مختصر عن المعلم..."
                          value={placeForm.details} onChange={(e) => setPlaceForm((f) => ({ ...f, details: e.target.value }))} />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                        <button type="submit" className={`${styles.btn} ${styles.btnOasis}`}>حفظ المعلم</button>
                        <button type="button" onClick={closePlaceForm} className={`${styles.btn} ${styles.btnGhost}`}>إلغاء</button>
                      </div>
                    </form>
                  </div>
                )}
              </section>
            )}

            {/* ======================= التراث ======================= */}
            {view === 'heritage' && (
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-extrabold">عادات وتقاليد ولاية الوادي</h1>
                  <button onClick={() => showToast('افتح نموذج إضافة عنصر تراثي (يُربط لاحقاً بالخلفية)')} className={`${styles.btn} ${styles.btnOasis}`}>＋ إضافة عنصر تراثي</button>
                </div>
                {heritageItems.length ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {heritageItems.map((h) => (
                      <div key={h.id} className={styles.placeCard}>
                        <img src={h.image} alt={h.title} loading="lazy" />
                        <div className="p-3">
                          <p className="font-bold text-sm">{h.title}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{h.text}</p>
                          <div className="flex gap-2 mt-3">
                            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`} title="تعديل"><IconEdit /></button>
                            <button className={`${styles.btn} ${styles.btnClay} ${styles.btnIcon}`} title="حذف" onClick={() => askDelete('heritage', h.id)}><IconTrash /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <EmptyState msg="لم تتم إضافة أي عنصر تراثي بعد" />}
              </section>
            )}

            {/* ======================= الذكريات ======================= */}
            {view === 'memories' && (
              <section className="space-y-5">
                <h1 className="text-xl font-extrabold">ذكرى في ولاية الوادي — مشاركات الزوار</h1>
                {memories.length ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {memories.map((m) => (
                      <div key={m.id} className={styles.placeCard}>
                        <img src={m.image} alt="" loading="lazy" />
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-sm">{m.name}</p>
                            <span className={`${styles.badge} ${m.approved ? styles.badgeOnline : styles.badgeMaint}`}>
                              <span className={styles.badgeDot} />{m.approved ? 'منشورة' : 'قيد المراجعة'}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{m.text}</p>
                          <div className="flex gap-2 mt-3">
                            {!m.approved && (
                              <button className={`${styles.btn} ${styles.btnOasis} ${styles.btnIcon}`} title="نشر" onClick={() => approveMemory(m.id)}><IconCheck /></button>
                            )}
                            <button className={`${styles.btn} ${styles.btnClay} ${styles.btnIcon}`} title="حذف" onClick={() => askDelete('memory', m.id)}><IconTrash /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <EmptyState msg="لا توجد مشاركات من الزوار بعد" />}
              </section>
            )}

            {/* ======================= الآراء والاقتراحات ======================= */}
            {view === 'feedback' && (
              <section className="space-y-4">
                <h1 className="text-xl font-extrabold">آراء واقتراحات الزوار</h1>
                {feedbacks.length ? (
                  <div className="space-y-3">
                    {feedbacks.map((f) => (
                      <div key={f.id} className={`${styles.panel} p-4 flex items-start justify-between gap-4`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{f.name}</p>
                            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{f.date}</span>
                          </div>
                          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>{f.message}</p>
                        </div>
                        <button className={`${styles.btn} ${styles.btnClay} ${styles.btnIcon} shrink-0`} title="حذف" onClick={() => askDelete('feedback', f.id)}><IconTrash /></button>
                      </div>
                    ))}
                  </div>
                ) : <EmptyState msg="لا توجد آراء أو اقتراحات بعد" />}
              </section>
            )}

          </main>
        </div>
      </div>

      {/* ===================== نافذة تأكيد الحذف ===================== */}
      {confirmTarget && (
        <div className={`${styles.modalBackdrop} fixed inset-0 z-50 flex items-center justify-center px-4`}>
          <div className={`${styles.panel} w-full max-w-sm p-6 text-center`}>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--clay-tint)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="#B85C34" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="#B85C34" strokeWidth="1.8" /></svg>
            </div>
            <h3 className="font-extrabold text-lg mb-1">تأكيد الحذف</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--ink-soft)' }}>هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmTarget(null)} className={`${styles.btn} ${styles.btnGhost} flex-1`}>إلغاء</button>
              <button onClick={confirmDelete} className={`${styles.btn} ${styles.btnClay} flex-1`}>حذف نهائياً</button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Toasts ===================== */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 space-y-2">
        {toasts.map((t) => <div key={t.id} className={styles.toast}>{t.msg}</div>)}
      </div>
    </div>
  );
}

function EmptyState({ msg }) {
  return <div className="text-center py-10 text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>{msg}</div>;
}
