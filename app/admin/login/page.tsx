"use client";

export default function LoginPage() {
  return (
    {/* الحاوية الرئيسية مع صورة خلفية سياحية وتوسيط المحتوى */}
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1542601098-8fc114e148e2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat p-4 relative">
      
      {/* طبقة شفافة داكنة (Overlay) فوق الصورة لتوضيح صندوق الدخول */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* صندوق تسجيل الدخول بتصميم زجاجي (Glassmorphism) */}
      <div className="relative bg-white/85 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-gray-700 text-sm font-medium">
            لوحة تحكم منصة Souf 360 السياحية
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
              البريد الإلكتروني
            </label>
            <input 
              type="email" 
              className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white/90 shadow-sm"
              placeholder="admin@souf360.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
              كلمة المرور
            </label>
            <input 
              type="password" 
              className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white/90 shadow-sm"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] mt-6"
          >
            دخول إلى لوحة التحكم
          </button>
        </form>
      </div>
    </div>
  );
}
