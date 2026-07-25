'use client';

import { useState, useEffect, useRef } from 'react';
// تأكد من مسار ملف Supabase الخاص بك
// import { supabase } from '@/lib/supabase/client';

const CATEGORIES = {
  'معلم طبيعي': [],
  'معلم ديني': [],
  'معلم تراثي': [],
  'مرافق صحية': ['مستشفيات', 'مصحات خاصة', 'مركز التصوير الإشعاعي', 'أطباء مختصون وعيادات خاصة', 'مراكز التأهيل', 'صيدليات', 'شبه صيدلي'],
  'مطاعم': ['تقليدي', 'عصري', 'مختلط', 'أكل سريع', 'أكلات شعبية', 'مقاهي'],
  'فنادق ومنتجعات': ['فنادق', 'منتجعات', 'مراقد']
};

// إحداثيات افتراضية (مدينة الوادي كنقطة انطلاق) — غيّرها حسب منطقتك
const DEFAULT_CENTER = { lat: 33.3683, lng: 6.8674 };

export default function AddPlaceForm() {
  const [formData, setFormData] = useState({
    name: '',
    main_category: '',
    sub_category: '',
    description: '',
    address: '',
    district: '',
    municipality: '',
    lat: '',
    lng: '',
    map_link: '',
    phone: '',
    website: '',
    facebook: '',
    instagram: '',
    opening_hours: '',
    status: 'منشور',
  });

  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- حالة الخريطة ---
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // تصفير التصنيف الفرعي عند تغيير التصنيف الرئيسي
    if (name === 'main_category') {
      setFormData(prev => ({ ...prev, sub_category: '' }));
    }
  };

  // ===================================================================
  // تحميل مكتبة Leaflet (خرائط مجانية بدون مفتاح API) وتهيئة الخريطة
  // ===================================================================
  useEffect(() => {
    let cancelled = false;

    function initMap() {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;
      const L = window.L;

      const startLat = formData.lat ? parseFloat(formData.lat) : DEFAULT_CENTER.lat;
      const startLng = formData.lng ? parseFloat(formData.lng) : DEFAULT_CENTER.lng;

      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: formData.lat ? 15 : 12,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map);

      // تحديث الحقول عند سحب العلامة (Pin)
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        applyCoords(lat, lng);
      });

      // تحديث موقع العلامة عند الضغط على أي مكان بالخريطة (سهل على الهاتف)
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        applyCoords(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);

      // إصلاح شائع: الخريطة تظهر مشوهة أول مرة داخل حاويات مرنة (flex/hidden)
      setTimeout(() => map.invalidateSize(), 200);
    }

    if (window.L) {
      initMap();
    } else {
      // إدراج CSS الخاص بـ Leaflet
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      // إدراج سكريبت Leaflet
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        document.getElementById('leaflet-js').addEventListener('load', initMap);
      }
    }

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحديث موقع العلامة يدويًا إن كتب المستخدم الإحداثيات مباشرة في الحقول
  useEffect(() => {
    if (mapReady && markerRef.current && formData.lat && formData.lng) {
      const lat = parseFloat(formData.lat);
      const lng = parseFloat(formData.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const current = markerRef.current.getLatLng();
        if (Math.abs(current.lat - lat) > 0.00005 || Math.abs(current.lng - lng) > 0.00005) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.panTo([lat, lng]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.lat, formData.lng, mapReady]);

  const applyCoords = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));
  };

  // زر "استخدم موقعي الحالي" — مفيد جدًا عند التصوير الميداني من الهاتف
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        applyCoords(latitude, longitude);
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapRef.current.setView([latitude, longitude], 16);
        }
        setLocating(false);
      },
      () => {
        alert('تعذر الحصول على الموقع. تأكد من تفعيل صلاحية الموقع.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --- دوال الصور ---
  const addFiles = (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }))]);
  };

  const handleImageUpload = (e) => {
    addFiles(e.target.files);
    e.target.value = ''; // للسماح باختيار نفس الملف مرة أخرى لاحقًا
  };

  const handleCameraCapture = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (idToRemove) => {
    setImages(prev => prev.filter(img => img.id !== idToRemove));
  };

  const moveImage = (index, direction) => {
    setImages(prev => {
      const newArr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= newArr.length) return prev;
      [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
      return newArr;
    });
  };

  // ترتيب بالسحب (Drag & Drop) بين الصور نفسها لسطح المكتب
  const dragImageIndex = useRef(null);
  const handleImageDragStart = (index) => { dragImageIndex.current = index; };
  const handleImageDragOver = (e) => e.preventDefault();
  const handleImageDropReorder = (index) => {
    const from = dragImageIndex.current;
    if (from === null || from === index) return;
    setImages(prev => {
      const newArr = [...prev];
      const [moved] = newArr.splice(from, 1);
      newArr.splice(index, 0, moved);
      return newArr;
    });
    dragImageIndex.current = null;
  };

  // --- دالة الحفظ وإرسال البيانات ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. رفع الصور إلى Storage (أمثلة وهمية هنا لتوضيح الفكرة)
      // في التطبيق الحقيقي: استخدم supabase.storage.from('images').upload(...) لكل images[i].file
      // مع الحفاظ على ترتيب المصفوفة الحالي (images) لأنه هو الترتيب الذي اختاره المستخدم
      const imageUrlsArray = images.map((img, i) => `https://fake-link.com/image-${i}.jpg`);

      // 2. تجهيز البيانات للإرسال
      const placeDataToInsert = {
        ...formData,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        image_url: JSON.stringify(imageUrlsArray), // تحويل مصفوفة الروابط إلى نص JSON
      };

      console.log('البيانات الجاهزة:', placeDataToInsert);

      /*
      // 3. الإرسال الفعلي لـ Supabase
      const { error } = await supabase.from('places').insert([placeDataToInsert]);
      if (error) throw error;
      alert('تمت إضافة المعلم بنجاح!');
      */

    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء الإضافة!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-8 bg-[#111] text-gray-200 rounded-xl" dir="rtl">

      {/* الترويسة والحالة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
        <h2 className="text-2xl font-bold text-green-500">إضافة معلم جديد</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm">حالة المعلم:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="p-2 rounded bg-[#333] border border-gray-600 focus:border-green-500 outline-none"
          >
            <option value="منشور">منشور (يظهر للعامة)</option>
            <option value="مسودة">مسودة (مخفي)</option>
          </select>
        </div>
      </div>

      {/* 1. المعلومات الأساسية */}
      <fieldset className="flex flex-col gap-4 border border-[#333] p-5 rounded-lg bg-[#1a1a1a]">
        <legend className="text-lg font-semibold text-green-400 px-3">المعلومات الأساسية والتصنيف</legend>

        <div className="flex flex-col gap-1">
          <label>اسم المعلم <span className="text-red-500">*</span></label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" required />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <label>التصنيف الرئيسي <span className="text-red-500">*</span></label>
            <select name="main_category" value={formData.main_category} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" required>
              <option value="">-- اختر الصنف --</option>
              {Object.keys(CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {formData.main_category && CATEGORIES[formData.main_category].length > 0 && (
            <div className="flex flex-col gap-1 w-full sm:w-1/2">
              <label>التصنيف الفرعي <span className="text-red-500">*</span></label>
              <select name="sub_category" value={formData.sub_category} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" required>
                <option value="">-- اختر --</option>
                {CATEGORIES[formData.main_category].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <label>نبذة عن المعلم (التفاصيل)</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none placeholder-gray-500" placeholder="اكتب وصفاً مختصراً..."></textarea>
        </div>
      </fieldset>

      {/* 2. الموقع والعنوان */}
      <fieldset className="flex flex-col gap-4 border border-[#333] p-5 rounded-lg bg-[#1a1a1a]">
        <legend className="text-lg font-semibold text-green-400 px-3">العنوان والموقع الجغرافي</legend>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1 w-full sm:w-1/3">
            <label>الدائرة</label>
            <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" placeholder="مثال: الوادي" />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-1/3">
            <label>البلدية</label>
            <input type="text" name="municipality" value={formData.municipality} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" placeholder="مثال: الوادي" />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-1/3">
            <label>العنوان المفصل</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" placeholder="الشارع، الحي..." />
          </div>
        </div>

        {/* --- خريطة تحديد الموقع بالضغط (Pin) --- */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <label>حدد الموقع على الخريطة (اضغط أو اسحب العلامة)</label>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="text-sm bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5"
            >
              {locating ? 'جاري التحديد...' : '📍 استخدم موقعي الحالي'}
            </button>
          </div>
          <div
            ref={mapContainerRef}
            className="w-full h-[320px] rounded-lg border border-gray-700 overflow-hidden bg-[#222]"
          />
          <p className="text-gray-500 text-xs">اضغط في أي مكان بالخريطة لوضع العلامة، أو اسحبها لضبط الموقع بدقة — يعمل باللمس على الهاتف.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <label>خط العرض (Latitude)</label>
            <input type="number" name="lat" step="any" value={formData.lat} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <label>خط الطول (Longitude)</label>
            <input type="number" name="lng" step="any" value={formData.lng} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label>رابط خريطة قوقل (اختياري)</label>
          <input type="url" name="map_link" value={formData.map_link} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
        </div>
      </fieldset>

      {/* 3. معلومات الاتصال */}
      <fieldset className="flex flex-col gap-4 border border-[#333] p-5 rounded-lg bg-[#1a1a1a]">
        <legend className="text-lg font-semibold text-green-400 px-3">الروابط ومعلومات الاتصال</legend>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <label>رقم الهاتف</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <label>مواقيت العمل</label>
            <input type="text" name="opening_hours" value={formData.opening_hours} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" placeholder="مثال: 08:00 صباحاً - 04:00 مساءً" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="flex flex-col gap-1 w-full sm:w-1/3">
            <label>رابط الفيسبوك</label>
            <input type="url" name="facebook" value={formData.facebook} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-1/3">
            <label>رابط الانستغرام</label>
            <input type="url" name="instagram" value={formData.instagram} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-1/3">
            <label>الموقع الإلكتروني</label>
            <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
        </div>
      </fieldset>

      {/* 4. الصور */}
      <fieldset className="flex flex-col gap-4 border border-[#333] p-5 rounded-lg bg-[#1a1a1a]">
        <legend className="text-lg font-semibold text-green-400 px-3">صور المعلم</legend>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* رفع من الملفات (سطح المكتب أو معرض الهاتف) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative flex-1 p-6 border-2 border-dashed border-green-600/50 rounded-xl text-center hover:bg-[#222] transition bg-[#151515] flex flex-col items-center justify-center min-h-[130px]"
          >
            <svg className="w-10 h-10 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <p className="text-gray-400 font-medium">اسحب وأفلت الصور هنا</p>
            <p className="text-gray-600 text-sm mt-1">أو اضغط لاختيار صور من الجهاز</p>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>

          {/* تصوير مباشر من كاميرا الهاتف */}
          <div className="relative flex-1 p-6 border-2 border-dashed border-blue-600/50 rounded-xl text-center hover:bg-[#222] transition bg-[#151515] flex flex-col items-center justify-center min-h-[130px]">
            <svg className="w-10 h-10 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2"></circle></svg>
            <p className="text-gray-400 font-medium">التقط صورة مباشرة</p>
            <p className="text-gray-600 text-sm mt-1">يفتح كاميرا الهاتف مباشرة</p>
            <input type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>

        {images.length > 0 && (
          <div>
            <p className="text-gray-500 text-xs mb-2">اسحب الصور لإعادة الترتيب (سطح المكتب) أو استعمل الأسهم (الهاتف). أول صورة ستكون الصورة الرئيسية.</p>
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-thin">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleImageDragStart(idx)}
                  onDragOver={handleImageDragOver}
                  onDrop={() => handleImageDropReorder(idx)}
                  className="relative min-w-[130px] h-[130px] rounded-lg border border-gray-700 overflow-hidden shadow-lg group bg-[#222]"
                >
                  <img src={img.preview} alt={`preview-${idx}`} className="w-full h-full object-cover" />

                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-green-700 text-white text-[10px] px-2 py-0.5 rounded-full">رئيسية</span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-md"
                  >✕</button>

                  <div className="absolute bottom-0 inset-x-0 flex justify-between bg-black/60">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, -1)}
                      disabled={idx === 0}
                      className="flex-1 text-white text-sm py-1.5 disabled:opacity-30 hover:bg-white/10"
                    >➜</button>
                    <button
                      type="button"
                      onClick={() => moveImage(idx, 1)}
                      disabled={idx === images.length - 1}
                      className="flex-1 text-white text-sm py-1.5 disabled:opacity-30 hover:bg-white/10 border-r border-white/20"
                    >⟵</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      {/* زر الحفظ */}
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`font-bold py-4 px-12 rounded-lg shadow-lg transition-colors w-full sm:w-auto text-lg ${isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600 text-white'}`}
        >
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ المعلم في قاعدة البيانات'}
        </button>
      </div>
    </form>
  );
}