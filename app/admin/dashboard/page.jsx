'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import AddPlaceForm from '@/components/map/admin/AddPlaceForm';

/* غيّر هذا المسار إذا كانت صفحة تسجيل الدخول عندك في مكان آخر */
const LOGIN_PATH = '/login';
/* اسم bucket تخزين الصور في Supabase Storage */
const IMAGES_BUCKET = 'images';

/* ---------------------------------------------------------
   ثوابت عامة وأيقونات
   --------------------------------------------------------- */
const CURRENT_USER = { name: 'نجم يحياوي', role: 'مدير النظام' };

const SITE_STATUS_MAP = {
  online: { text: 'النظام يعمل بكفاءة', badge: 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]' },
  offline: { text: 'النظام متوقف', badge: 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]' },
  maintenance: { text: 'تحت الصيانة', badge: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]' },
};

const EMPTY_ADMIN_FORM = { name: '', email: '', role: 'مشرف', active: true };
const EMPTY_HERITAGE_FORM = { title: '', image: '', text: '' };

const IconChevron = ({ open }) => (
  <svg className={`mr-auto transition-transform duration-300 ${open ? 'rotate-180' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function DashboardPage() {
  const router = useRouter();

  /* ---------- حالة التنقل ---------- */
  const [view, setView] = useState('overview');
  const [placesMenuOpen, setPlacesMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* ---------- حالة النظام ---------- */
  const [dbOnline, setDbOnline] = useState(true);
  const [siteStatus, setSiteStatus] = useState('online');
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [updatingSiteStatus, setUpdatingSiteStatus] = useState(false);
  const [toasts, setToasts] = useState([]);

  /* ---------- البيانات ---------- */
  const [places, setPlaces] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [heritageItems, setHeritageItems] = useState([]);
  const [memories, setMemories] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------- النماذج ---------- */
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [showHeritageForm, setShowHeritageForm] = useState(false);
  const [heritageForm, setHeritageForm] = useState(EMPTY_HERITAGE_FORM);
  const [heritageImageFile, setHeritageImageFile] = useState(null);
  const [heritageImagePreview, setHeritageImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  /* ---------- جلب البيانات ---------- */
  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setIsLoading(true);
    const { data: pData, error: pErr } = await supabase.from('places').select('*').order('id', { ascending: false });
    if (!pErr) { setPlaces(pData || []); setDbOnline(true); } else { setDbOnline(false); }

    const { data: aData } = await supabase.from('admins').select('*');
    if (aData) setAdmins(aData);

    const { data: hData } = await supabase.from('heritage').select('*').order('id', { ascending: false });
    if (hData) setHeritageItems(hData);

    const { data: mData } = await supabase.from('memories').select('*').order('id', { ascending: false });
    if (mData) setMemories(mData);

    const { data: fData } = await supabase.from('feedbacks').select('*').order('id', { ascending: false });
    if (fData) setFeedbacks(fData);

    const { data: sData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (sData?.site_status) setSiteStatus(sData.site_status);

    setIsLoading(false);
  }

  /* ---------- دوال مساعدة ---------- */
  function showToast(msg) {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }

  function goTo(v) {
    setView(v);
    setMobileSidebarOpen(false);
    setShowAdminForm(false);
    setShowHeritageForm(false);
    setHeritageImageFile(null);
    setHeritageImagePreview('');
  }

  async function changeSiteStatus(status) {
    if (status === siteStatus || updatingSiteStatus) return;
    setUpdatingSiteStatus(true);
    const { error } = await supabase
      .from('site_settings')
      .update({ site_status: status, maintenance_mode: status === 'maintenance' })
      .eq('id', 1);

    if (!error) {
      setSiteStatus(status);
      showToast('تم تحديث حالة النظام إلى: ' + SITE_STATUS_MAP[status].text);
    } else {
      showToast('تعذر تحديث حالة النظام، حاول مجدداً');
    }
    setSiteMenuOpen(false);
    setUpdatingSiteStatus(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(LOGIN_PATH);
  }

  /* ---------- العمليات على البيانات ---------- */
  async function togglePlaceStatus(place) {
    const newStatus = place.status === 'منشور' ? 'مسودة' : 'منشور';
    const { error } = await supabase.from('places').update({ status: newStatus }).eq('id', place.id);
    if (!error) {
      setPlaces(prev => prev.map(p => p.id === place.id ? { ...p, status: newStatus } : p));
      showToast(newStatus === 'منشور' ? 'تم نشر المعلم للعامة' : 'تم تحويل المعلم لمسودة');
    }
  }

  async function submitAdminForm(e) {
    e.preventDefault();
    const { data, error } = await supabase.from('admins').insert([adminForm]).select();
    if (!error && data) {
      setAdmins(prev => [...prev, data[0]]);
      showToast('تم اعتماد المشرف الجديد بنجاح');
      setShowAdminForm(false);
      setAdminForm(EMPTY_ADMIN_FORM);
    } else showToast('خطأ في النظام أثناء الإضافة');
  }

  function handleHeritageImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeritageImageFile(file);
    setHeritageImagePreview(URL.createObjectURL(file));
  }

  function closeHeritageForm() {
    setShowHeritageForm(false);
    setHeritageForm(EMPTY_HERITAGE_FORM);
    setHeritageImageFile(null);
    setHeritageImagePreview('');
  }

  async function submitHeritageForm(e) {
    e.preventDefault();
    setUploadingImage(true);

    let imageUrl = 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400';

    if (heritageImageFile) {
      const fileExt = heritageImageFile.name.split('.').pop();
      const filePath = `heritage/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from(IMAGES_BUCKET).upload(filePath, heritageImageFile);
      if (uploadError) {
        showToast('تعذر رفع الصورة، حاول مجدداً');
        setUploadingImage(false);
        return;
      }
      const { data: urlData } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    const dataToSave = { title: heritageForm.title, text: heritageForm.text, image: imageUrl };
    const { data, error } = await supabase.from('heritage').insert([dataToSave]).select();
    if (!error && data) {
      setHeritageItems(prev => [data[0], ...prev]);
      showToast('تم توثيق العنصر التراثي بنجاح');
      closeHeritageForm();
    } else showToast('خطأ في قاعدة البيانات');
    setUploadingImage(false);
  }

  async function approveMemory(id) {
    const { error } = await supabase.from('memories').update({ approved: true }).eq('id', id);
    if (!error) {
      setMemories(prev => prev.map(m => m.id === id ? { ...m, approved: true } : m));
      showToast('تمت الموافقة الرسمية على نشر الذكرى');
    }
  }

  async function deleteItem(table, id, setState) {
    if (!window.confirm('هل أنت متأكد من الحذف النهائي من قاعدة البيانات؟')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      setState(prev => prev.filter(item => item.id !== id));
      showToast('تم حذف السجل بنجاح');
    } else showToast('إجراء غير مسموح أو خطأ بالنظام');
  }

  const pendingMemoriesCount = memories.filter(m => !m.approved).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] font-sans flex selection:bg-[#D4AF37] selection:text-white" dir="rtl">

      {/* --- التنبيهات المنبثقة --- */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className="bg-white text-[#1E293B] px-6 py-4 rounded-xl shadow-2xl border-l-4 border-[#D4AF37] text-sm font-bold animate-fade-in flex items-center gap-3">
            <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {t.msg}
          </div>
        ))}
      </div>

      {/* ===================== الشريط الجانبي ===================== */}
      <aside className={`${mobileSidebarOpen ? 'block fixed inset-y-0 right-0 z-40' : 'hidden md:flex'} w-72 bg-white flex-col py-6 px-4 border-l border-[#E2E8F0] shadow-sm transition-transform overflow-y-auto`}>

        <div className="flex items-center gap-4 px-3 mb-10">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#B8962E] shadow-md shrink-0">
            <span className="text-white font-black text-2xl drop-shadow-sm">س</span>
          </div>
          <div>
            <p className="text-[#0F172A] font-black text-lg tracking-wide">سوف 360</p>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">منصة الإدارة الرقمية</p>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="mr-auto text-[#94A3B8] hover:text-[#0F172A] md:hidden p-2">✕</button>
        </div>

        <nav className="flex-1 flex flex-col gap-2.5">
          <button className={`flex items-center gap-3.5 p-3.5 text-sm font-bold rounded-xl text-right transition-all duration-300 ${view === 'overview' ? 'bg-[#F8FAFC] text-[#B8962E] shadow-sm ring-1 ring-[#E2E8F0]' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'}`} onClick={() => goTo('overview')}>
            <span className="text-lg">📊</span> المركز الرئيسي
          </button>

          <div>
            <button className="w-full flex items-center gap-3.5 p-3.5 text-sm font-bold rounded-xl text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] text-right transition-all" onClick={() => setPlacesMenuOpen(!placesMenuOpen)}>
              <span className="text-lg">📍</span> بنك المعالم السياحية <IconChevron open={placesMenuOpen} />
            </button>
            {placesMenuOpen && (
              <div className="flex flex-col gap-1 pr-11 mt-2 border-r-2 border-[#F1F5F9]">
                <button className={`p-2.5 text-xs font-bold text-right rounded-lg transition-all ${view === 'add-place' ? 'text-[#B8962E] bg-[#F8FAFC]' : 'text-[#64748B] hover:text-[#0F172A]'}`} onClick={() => goTo('add-place')}>＋ إدراج معلم جديد</button>
                <button className={`p-2.5 text-xs font-bold text-right rounded-lg transition-all ${view === 'places' ? 'text-[#B8962E] bg-[#F8FAFC]' : 'text-[#64748B] hover:text-[#0F172A]'}`} onClick={() => goTo('places')}>📋 قاعدة بيانات المعالم</button>
              </div>
            )}
          </div>

          <button className={`flex items-center gap-3.5 p-3.5 text-sm font-bold rounded-xl text-right transition-all ${view === 'heritage' ? 'bg-[#F8FAFC] text-[#B8962E] shadow-sm ring-1 ring-[#E2E8F0]' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'}`} onClick={() => goTo('heritage')}>
            <span className="text-lg">🏺</span> السجل التراثي للوادي
          </button>

          <button className={`flex items-center gap-3.5 p-3.5 text-sm font-bold rounded-xl text-right transition-all ${view === 'memories' ? 'bg-[#F8FAFC] text-[#B8962E] shadow-sm ring-1 ring-[#E2E8F0]' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'}`} onClick={() => goTo('memories')}>
            <span className="text-lg">📸</span> ذكريات الزوار
            {pendingMemoriesCount > 0 && (
              <span className="mr-auto bg-[#EF4444] text-white text-[10px] px-2.5 py-1 rounded-full font-black shadow-sm animate-pulse">{pendingMemoriesCount} معلق</span>
            )}
          </button>

          <button className={`flex items-center gap-3.5 p-3.5 text-sm font-bold rounded-xl text-right transition-all ${view === 'feedback' ? 'bg-[#F8FAFC] text-[#B8962E] shadow-sm ring-1 ring-[#E2E8F0]' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'}`} onClick={() => goTo('feedback')}>
            <span className="text-lg">💬</span> الآراء والشكاوى
          </button>

          <div className="my-2 border-t border-[#F1F5F9]"></div>

          <button className={`flex items-center gap-3.5 p-3.5 text-sm font-bold rounded-xl text-right transition-all ${view === 'admins' ? 'bg-[#F8FAFC] text-[#B8962E] shadow-sm ring-1 ring-[#E2E8F0]' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'}`} onClick={() => goTo('admins')}>
            <span className="text-lg">🛡️</span> إدارة الصلاحيات
          </button>

        </nav>

        <div className="mt-6 pt-4 border-t border-[#F1F5F9] space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center font-black text-[#0F172A] text-sm">ن</div>
            <div>
              <p className="text-[#0F172A] text-sm font-black">{CURRENT_USER.name}</p>
              <p className="text-[11px] text-[#64748B] font-bold mt-0.5">{CURRENT_USER.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-bold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] rounded-lg transition-colors">
            🚪 تسجيل الخروج
          </button>
        </div>
      </aside>

      {mobileSidebarOpen && <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)} />}

      {/* ===================== المحتوى الرئيسي ===================== */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">

        {/* ---------- الرأس العلوي ---------- */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] px-8 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-[#64748B] bg-[#F1F5F9] rounded-lg md:hidden">☰</button>

          <div className="hidden sm:flex flex-col">
            <h2 className="text-lg font-black text-[#0F172A]">نظام إدارة المنصة</h2>
            <p className="text-xs text-[#64748B] font-medium">الإصدار الرسمي للعرض التقديمي</p>
          </div>

          <div className="flex items-center gap-4 mr-auto relative">
            <Link href="/" className="text-sm font-bold text-[#D4AF37] hover:text-[#B8962E] hidden sm:block bg-[#FFFBEB] px-4 py-2 rounded-lg border border-[#FDE68A] transition-colors">
              معاينة المنصة ↗
            </Link>

            <span className={`text-xs font-black px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${dbOnline ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]' : 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'}`}>
              <span className={`w-2 h-2 rounded-full ${dbOnline ? 'bg-[#10B981] animate-pulse' : 'bg-[#EF4444]'}`} />
              الخادم {dbOnline ? 'متصل' : 'مفصول'}
            </span>

            <div className="relative">
              <button onClick={() => setSiteMenuOpen(!siteMenuOpen)} disabled={updatingSiteStatus} className={`text-xs font-black px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60 ${SITE_STATUS_MAP[siteStatus].badge}`}>
                {updatingSiteStatus ? 'جارٍ التحديث...' : SITE_STATUS_MAP[siteStatus].text}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {siteMenuOpen && (
                <div className="absolute left-0 mt-3 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  <button disabled={updatingSiteStatus} className="w-full text-right px-4 py-3 text-sm text-[#0F172A] hover:bg-[#F8FAFC] font-bold disabled:opacity-50" onClick={() => changeSiteStatus('online')}>🟢 التشغيل العام {siteStatus === 'online' && '✓'}</button>
                  <button disabled={updatingSiteStatus} className="w-full text-right px-4 py-3 text-sm text-[#0F172A] hover:bg-[#F8FAFC] font-bold disabled:opacity-50" onClick={() => changeSiteStatus('maintenance')}>🟠 وضع الصيانة {siteStatus === 'maintenance' && '✓'}</button>
                  <button disabled={updatingSiteStatus} className="w-full text-right px-4 py-3 text-sm text-[#DC2626] hover:bg-[#FEF2F2] font-bold disabled:opacity-50" onClick={() => changeSiteStatus('offline')}>🔴 إيقاف النظام {siteStatus === 'offline' && '✓'}</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---------- محتوى الصفحات ---------- */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto">

          {/* 1. المركز الإحصائي */}
          {view === 'overview' && (
            <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
              <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-[#0F172A]">المركز الإحصائي العام</h1>
                  <p className="text-[#64748B] text-sm mt-2 font-medium">ملخص فوري لبيانات منصة "سوف 360" الذكية.</p>
                </div>
                <div className="hidden sm:block text-5xl">📊</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'إجمالي المعالم', count: places.length, icon: '📍', color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]' },
                  { title: 'العناصر التراثية', count: heritageItems.length, icon: '🏺', color: 'text-[#D4AF37]', bg: 'bg-[#FFFBEB]' },
                  { title: 'الذكريات المعلقة', count: pendingMemoriesCount, icon: '📸', color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]', alert: pendingMemoriesCount > 0 },
                  { title: 'رسائل الجمهور', count: feedbacks.length, icon: '💬', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-white p-6 rounded-2xl border ${stat.alert ? 'border-[#FECACA] ring-2 ring-[#FEE2E2]' : 'border-[#E2E8F0]'} shadow-sm flex flex-col relative`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${stat.bg}`}>{stat.icon}</div>
                    <h3 className="text-[#64748B] text-sm font-bold mb-1">{stat.title}</h3>
                    <p className={`text-4xl font-black ${stat.color}`}>{isLoading ? '...' : stat.count}</p>
                    {stat.alert && <span className="absolute top-6 left-6 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. إدراج معلم */}
          {view === 'add-place' && <div className="max-w-5xl mx-auto"><AddPlaceForm /></div>}

          {/* 3. قاعدة بيانات المعالم */}
          {view === 'places' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden max-w-7xl mx-auto animate-fade-in">
              <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
                <h2 className="text-xl font-black text-[#0F172A]">السجل الموحد للمعالم السياحية</h2>
                <button onClick={() => goTo('add-place')} className="bg-[#D4AF37] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#B8962E] transition-colors shadow-sm">＋ إضافة سجل</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-white text-[#64748B] border-b-2 border-[#F1F5F9]">
                    <tr><th className="p-5 font-bold">اسم المعلم</th><th className="p-5 font-bold">التصنيف الرئيسي</th><th className="p-5 font-bold">حالة الظهور</th><th className="p-5 font-bold text-left">إدارة السجل</th></tr>
                  </thead>
                  <tbody>
                    {places.length === 0 && !isLoading && (
                      <tr><td colSpan={4} className="p-10 text-center text-[#94A3B8] font-bold">لا توجد سجلات معالم حتى الآن</td></tr>
                    )}
                    {places.map(p => (
                      <tr key={p.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-5 font-black text-[#0F172A]">{p.name}</td>
                        <td className="p-5 text-[#475569] font-medium">{p.main_category}</td>
                        <td className="p-5">
                          <button onClick={() => togglePlaceStatus(p)} className={`px-4 py-1.5 rounded-md text-xs font-black transition-all border ${p.status === 'منشور' ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'}`}>{p.status || 'مسودة'}</button>
                        </td>
                        <td className="p-5 text-left">
                          <button onClick={() => deleteItem('places', p.id, setPlaces)} className="text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-4 py-1.5 rounded-md text-xs font-bold transition-colors">حذف نهائي</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. السجل التراثي */}
          {view === 'heritage' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-[#0F172A]">التوثيق التراثي</h2>
                  <p className="text-sm text-[#64748B] mt-1">إدارة عناصر عادات وتقاليد الوادي</p>
                </div>
                <button onClick={() => setShowHeritageForm(true)} className="bg-[#D4AF37] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#B8962E] transition-colors shadow-sm">＋ توثيق عنصر جديد</button>
              </div>

              {heritageItems.length === 0 && !isLoading && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center text-[#94A3B8] font-bold">لا توجد عناصر تراثية موثقة بعد</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {heritageItems.map(h => (
                  <div key={h.id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
                    <img src={h.image} alt={h.title} className="w-full h-40 object-cover" />
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-black text-[#0F172A] text-base mb-2">{h.title}</h3>
                      <p className="text-sm text-[#64748B] leading-relaxed flex-1 line-clamp-3">{h.text}</p>
                      <button onClick={() => deleteItem('heritage', h.id, setHeritageItems)} className="mt-4 text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-4 py-2 rounded-lg text-xs font-bold transition-colors self-start">حذف العنصر</button>
                    </div>
                  </div>
                ))}
              </div>

              {showHeritageForm && (
                <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeHeritageForm}>
                  <form onSubmit={submitHeritageForm} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-5">
                    <h3 className="text-lg font-black text-[#0F172A]">توثيق عنصر تراثي جديد</h3>

                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1.5">عنوان العنصر</label>
                      <input required value={heritageForm.title} onChange={(e) => setHeritageForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="مثال: النقش الأمازيغي التقليدي" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1.5">صورة العنصر</label>
                      <div className="flex gap-3">
                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-[#E2E8F0] rounded-lg px-4 py-3 text-xs font-bold text-[#64748B] hover:border-[#D4AF37] hover:text-[#B8962E] transition-colors">
                          📁 من الهاتف / الحاسوب
                          <input type="file" accept="image/*" onChange={handleHeritageImageChange} className="hidden" />
                        </label>
                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-[#E2E8F0] rounded-lg px-4 py-3 text-xs font-bold text-[#64748B] hover:border-[#D4AF37] hover:text-[#B8962E] transition-colors">
                          📷 التقاط مباشر
                          <input type="file" accept="image/*" capture="environment" onChange={handleHeritageImageChange} className="hidden" />
                        </label>
                      </div>
                      {heritageImagePreview ? (
                        <img src={heritageImagePreview} alt="معاينة" className="mt-3 w-full h-36 object-cover rounded-lg border border-[#E2E8F0]" />
                      ) : (
                        <p className="text-[11px] text-[#94A3B8] font-medium mt-2">إن لم تختر صورة، سيتم استخدام صورة افتراضية.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1.5">الوصف التفصيلي</label>
                      <textarea required value={heritageForm.text} onChange={(e) => setHeritageForm(f => ({ ...f, text: e.target.value }))} rows={4} className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none" placeholder="اكتب وصفًا للعنصر التراثي..." />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={uploadingImage} className="flex-1 bg-[#D4AF37] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#B8962E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">{uploadingImage ? 'جارٍ الحفظ...' : 'حفظ التوثيق'}</button>
                      <button type="button" onClick={closeHeritageForm} disabled={uploadingImage} className="flex-1 bg-[#F1F5F9] text-[#334155] py-2.5 rounded-lg text-sm font-bold hover:bg-[#E2E8F0] transition-colors disabled:opacity-60">إلغاء</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* 5. ذكريات الزوار */}
          {view === 'memories' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <h2 className="text-xl font-black text-[#0F172A]">ذكريات الزوار</h2>
                <p className="text-sm text-[#64748B] mt-1">مراجعة واعتماد الصور والقصص المرسلة من الزوار</p>
              </div>

              {memories.length === 0 && !isLoading && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center text-[#94A3B8] font-bold">لا توجد ذكريات مرسلة بعد</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {memories.map(m => (
                  <div key={m.id} className={`bg-white rounded-2xl border ${m.approved ? 'border-[#E2E8F0]' : 'border-[#FDE68A] ring-2 ring-[#FFFBEB]'} shadow-sm overflow-hidden flex flex-col`}>
                    {m.image && <img src={m.image} alt="ذكرى زائر" className="w-full h-40 object-cover" />}
                    <div className="p-5 flex flex-col flex-1 gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#0F172A] text-sm">{m.visitor_name || 'زائر مجهول'}</span>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${m.approved ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#FFFBEB] text-[#B45309]'}`}>{m.approved ? 'منشور' : 'بانتظار المراجعة'}</span>
                      </div>
                      <p className="text-sm text-[#64748B] leading-relaxed flex-1 line-clamp-3">{m.story || m.text}</p>
                      <div className="flex gap-2 pt-2">
                        {!m.approved && (
                          <button onClick={() => approveMemory(m.id)} className="flex-1 bg-[#ECFDF5] text-[#065F46] hover:bg-[#D1FAE5] px-4 py-2 rounded-lg text-xs font-bold transition-colors">اعتماد ونشر</button>
                        )}
                        <button onClick={() => deleteItem('memories', m.id, setMemories)} className="flex-1 text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-4 py-2 rounded-lg text-xs font-bold transition-colors">حذف</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. الآراء والشكاوى */}
          {view === 'feedback' && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden max-w-7xl mx-auto animate-fade-in">
              <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h2 className="text-xl font-black text-[#0F172A]">آراء وشكاوى الجمهور</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-white text-[#64748B] border-b-2 border-[#F1F5F9]">
                    <tr><th className="p-5 font-bold">المرسل</th><th className="p-5 font-bold">الرسالة</th><th className="p-5 font-bold text-left">إدارة</th></tr>
                  </thead>
                  <tbody>
                    {feedbacks.length === 0 && !isLoading && (
                      <tr><td colSpan={3} className="p-10 text-center text-[#94A3B8] font-bold">لا توجد رسائل حتى الآن</td></tr>
                    )}
                    {feedbacks.map(f => (
                      <tr key={f.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors align-top">
                        <td className="p-5 font-black text-[#0F172A] whitespace-nowrap">{f.name || 'مجهول'}</td>
                        <td className="p-5 text-[#475569] font-medium">{f.message}</td>
                        <td className="p-5 text-left">
                          <button onClick={() => deleteItem('feedbacks', f.id, setFeedbacks)} className="text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-4 py-1.5 rounded-md text-xs font-bold transition-colors">حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. إدارة الصلاحيات */}
          {view === 'admins' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-[#0F172A]">إدارة الصلاحيات</h2>
                  <p className="text-sm text-[#64748B] mt-1">إضافة وإدارة حسابات المشرفين على المنصة</p>
                </div>
                <button onClick={() => setShowAdminForm(true)} className="bg-[#D4AF37] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#B8962E] transition-colors shadow-sm">＋ إضافة مشرف</button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-white text-[#64748B] border-b-2 border-[#F1F5F9]">
                      <tr><th className="p-5 font-bold">الاسم</th><th className="p-5 font-bold">البريد الإلكتروني</th><th className="p-5 font-bold">الصلاحية</th><th className="p-5 font-bold">الحالة</th><th className="p-5 font-bold text-left">إدارة</th></tr>
                    </thead>
                    <tbody>
                      {admins.length === 0 && !isLoading && (
                        <tr><td colSpan={5} className="p-10 text-center text-[#94A3B8] font-bold">لا يوجد مشرفون مسجلون</td></tr>
                      )}
                      {admins.map(a => (
                        <tr key={a.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                          <td className="p-5 font-black text-[#0F172A]">{a.name}</td>
                          <td className="p-5 text-[#475569] font-medium">{a.email}</td>
                          <td className="p-5 text-[#475569] font-medium">{a.role}</td>
                          <td className="p-5">
                            <span className={`px-4 py-1.5 rounded-md text-xs font-black border ${a.active ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'}`}>{a.active ? 'نشط' : 'موقوف'}</span>
                          </td>
                          <td className="p-5 text-left">
                            <button onClick={() => deleteItem('admins', a.id, setAdmins)} className="text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-4 py-1.5 rounded-md text-xs font-bold transition-colors">إزالة</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {showAdminForm && (
                <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdminForm(false)}>
                  <form onSubmit={submitAdminForm} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-5">
                    <h3 className="text-lg font-black text-[#0F172A]">إضافة مشرف جديد</h3>

                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1.5">الاسم الكامل</label>
                      <input required value={adminForm.name} onChange={(e) => setAdminForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="الاسم الكامل" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1.5">البريد الإلكتروني</label>
                      <input required type="email" value={adminForm.email} onChange={(e) => setAdminForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="example@domain.com" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1.5">الصلاحية</label>
                      <select value={adminForm.role} onChange={(e) => setAdminForm(f => ({ ...f, role: e.target.value }))} className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
                        <option value="مشرف">مشرف</option>
                        <option value="محرر">محرر</option>
                        <option value="مدير">مدير</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2.5 text-sm font-bold text-[#334155]">
                      <input type="checkbox" checked={adminForm.active} onChange={(e) => setAdminForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-[#D4AF37]" />
                      حساب نشط فور الإنشاء
                    </label>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-[#D4AF37] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#B8962E] transition-colors">اعتماد المشرف</button>
                      <button type="button" onClick={() => setShowAdminForm(false)} className="flex-1 bg-[#F1F5F9] text-[#334155] py-2.5 rounded-lg text-sm font-bold hover:bg-[#E2E8F0] transition-colors">إلغاء</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}