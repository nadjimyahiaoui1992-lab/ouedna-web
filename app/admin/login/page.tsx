"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// إعداد الاتصال بقاعدة بيانات Supabase (نسخة متوافقة مع الـ middleware عبر cookies)
const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    setErrorMsg("");

    try {
      // إرسال البيانات للتحقق منها في Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setErrorMsg("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        setLoading(false); // إيقاف حالة التحميل ليعود الزر لطبيعته
      } else {
        const { data: profile, error: profileError } = await supabase
          .from("admin_profiles")
          .select("role,permissions")
          .eq("id", data.user.id)
          .maybeSingle();
        const permissions = profile?.permissions;
        const hasPermission = profile?.role === "admin" || (
          permissions && typeof permissions === "object" &&
          Object.values(permissions as Record<string, unknown>).some((value) => value === true)
        );
        if (profileError || !hasPermission) {
          await supabase.auth.signOut();
          setErrorMsg("هذا الحساب لا يملك صلاحية الوصول إلى لوحة الإدارة.");
          setLoading(false);
          return;
        }
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch (err) {
      // التقاط أي خطأ غير متوقع وإيقاف تعليق الزر
      setErrorMsg("فشل الاتصال بقاعدة البيانات. تأكد من إضافة روابط Supabase في إعدادات Vercel.");
      setLoading(false); // إيقاف حالة التحميل
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1542601098-8fc114e148e2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat p-4 relative">
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative bg-white/85 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-gray-700 text-sm font-medium">
            لوحة تحكم وادنا لإدارة محتوى ومعالم ولاية الوادي
          </p>
        </div>

        {/* عرض رسالة الخطأ هنا إن وجدت */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-100/90 border border-red-200 text-red-700 text-sm rounded-xl text-right rtl">
            {errorMsg}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
              البريد الإلكتروني
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white/90 shadow-sm"
              placeholder="admin@ouedna.dz"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
              كلمة المرور
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white/90 shadow-sm"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transform transition-all duration-200 mt-6 ${
              loading 
                ? "bg-amber-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? "جاري تسجيل الدخول..." : "دخول إلى لوحة التحكم"}
          </button>
        </form>
      </div>
    </div>
  );
}
