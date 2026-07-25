'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase/client';

// استدعاء مكون إضافة معلم الذي أنشأناه
import AddPlaceForm from '@/components/map/admin/AddPlaceForm'; 

/* ---------------------------------------------------------
   ثوابت عامة وأيقونات
   --------------------------------------------------------- */
const CURRENT_USER = { name: 'نجم يحياوي', role: 'مدير عام' };

const SITE_STATUS_MAP = {
  online: { text: 'الموقع يعمل', badge: 'bg-green-100 text-green-700 border border-green-300' },
  offline: { text: 'الموقع معطل', badge: 'bg-red-100 text-red-700 border border-red-300' },
  maintenance: { text: 'تحت الصيانة', badge: 'bg-yellow-100 text-yellow-700 border border-yellow-300' },
};

const IconChevron = ({ open }) => (
  <svg className="mr-auto transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function DashboardPage() {
  /* ---------- حالة التنقل ---------- */
  const [view, setView] = useState('overview'); // overview | add-place | places
  const [placesMenuOpen, setPlacesMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* ---------- حالة الموقع وقاعدة البيانات ---------- */
  const [dbOnline, setDbOnline] = useState(true);
  const [siteStatus, setSiteStatus] = useState('online');
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  /* ---------- بيانات المعالم ---------- */
  const [places, setPlaces] = useState([]);
  const [totalPlaces, setTotalPlaces] = useState(0);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);

  /* ---------- جلب البيانات ---------- */
  useEffect(() => {
    fetchPlaces();
  }, [view]); // أضفنا view لكي يتم تحديث القائمة تلقائياً عند فتحها

  async function fetchPlaces() {
    setIsLoadingPlaces(true);
    const { data, error, count } = await supabase
      .from('places')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false }); // ترتيب من الأحدث للأقدم
      
    if (!error) {
      setPlaces(data || []);
      setTotalPlaces(count || 0);
      setDbOnline(true);
    } else {
      setDbOnline(false);
      console.error(error);
    }
    setIsLoadingPlaces(false);
  }

  /* ---------- إجراءات المعالم ---------- */
  async function togglePlaceStatus(place) {
    const newStatus = place.status === 'منشور' ? 'مسودة' : 'منشور';
    const { error } = await supabase.from('places').update({ status: newStatus }).eq('id', place.id);
    if (!error) {
      setPlaces(prev => prev.map(p => p.id === place.id ? { ...p, status: newStatus } : p));
      showToast(newStatus === 'منشور' ? 'تم نشر المعلم' : 'تم تحويل المعلم إلى مسودة');
    } else {
      showToast('حدث خطأ أثناء تحديث الحالة');
    }
  }

  async function deletePlace(id) {
    const isConfirmed = window.confirm('هل أنت متأكد من حذف هذا المعلم نهائياً؟');
    if (!isConfirmed) return;

    const { error } = await supabase.from('places').delete().eq('id', id);
    if (!error) {
      setPlaces(prev => prev.filter(p => p.id !== id));
      setTotalPlaces(prev => prev - 1);
      showToast('تم الحذف بنجاح');
    } else {
      showToast('حدث خطأ أثناء الحذف');
    }
  }

  /* ---------- دوال مساعدة ---------- */
  function showToast(msg) {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }

  function goTo(v) {
    setView(v);
    setMobileSidebarOpen(false);
  }

  function changeSiteStatus(status) {
    setSiteStatus(status);
    setSiteMenuOpen(false);
    showToast('تم تحديث حالة الموقع إلى: ' + SITE_STATUS_MAP[status].text);
  }

  const siteStatusInfo = SITE_STATUS_MAP[siteStatus];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans" dir="rtl">
      
      {/* نظام التنبيهات (Toasts) */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-gray-800 text-white px-4 py-2 rounded shadow-lg text-sm">
            {t.msg}
          </div>
        ))}
      </div>

      <div className="flex min-h-screen">
        
        {/* ===================== الشريط الجانبي ===================== */}
        <aside className={`${mobileSidebarOpen ? 'block fixed inset-y-0 right-0 z-40' : 'hidden md:flex'} w-64 bg-[#241705] flex-col py-5 px-3 shadow-xl transition-transform`}>
          
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-600 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 20c3-6 6-9 8-16 2 7 5 10 8 16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M2 20h20" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-white font-extrabold text-sm">سوف 360</p>
              <p className="text-xs text-gray-400">لوحة الإدارة</p>
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="mr-auto text-white md:hidden">✕</button>
          </div>
          
          <hr className="border-gray-700 mx-2 mb-4" />

          <nav className="flex-1 flex flex-col gap-2">
            <button 
              className={`flex items-center gap-3 p-3 text-sm font-medium rounded-lg text-right transition ${view === 'overview' ? 'bg-yellow-600/20 text-yellow-500' : 'text-gray-300 hover:bg-white/5'}`} 
              onClick={() => goTo('overview')}
            >
              📊 لوحة المعلومات
            </button>

            <div>
              <button 
                className="w-full flex items-center gap-3 p-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/5 text-right" 
                onClick={() => setPlacesMenuOpen(!placesMenuOpen)}
              >
                📍 إدارة المعالم
                <IconChevron open={placesMenuOpen} />
              </button>
              
              {placesMenuOpen && (
                <div className="flex flex-col gap-1 pr-8 mt-1 border-r border-gray-700">
                  <button 
                    className={`p-2 text-xs text-right rounded transition ${view === 'add-place' ? 'text-yellow-500 bg-white/5' : 'text-gray-400 hover:text-white'}`} 
                    onClick={() => goTo('add-place')}
                  >
                    ＋ إضافة معلم جديد
                  </button>
                  <button 
                    className={`p-2 text-xs text-right rounded transition ${view === 'places' ? 'text-yellow-500 bg-white/5' : 'text-gray-400 hover:text-white'}`} 
                    onClick={() => goTo('places')}
                  >
                    📋 قائمة وتعديل المعالم
                  </button>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {mobileSidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)} />}

        {/* ===================== المحتوى الرئيسي ===================== */}
        <div className="flex-1 min-w-0 bg-gray-50 overflow-y-auto max-h-screen">

          {/* ---------- الرأس العلوي (Header) ---------- */}
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
            <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-gray-600 bg-gray-100 rounded md:hidden">
              ☰
            </button>

            <Link href="/" className="text-sm font-semibold text-gray-700 hover:text-black hidden sm:block">
              ← الرجوع إلى الموقع
            </Link>

            <div className="flex items-center gap-3 mr-auto relative">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 ${dbOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <span className={`w-2 h-2 rounded-full ${dbOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {dbOnline ? 'متصل بقاعدة البيانات' : 'انقطع الاتصال'}
              </span>
              
              <div className="relative">
                <button 
                  onClick={() => setSiteMenuOpen(!siteMenuOpen)} 
                  className={`text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2 cursor-pointer ${siteStatusInfo.badge}`}
                >
                  {siteStatusInfo.text}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" /></svg>
                </button>

                {siteMenuOpen && (
                  <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <button className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100" onClick={() => changeSiteStatus('online')}>🟢 الموقع يعمل</button>
                    <button className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100" onClick={() => changeSiteStatus('maintenance')}>🟠 تحت الصيانة</button>
                    <button className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => changeSiteStatus('offline')}>🔴 إيقاف الموقع</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ---------- محتوى الصفحات ---------- */}
          <main className="p-4 sm:p-6">
            
            {/* 1. صفحة لوحة المعلومات (الإحصائيات) */}
            {view === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">نظرة عامة على الإحصائيات</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl">📍</div>
                    <h3 className="text-gray-500 text-sm font-bold">إجمالي المعالم المسجلة</h3>
                    <p className="text-3xl font-black text-gray-800 mt-2">{totalPlaces}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center opacity-70">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-2xl">👁️</div>
                    <h3 className="text-gray-500 text-sm font-bold">عدد الزوار (تقريبي)</h3>
                    <p className="text-lg font-bold text-gray-400 mt-2 bg-gray-100 px-3 py-1 rounded-full">تحت التطوير ⏳</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. صفحة إضافة معلم */}
            {view === 'add-place' && (
              <div className="animate-fade-in">
                <AddPlaceForm />
              </div>
            )}

            {/* 3. صفحة عرض قائمة المعالم */}
            {view === 'places' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-800">قائمة المعالم المسجلة</h2>
                  <button onClick={() => goTo('add-place')} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                    + إضافة معلم جديد
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {isLoadingPlaces ? (
                    <div className="p-12 text-center text-gray-500 font-medium">
                      جاري تحميل المعالم من قاعدة البيانات...
                    </div>
                  ) : places.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                      <span className="text-6xl mb-4">📭</span>
                      <h3 className="text-xl font-bold text-gray-700">قاعدة البيانات فارغة حالياً</h3>
                      <p className="text-gray-500 mt-2">لم تقم بإضافة أي معلم سياحي بعد، يمكنك البدء الآن.</p>
                      <button onClick={() => goTo('add-place')} className="mt-6 border border-yellow-600 text-yellow-700 hover:bg-yellow-50 px-6 py-2 rounded-lg font-bold transition">
                        إضافة أول معلم
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="p-4 text-gray-600 font-semibold">اسم المعلم</th>
                            <th className="p-4 text-gray-600 font-semibold">التصنيف</th>
                            <th className="p-4 text-gray-600 font-semibold">البلدية</th>
                            <th className="p-4 text-gray-600 font-semibold">الحالة</th>
                            <th className="p-4 text-gray-600 font-semibold text-left">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {places.map(place => (
                            <tr key={place.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                              <td className="p-4 font-bold text-gray-800">{place.name}</td>
                              <td className="p-4 text-gray-600">
                                {place.main_category} {place.sub_category ? `> ${place.sub_category}` : ''}
                              </td>
                              <td className="p-4 text-gray-600">{place.municipality || 'غير محدد'}</td>
                              <td className="p-4">
                                <button 
                                  onClick={() => togglePlaceStatus(place)}
                                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${place.status === 'منشور' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                  {place.status || 'مسودة'}
                                </button>
                              </td>
                              <td className="p-4 flex gap-2 justify-end">
                                <button className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 font-medium" title="تعديل">
                                  تعديل
                                </button>
                                <button onClick={() => deletePlace(place.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 font-medium" title="حذف">
                                  حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
       }
