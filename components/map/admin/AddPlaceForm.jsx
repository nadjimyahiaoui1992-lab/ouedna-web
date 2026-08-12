'use client';

import { useState, useEffect, useRef } from 'react';
import { OpenLocationCode } from 'open-location-code';
import { supabase } from '@/lib/supabase/client'; // عدّل هذا المسار إذا كان ملف supabase عندك في مكان مختلف
// ملاحظة: خاصية Plus Code تحتاج تثبيت المكتبة أولاً:  npm install open-location-code

const olc = new OpenLocationCode();

const CATEGORIES = {
  'معلم طبيعي': [],
  'معلم ديني': [],
  'معلم تراثي': [],
  'مرافق صحية': ['مستشفيات', 'مصحات خاصة', 'مركز التصوير الإشعاعي', 'أطباء مختصون وعيادات خاصة', 'مراكز التأهيل', 'صيدليات', 'شبه صيدلي'],
  'مطاعم': ['تقليدي', 'عصري', 'مختلط', 'أكل سريع', 'أكلات شعبية', 'مقاهي'],
  'فنادق ومنتجعات': ['فنادق', 'منتجعات', 'مراقد'],
  'أسواق': [],
  'متاجر ومحلات': []
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
  const [plusCodeInput, setPlusCodeInput] = useState('');
  const [resolvingCode, setResolvingCode] = useState(false);
  const [plusCodeError, setPlusCodeError] = useState('');

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

  // ===================================================================
  // تحديد الموقع عبر Plus Code (مثال: "9V92+Q3V, El Oued" أو كود كامل)
  // أسهل بكثير على الهاتف من كتابة الإحداثيات يدويًا
  // ===================================================================
  const geocodeLocality = async (locality) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locality)}`,
      { headers: { 'Accept-Language': 'ar' } }
    );
    const data = await res.json();
    if (!data || data.length === 0) throw new Error('لم يتم العثور على المنطقة المذكورة');
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  };

  const resolvePlusCode = async () => {
    setPlusCodeError('');
    const raw = plusCodeInput.trim();
    if (!raw) return;

    // فصل الكود عن اسم المنطقة: يقبل فاصلة "9V92+Q3V, El Oued" أو مسافة فقط "9V92+Q3V El Oued"
    const olcPattern = /^([23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{0,3})[\s,]*(.*)$/i;
    const match = raw.match(olcPattern);
    let codePart, locality;
    if (match) {
      codePart = match[1].toUpperCase();
      locality = match[2].trim();
    } else {
      const [codePartRaw, ...localityParts] = raw.split(',');
      codePart = codePartRaw.trim().toUpperCase();
      locality = localityParts.join(',').trim();
    }

    if (!olc.isValid(codePart)) {
      setPlusCodeError('صيغة الكود غير صحيحة. تأكد من كتابته بشكل صحيح.');
      return;
    }

    setResolvingCode(true);
    try {
      let fullCode = codePart;

      if (olc.isShort(codePart)) {
        // الكود القصير يحتاج نقطة مرجعية قريبة (اسم المدينة/المنطقة أو مركز الخريطة الحالي)
        let refLat, refLng;
        if (locality) {
          const loc = await geocodeLocality(locality);
          refLat = loc.lat;
          refLng = loc.lng;
        } else if (mapRef.current) {
          const center = mapRef.current.getCenter();
          refLat = center.lat;
          refLng = center.lng;
        } else {
          refLat = DEFAULT_CENTER.lat;
          refLng = DEFAULT_CENTER.lng;
        }
        fullCode = olc.recoverNearest(codePart, refLat, refLng);
      }

      const area = olc.decode(fullCode);
      applyCoords(area.latitudeCenter, area.longitudeCenter);
      if (mapRef.current && markerRef.current) {
        markerRef.current.setLatLng([area.latitudeCenter, area.longitudeCenter]);
        mapRef.current.setView([area.latitudeCenter, area.longitudeCenter], 17);
      }
    } catch (err) {
      setPlusCodeError(err.message || 'تعذر تحديد الموقع من هذا الكود');
    } finally {
      setResolvingCode(false);
    }
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
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!formData.name.trim() || !formData.main_category) {
      setSubmitError('يرجى تعبئة اسم المعلم والتصنيف الرئيسي على الأقل.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. رفع الصور إلى Supabase Storage (bucket: images)
      const uploadedUrls = [];
      for (let i = 0; i < images.length; i++) {
        const { file } = images[i];
        const ext = file.name.split('.').pop();
        const path = `places/${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`فشل رفع الصورة رقم ${i + 1}: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(path);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // 2. تجهيز بيانات المعلم (الصورة الأولى = الصورة الرئيسية في عمود image_url)
      const placeDataToInsert = {
        name: formData.name,
        main_category: formData.main_category,
        sub_category: formData.sub_category || null,
        description: formData.description || null,
        address: formData.address || null,
        district: formData.district || null,
        municipality: formData.municipality || null,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        map_link: formData.map_link || null,
        phone: formData.phone || null,
        website: formData.website || null,
        facebook: formData.facebook || null,
        instagram: formData.instagram || null,
        opening_hours: formData.opening_hours || null,
        image_url: uploadedUrls[0] || null,
        status: formData.status,
      };

      // 3. إدراج المعلم في جدول places
      const { data: insertedPlace, error: insertError } = await supabase
        .from('places')
        .insert([placeDataToInsert])
        .select()
        .single();

      if (insertError) throw new Error(`فشل حفظ المعلم: ${insertError.message}`);

      // 4. إدراج باقي الصور في جدول gallery (الصورة الأولى تُعتبر الغلاف is_cover)
      if (uploadedUrls.length > 0) {
        const galleryRows = uploadedUrls.map((url, idx) => ({
          place_id: insertedPlace.id,
          image_url: url,
          is_cover: idx === 0,
          sort_order: idx,
        }));

        const { error: galleryError } = await supabase.from('gallery').insert(galleryRows);
        if (galleryError) {
          // لا نوقف العملية بسبب هذا فقط، لكن نبلغ المستخدم
          console.error('gallery insert error:', galleryError);
          setSubmitError('تم حفظ المعلم، لكن حدث خطأ أثناء ربط بعض الصور بالمعرض.');
        }
      }

      setSubmitSuccess(true);
      // إعادة تصفير الفورم
      setFormData({
        name: '', main_category: '', sub_category: '', description: '',
        address: '', district: '', municipality: '', lat: '', lng: '',
        map_link: '', phone: '', website: '', facebook: '', instagram: '',
        opening_hours: '', status: 'منشور',
      });
      setImages([]);
      setPlusCodeInput('');

    } catch (error) {
      console.error('Error:', error);
      setSubmitError(error.message || 'حدث خطأ غير متوقع أثناء الإضافة.');
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
          <label>حدد الموقع على الخريطة (اضغط أو اسحب العلامة)</label>

          {/* إدخال Plus Code — أسهل من كتابة الإحداثيات على الهاتف */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={plusCodeInput}
              onChange={(e) => setPlusCodeInput(e.target.value)}
              placeholder="مثال: 9V92+Q3V, El Oued"
              className="flex-1 p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none"
              dir="ltr"
            />
            <button
              type="button"
              onClick={resolvePlusCode}
              disabled={resolvingCode || !plusCodeInput.trim()}
              className="bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md whitespace-nowrap"
            >
              {resolvingCode ? 'جاري التحديد...' : '📍 تحديد من الكود'}
            </button>
          </div>
          {plusCodeError && <p className="text-red-400 text-xs">{plusCodeError}</p>}
          <p className="text-gray-600 text-xs">انسخ الكود من خرائط قوقل والصقه هنا مباشرة، بفاصلة أو بدونها (مثل "9V92+Q3V, El Oued" أو "9V92+Q3V El Oued").</p>

          <div
            ref={mapContainerRef}
            className="w-full h-[320px] rounded-lg border border-gray-700 overflow-hidden bg-[#222] mt-1"
          />
          <p className="text-gray-500 text-xs">أو اضغط في أي مكان بالخريطة لوضع العلامة، أو اسحبها لضبط الموقع بدقة — يعمل باللمس على الهاتف.</p>
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

      {/* رسائل الحالة */}
      {submitError && (
        <div className="bg-red-950 border border-red-700 text-red-300 p-3 rounded-lg text-sm">{submitError}</div>
      )}
      {submitSuccess && (
        <div className="bg-green-950 border border-green-700 text-green-300 p-3 rounded-lg text-sm">تمت إضافة المعلم بنجاح ✅</div>
      )}

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