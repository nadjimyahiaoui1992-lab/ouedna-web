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
  'فنادق ومنتجعات': ['فنادق', 'منتجعات', 'مراقد']
};

// إحداثيات افتراضية (مدينة الوادي كنقطة انطلاق) — غيّرها حسب منطقتك
const DEFAULT_CENTER = { lat: 33.3683, lng: 6.8674 };

const EMPTY_FORM = {
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
};

// place: صف المعلم الكامل كما هو موجود أصلاً في مصفوفة places بلوحة التحكم (props.place)
// onCancel: تُستدعى عند الرجوع بدون حفظ (تُستخدم لإرجاع goTo('places') في الداشبورد)
// onSaved: تُستدعى بعد نجاح الحفظ وتُمرَّر لها بيانات المعلم المحدّثة، لتحديث المصفوفة في الداشبورد
// onDeleted: تُستدعى بعد نجاح الحذف النهائي، وتُمرَّر لها id المعلم المحذوف
export default function EditPlaceForm({ place, onCancel, onSaved, onDeleted }) {
  const placeId = place?.id;

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // صور موجودة مسبقًا (من جدول gallery) + صور جديدة يضيفها المستخدم
  const [existingImages, setExistingImages] = useState([]); // [{id, image_url, is_cover}]
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]); // نفس شكل صور فورم الإضافة {file, preview, id}
  const [coverSource, setCoverSource] = useState(null); // يحدد أي صورة هي الغلاف: {type: 'existing'|'new', id}

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- حالة الخريطة ---
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [plusCodeInput, setPlusCodeInput] = useState('');
  const [resolvingCode, setResolvingCode] = useState(false);
  const [plusCodeError, setPlusCodeError] = useState('');

  // ===================================================================
  // 1. تعبئة الفورم من بيانات المعلم الممرّرة من لوحة التحكم + جلب صور المعرض فقط
  // ===================================================================
  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      if (!place) return;
      setLoading(true);
      setLoadError('');
      try {
        const { data: gallery, error: galleryError } = await supabase
          .from('gallery')
          .select('*')
          .eq('place_id', placeId)
          .order('sort_order', { ascending: true });

        if (galleryError) console.error('gallery fetch error:', galleryError);

        if (cancelled) return;

        setFormData({
          name: place.name || '',
          main_category: place.main_category || '',
          sub_category: place.sub_category || '',
          description: place.description || '',
          address: place.address || '',
          district: place.district || '',
          municipality: place.municipality || '',
          lat: place.lat != null ? String(place.lat) : '',
          lng: place.lng != null ? String(place.lng) : '',
          map_link: place.map_link || '',
          phone: place.phone || '',
          website: place.website || '',
          facebook: place.facebook || '',
          instagram: place.instagram || '',
          opening_hours: place.opening_hours || '',
          status: place.status || 'منشور',
        });

        const galleryImages = gallery && gallery.length > 0 ? gallery : [];
        setExistingImages(galleryImages);

        // تحديد الغلاف الحالي: أول صورة is_cover=true، وإلا أول صورة، وإلا image_url من places
        const currentCover = galleryImages.find(g => g.is_cover) || galleryImages[0];
        if (currentCover) {
          setCoverSource({ type: 'existing', id: currentCover.id });
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'حدث خطأ أثناء تحميل بيانات المعلم.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (placeId) loadGallery();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'main_category') {
      setFormData(prev => ({ ...prev, sub_category: '' }));
    }
  };

  // ===================================================================
  // تحميل مكتبة Leaflet وتهيئة الخريطة (تنتظر انتهاء تحميل بيانات المعلم
  // حتى تُوضع العلامة على الإحداثيات الصحيحة من أول مرة)
  // ===================================================================
  useEffect(() => {
    if (loading) return; // لا نهيّئ الخريطة قبل معرفة الإحداثيات الحالية
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

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        applyCoords(lat, lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        applyCoords(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);

      setTimeout(() => map.invalidateSize(), 200);
    }

    if (window.L) {
      initMap();
    } else {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
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
  }, [loading]);

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
  // Plus Code (نفس منطق فورم الإضافة تمامًا)
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

    const [codePartRaw, ...localityParts] = raw.split(',');
    const codePart = codePartRaw.trim().toUpperCase();
    const locality = localityParts.join(',').trim();

    if (!olc.isValid(codePart)) {
      setPlusCodeError('صيغة الكود غير صحيحة. تأكد من كتابته بشكل صحيح.');
      return;
    }

    setResolvingCode(true);
    try {
      let fullCode = codePart;

      if (olc.isShort(codePart)) {
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

  // ===================================================================
  // إدارة الصور: صور موجودة (existingImages) + صور جديدة (newImages)
  // كلاهما يُعرضان معًا في نفس شبكة الصور، مع إمكانية الحذف والترتيب وتحديد الغلاف
  // ===================================================================
  const addFiles = (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    const mapped = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    setNewImages(prev => [...prev, ...mapped]);
    // إذا ما كان في أي غلاف محدد بعد، اجعل أول صورة جديدة هي الغلاف
    if (!coverSource && mapped.length > 0) {
      setCoverSource({ type: 'new', id: mapped[0].id });
    }
  };

  const handleImageUpload = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const handleCameraCapture = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const removeExistingImage = (imgId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imgId));
    setRemovedImageIds(prev => [...prev, imgId]);
    if (coverSource?.type === 'existing' && coverSource.id === imgId) {
      setCoverSource(null); // سيُعاد تعيينه تلقائيًا لأول صورة متبقية عند الحفظ
    }
  };

  const removeNewImage = (imgId) => {
    setNewImages(prev => prev.filter(img => img.id !== imgId));
    if (coverSource?.type === 'new' && coverSource.id === imgId) {
      setCoverSource(null);
    }
  };

  const setCover = (type, id) => setCoverSource({ type, id });

  // ترتيب بالسحب بين الصور الجديدة فقط (الصور القديمة تبقى بترتيبها الأصلي من المعرض)
  const dragImageIndex = useRef(null);
  const handleImageDragStart = (index) => { dragImageIndex.current = index; };
  const handleImageDragOver = (e) => e.preventDefault();
  const handleImageDropReorder = (index) => {
    const from = dragImageIndex.current;
    if (from === null || from === index) return;
    setNewImages(prev => {
      const newArr = [...prev];
      const [moved] = newArr.splice(from, 1);
      newArr.splice(index, 0, moved);
      return newArr;
    });
    dragImageIndex.current = null;
  };

  // ===================================================================
  // الحفظ: تحديث المعلم + رفع الصور الجديدة + حذف الصور المُزالة
  // ===================================================================
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
      // 1. حذف الصور المُزالة من جدول gallery (نُبقي الملفات في storage لتفادي تعقيد إضافي؛
      //    يمكن حذفها لاحقًا عبر مهمة تنظيف دورية إن رغبت)
      if (removedImageIds.length > 0) {
        const { error: deleteGalleryError } = await supabase
          .from('gallery')
          .delete()
          .in('id', removedImageIds);
        if (deleteGalleryError) {
          console.error('gallery delete error:', deleteGalleryError);
        }
      }

      // 2. رفع الصور الجديدة إلى Supabase Storage
      const uploadedNew = [];
      for (let i = 0; i < newImages.length; i++) {
        const { file, id } = newImages[i];
        const ext = file.name.split('.').pop();
        const path = `places/${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`فشل رفع الصورة رقم ${i + 1}: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(path);
        uploadedNew.push({ tempId: id, url: publicUrlData.publicUrl });
      }

      // 3. تحديد الغلاف النهائي
      let coverUrl = null;
      if (coverSource?.type === 'existing') {
        const found = existingImages.find(img => img.id === coverSource.id);
        coverUrl = found?.image_url || null;
      } else if (coverSource?.type === 'new') {
        const found = uploadedNew.find(u => u.tempId === coverSource.id);
        coverUrl = found?.url || null;
      }
      if (!coverUrl) {
        coverUrl = existingImages[0]?.image_url || uploadedNew[0]?.url || null;
      }

      // 4. تحديث بيانات المعلم في جدول places
      const placeDataToUpdate = {
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
        image_url: coverUrl,
        status: formData.status,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('places')
        .update(placeDataToUpdate)
        .eq('id', placeId);

      if (updateError) throw new Error(`فشل تحديث المعلم: ${updateError.message}`);

      // 5. إدراج الصور الجديدة في جدول gallery بترتيب يلي الصور القديمة المتبقية
      if (uploadedNew.length > 0) {
        const startOrder = existingImages.length;
        const galleryRows = uploadedNew.map((u, idx) => ({
          place_id: placeId,
          image_url: u.url,
          is_cover: coverUrl === u.url,
          sort_order: startOrder + idx,
        }));

        const { error: galleryInsertError } = await supabase.from('gallery').insert(galleryRows);
        if (galleryInsertError) {
          console.error('gallery insert error:', galleryInsertError);
          setSubmitError('تم تحديث المعلم، لكن حدث خطأ أثناء ربط بعض الصور الجديدة بالمعرض.');
        }
      }

      // 6. تحديث علامة is_cover على الصور القديمة المتبقية إذا تغيّر الغلاف
      if (existingImages.length > 0) {
        await Promise.all(existingImages.map(img =>
          supabase.from('gallery').update({ is_cover: img.image_url === coverUrl }).eq('id', img.id)
        ));
      }

      setSubmitSuccess(true);
      newImages.forEach(img => URL.revokeObjectURL(img.preview));
      setNewImages([]);
      setRemovedImageIds([]);
      setPlusCodeInput('');

      // إبلاغ لوحة التحكم بالتحديث لتعكسه فورًا في جدول قاعدة بيانات المعالم
      onSaved?.({ id: placeId, ...placeDataToUpdate });
    } catch (error) {
      console.error('Error:', error);
      setSubmitError(error.message || 'حدث خطأ غير متوقع أثناء الحفظ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===================================================================
  // حذف المعلم بالكامل
  // ===================================================================
  const handleDeletePlace = async () => {
    setIsDeleting(true);
    setSubmitError('');
    try {
      const { error: galleryDeleteError } = await supabase.from('gallery').delete().eq('place_id', placeId);
      if (galleryDeleteError) console.error('gallery delete error:', galleryDeleteError);

      const { error: placeDeleteError } = await supabase.from('places').delete().eq('id', placeId);
      if (placeDeleteError) throw new Error(`فشل حذف المعلم: ${placeDeleteError.message}`);

      onDeleted?.(placeId);
    } catch (error) {
      console.error('Error:', error);
      setSubmitError(error.message || 'حدث خطأ غير متوقع أثناء الحذف.');
      setIsDeleting(false);
    }
  };

  if (!place) {
    return (
      <div className="p-8 text-center text-red-400 bg-[#111] rounded-xl" dir="rtl">
        لم يتم تحديد أي معلم للتعديل.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 bg-[#111] rounded-xl" dir="rtl">
        جاري تحميل صور المعلم...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 text-center text-red-400 bg-[#111] rounded-xl" dir="rtl">
        {loadError}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-8 bg-[#111] text-gray-200 rounded-xl" dir="rtl">

      {/* الترويسة والحالة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-md border border-gray-700 hover:border-gray-500 transition-colors"
          >
            → رجوع
          </button>
          <h2 className="text-2xl font-bold text-green-500">تعديل المعلم: {formData.name || '—'}</h2>
        </div>
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

      {submitSuccess && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 p-3 rounded-lg text-sm">
          ✅ تم حفظ التعديلات بنجاح.
        </div>
      )}
      {submitError && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 p-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

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

          {formData.main_category && CATEGORIES[formData.main_category]?.length > 0 && (
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

        <div className="flex flex-col gap-2 mt-2">
          <label>حدد الموقع على الخريطة (اضغط أو اسحب العلامة)</label>

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
          <p className="text-gray-600 text-xs">انسخ الكود من خرائط قوقل (زر المشاركة يعطيك مثل "9V92+Q3V, El Oued") والصقه هنا مباشرة.</p>

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

        <div className="flex flex-col gap-1 mt-2">
          <label>رابط خرائط قوقل (اختياري)</label>
          <input type="url" name="map_link" value={formData.map_link} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" placeholder="https://maps.google.com/..." />
        </div>
      </fieldset>

      {/* 3. التواصل */}
      <fieldset className="flex flex-col gap-4 border border-[#333] p-5 rounded-lg bg-[#1a1a1a]">
        <legend className="text-lg font-semibold text-green-400 px-3">معلومات التواصل</legend>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <label>الهاتف</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <label>ساعات العمل</label>
            <input type="text" name="opening_hours" value={formData.opening_hours} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" placeholder="مثال: 08:00 - 18:00" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1 w-full sm:w-1/3">
            <label>الموقع الإلكتروني</label>
            <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-1/3">
            <label>فيسبوك</label>
            <input type="url" name="facebook" value={formData.facebook} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-1/3">
            <label>إنستغرام</label>
            <input type="url" name="instagram" value={formData.instagram} onChange={handleInputChange} className="p-3 rounded bg-[#222] border border-gray-700 focus:border-green-500 outline-none" dir="ltr" />
          </div>
        </div>
      </fieldset>

      {/* 4. الصور */}
      <fieldset className="flex flex-col gap-4 border border-[#333] p-5 rounded-lg bg-[#1a1a1a]">
        <legend className="text-lg font-semibold text-green-400 px-3">صور المعلم</legend>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-[#222] border border-dashed border-gray-600 hover:border-green-500 rounded-lg p-4 text-sm text-gray-400">
            📁 اختر من المعرض
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
          <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-[#222] border border-dashed border-gray-600 hover:border-green-500 rounded-lg p-4 text-sm text-gray-400">
            📷 التقاط صورة
            <input type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" />
          </label>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="text-center text-xs text-gray-600 border border-dashed border-gray-700 rounded-lg p-3"
        >
          أو اسحب الصور وأفلتها هنا
        </div>

        {(existingImages.length > 0 || newImages.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
            {existingImages.map((img) => {
              const isCover = coverSource?.type === 'existing' && coverSource.id === img.id;
              return (
                <div key={img.id} className={`relative rounded-lg overflow-hidden border ${isCover ? 'border-green-500' : 'border-gray-700'} group`}>
                  <img src={img.image_url} alt="" className="w-full h-28 object-cover" />
                  {isCover && (
                    <span className="absolute top-1 right-1 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full">الغلاف</span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!isCover && (
                      <button type="button" onClick={() => setCover('existing', img.id)} className="text-[11px] bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded">
                        اجعله الغلاف
                      </button>
                    )}
                    <button type="button" onClick={() => removeExistingImage(img.id)} className="text-[11px] bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded">
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}

            {newImages.map((img, index) => {
              const isCover = coverSource?.type === 'new' && coverSource.id === img.id;
              return (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleImageDragStart(index)}
                  onDragOver={handleImageDragOver}
                  onDrop={() => handleImageDropReorder(index)}
                  className={`relative rounded-lg overflow-hidden border ${isCover ? 'border-green-500' : 'border-gray-700'} group cursor-move`}
                >
                  <img src={img.preview} alt="" className="w-full h-28 object-cover" />
                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">جديدة</span>
                  {isCover && (
                    <span className="absolute top-1 right-1 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full">الغلاف</span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!isCover && (
                      <button type="button" onClick={() => setCover('new', img.id)} className="text-[11px] bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded">
                        اجعله الغلاف
                      </button>
                    )}
                    <button type="button" onClick={() => removeNewImage(img.id)} className="text-[11px] bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded">
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </fieldset>

      {/* أزرار الحفظ والحذف */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isSubmitting || isDeleting}
          className="text-red-500 hover:text-red-400 text-sm px-4 py-2 rounded-md border border-red-900 hover:bg-red-950/40 disabled:opacity-50"
        >
          🗑️ حذف هذا المعلم نهائيًا
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isDeleting}
          className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg"
        >
          {isSubmitting ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
        </button>
      </div>

      {/* تأكيد الحذف */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-[#1a1a1a] border border-red-900 rounded-xl p-6 max-w-sm w-full flex flex-col gap-4">
            <h3 className="text-lg font-bold text-red-500">تأكيد الحذف</h3>
            <p className="text-sm text-gray-300">
              هل أنت متأكد من حذف "{formData.name}" نهائيًا؟ سيتم حذف جميع صوره من المعرض أيضًا. لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-md text-gray-300 hover:bg-[#333]">
                إلغاء
              </button>
              <button type="button" onClick={handleDeletePlace} disabled={isDeleting} className="px-4 py-2 rounded-md bg-red-700 hover:bg-red-600 text-white disabled:opacity-50">
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}