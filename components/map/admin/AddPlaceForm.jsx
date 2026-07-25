'use client';

import { useState } from 'react';
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // تصفير التصنيف الفرعي عند تغيير التصنيف الرئيسي
    if (name === 'main_category') {
      setFormData(prev => ({ ...prev, sub_category: '' }));
    }
  };

  // --- دوال الصور ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // --- دالة الحفظ وإرسال البيانات ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. رفع الصور إلى Storage (أمثلة وهمية هنا لتوضيح الفكرة)
      // في التطبيق الحقيقي ستستخدم supabase.storage.from('images').upload(...)
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
        
        <div 
          onDragOver={(e) => e.preventDefault()} 
          onDrop={handleDrop}
          className="relative p-8 border-2 border-dashed border-green-600/50 rounded-xl text-center hover:bg-[#222] transition bg-[#151515] flex flex-col items-center justify-center min-h-[150px]"
        >
          <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <p className="text-gray-400 font-medium">اسحب وأفلت الصور هنا</p>
          <p className="text-gray-600 text-sm mt-1">أو اضغط لاختيار صور من جهازك (يدعم التصوير المباشر من الهاتف)</p>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        
        {images.length > 0 && (
          <div className="flex gap-4 overflow-x-auto py-4 scrollbar-thin">
            {images.map((img, idx) => (
              <div key={idx} className="relative min-w-[120px] h-[120px] rounded-lg border border-gray-700 overflow-hidden shadow-lg group">
                <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)} 
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-md"
                >✕</button>
              </div>
            ))}
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
