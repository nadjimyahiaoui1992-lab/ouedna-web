"use client";

/** Ouedna Admin security flow: production-only password recovery at /admin/reset-password. */
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function isStrongPassword(password: string) {
  return password.length >= 12
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9\s]/.test(password);
}

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [recoverySession, setRecoverySession] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setRecoverySession(Boolean(data.session));
      setReady(true);
    };
    void loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setRecoverySession(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const requestRecovery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setMessage("");
    const redirectTo = `${window.location.origin}/admin/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) {
      setErrorMsg("تعذر إرسال رابط الاستعادة الآن. تحقق من البريد الإلكتروني ثم أعد المحاولة.");
    } else {
      setMessage("أرسلنا رابطاً آمناً إلى بريدك. افتح أحدث رسالة ثم عُد إلى هذه الصفحة لإدخال كلمة المرور الجديدة.");
    }
    setLoading(false);
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setMessage("");
    if (!isStrongPassword(password)) {
      setErrorMsg("استخدم 12 حرفاً على الأقل تتضمن حروفاً كبيرة وصغيرة وأرقاماً ورمزاً خاصاً.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg("الرابط غير صالح أو انتهت صلاحيته. اطلب رابط استعادة جديداً.");
    } else {
      await supabase.auth.signOut();
      setRecoverySession(false);
      setPassword("");
      setConfirmPassword("");
      setMessage("تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بالكلمة الجديدة.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[url('https://images.unsplash.com/photo-1542601098-8fc114e148e2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center p-4 flex items-center justify-center relative" dir="rtl">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-7 shadow-2xl sm:p-9">
        <p className="mb-3 text-sm font-bold tracking-wide text-amber-700">إدارة وادنا</p>
        <h1 className="text-3xl font-extrabold text-slate-900">{recoverySession ? "كلمة مرور جديدة" : "استعادة كلمة المرور"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {recoverySession
            ? "اختر كلمة مرور قوية لحساب الإدارة. سيُطلب منك تسجيل الدخول من جديد بعد الحفظ."
            : "أدخل بريد حساب الإدارة لنرسل رابط استعادة آمناً على نطاق وادنا الرسمي."}
        </p>

        {!ready ? <p className="mt-7 text-sm text-slate-500">جارٍ التحقق من رابط الاستعادة…</p> : recoverySession ? (
          <form className="mt-7 space-y-5" onSubmit={updatePassword}>
            <label className="block text-sm font-bold text-slate-800">كلمة المرور الجديدة
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-left outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200" dir="ltr" />
            </label>
            <label className="block text-sm font-bold text-slate-800">تأكيد كلمة المرور
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-left outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200" dir="ltr" />
            </label>
            <p className="text-xs leading-5 text-slate-500">12 حرفاً على الأقل، مع حروف كبيرة وصغيرة وأرقام ورمز خاص.</p>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-l from-amber-600 to-orange-600 px-4 py-3 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60">{loading ? "جارٍ الحفظ…" : "حفظ كلمة المرور الجديدة"}</button>
          </form>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={requestRecovery}>
            <label className="block text-sm font-bold text-slate-800">البريد الإلكتروني لحساب الإدارة
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="admin@ouedna.dz" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-left outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200" dir="ltr" />
            </label>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-l from-amber-600 to-orange-600 px-4 py-3 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60">{loading ? "جارٍ الإرسال…" : "إرسال رابط الاستعادة"}</button>
          </form>
        )}

        {message && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">{message}</p>}
        {errorMsg && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">{errorMsg}</p>}
        <Link href="/admin/login" className="mt-6 block text-center text-sm font-bold text-amber-700 hover:text-amber-800">العودة إلى تسجيل الدخول</Link>
      </section>
    </main>
  );
}
