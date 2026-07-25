'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase/client';
import AddPlaceForm from '@/components/map/admin/AddPlaceForm'; 

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
  /* ---------- حالة التنقل ---------- */
  const [view, setView] = useState('overview'); 
  const [placesMenuOpen, setPlacesMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* ---------- حالة النظام ---------- */
  const [dbOnline, setDbOnline] = useState(true);
  const [siteStatus, setSiteStatus] = useState('online');
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
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
  }

  function changeSiteStatus(status) {
    setSiteStatus(status);
    setSiteMenuOpen(false);
    showToast('تم تحديث حالة النظام إلى: ' + SITE_STATUS_MAP[status].text);
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

  async function submitHeritageForm(e) {
    e.preventDefault();
    const dataToSave = { title: heritageForm.title, text: heritageForm.text, image: heritageForm.image || 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400' };
    const { data, error } = await supabase.from('heritage').insert([dataToSave]).select();
    if (!error && data) {
      setHeritageItems(prev => [data[0], ...prev]);
      showToast('تم توثيق العنصر التراثي بنجاح');
      setShowHeritageForm(false);
      setHeritageForm(EMPTY_HERITAGE_FORM);
    } else showToast('خطأ في قاعدة البيانات');
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

        <div className="mt-6 pt-4 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center font-black text-[#0F172A] text-sm">ن</div>
            <div>
              <p className="text-[#0F172A] text-sm font-black">{CURRENT_USER.name}</p>
              <p className="text-[11px] text-[#64748B] font-bold mt-0.5">{CURRENT_USER.role}</p>
            </div>
          </div>
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
              <button onClick={() => setSiteMenuOpen(!siteMenuOpen)} className={`text-xs font-black px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${SITE_STATUS_MAP[siteStatus].badge}`}>
                {SITE_STATUS_MAP[siteStatus].text}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {siteMenuOpen && (
                <div className="absolute left-0 mt-3 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  <button className="w-full text-right px-4 py-3 text-sm text-[#0F172A] hover:bg-[#F8FAFC] font-bold" onClick={() => changeSiteStatus('online')}>🟢 التشغيل العام</button>
                  <button className="w-full text-right px-4 py-3 text-sm text-[#0F172A] hover:bg-[#F8FAFC] font-bold" onClick={() => changeSiteStatus('maintenance')}>🟠 وضع الصيانة</button>
                  <button className="w-full text-right px-4 py-3 text-sm text-[#DC2626] hover:bg-[#FEF2F2] font-bold" onClick={() => changeSiteStatus('offline')}>🔴 إيقاف النظام</button>
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
 