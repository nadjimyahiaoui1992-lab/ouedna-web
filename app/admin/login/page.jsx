'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(false);
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    // TODO: استبدل هذا باستدعاء Supabase Auth الحقيقي، مثال:
    // const { error } = await supabase.auth.signInWithPassword({ email, password });
    await new Promise((r) => setTimeout(r, 700));

    if (email && password) {
      router.push('/admin/dashboard');
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--night)' }}>
      {/* توهج ليلي */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1100px 600px at 80% -10%, rgba(47,110,88,.35), transparent), radial-gradient(900px 500px at -10% 110%, rgba(201,154,68,.18), transparent)',
        }}
      />

      {/* طبقات الكثبان — العنصر المميز للتصميم */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        style={{ height: '34vh', minHeight: 200 }}
      >
        <path d="M0,140 C240,60 420,190 720,120 C1000,55 1220,170 1440,110 L1440,260 L0,260 Z" fill="#1C3140" opacity="0.9" />
        <path d="M0,190 C260,130 460,230 760,170 C1020,120 1240,220 1440,170 L1440,260 L0,260 Z" fill="#234F3F" opacity="0.85" />
        <path d="M0,225 C300,190 520,250 800,215 C1060,185 1260,245 1440,215 L1440,260 L0,260 Z" fill="#2F6E58" />
      </svg>

      {/* ظل نخلة */}
      <svg className="absolute bottom-8 hidden sm:block" style={{ right: '8%' }} width="90" height="140" viewBox="0 0 90 140" opacity="0.5">
        <rect x="41" y="55" width="8" height="85" fill="#0E1B24" />
        <g fill="#234F3F">
          <path d="M45 55 C10 40 -5 15 5 5 C25 20 40 40 45 55 Z" />
          <path d="M45 55 C80 40 95 15 85 5 C65 20 50 40 45 55 Z" />
          <path d="M45 55 C25 30 20 5 30 -5 C45 10 48 35 45 55 Z" />
          <path d="M45 55 C65 30 70 5 60 -5 C45 10 42 35 45 55 Z" />
          <path d="M45 55 C38 25 45 0 45 -8 C52 10 50 35 45 55 Z" />
        </g>
      </svg>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* الهوية */}
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ background: 'var(--gold)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M4 20c3-6 6-9 8-16 2 7 5 10 8 16" stroke="#241705" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 20h20" stroke="#241705" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-white">سوف 360</h1>
            <p className="text-sm mt-1" style={{ color: '#A9B7AD' }}>لوحة تحكم منصة الوادي السياحية</p>
          </div>

          {/* البطاقة */}
          <div className={`${styles.panel} p-7 sm:p-8`}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>تسجيل الدخول</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>أدخل بياناتك للوصول إلى لوحة الإدارة</p>

            {error && (
              <div
                className="mb-4 text-sm font-semibold px-4 py-3 rounded-xl"
                style={{ background: 'var(--clay-tint)', color: '#7c3d1f' }}
              >
                البريد الإلكتروني أو كلمة المرور غير صحيحة.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div className={styles.field}>
                <label htmlFor="email">البريد الإلكتروني</label>
                <input type="email" id="email" name="email" placeholder="admin@souf360.dz" required />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    className="pl-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute inset-y-0 left-0 px-3 flex items-center text-sm"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none" style={{ color: 'var(--ink-soft)' }}>
                  <input type="checkbox" className="rounded" style={{ accentColor: 'var(--oasis)' }} />
                  تذكرني
                </label>
                <Link href="#" className="font-semibold" style={{ color: 'var(--oasis)' }}>نسيت كلمة المرور؟</Link>
              </div>

              <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnGold} w-full py-3`}>
                {loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: '#CBD8CE' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              الرجوع إلى الموقع الرئيسي
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
