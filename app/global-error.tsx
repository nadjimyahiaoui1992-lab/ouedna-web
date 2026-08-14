"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="ar" dir="rtl"><body style={{ margin: 0, background: "#f8f7f2", color: "#0e4b42", fontFamily: "Arial, sans-serif" }}><main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}><div><h1>تعذر تحميل الصفحة</h1><p>حدث خطأ مؤقت. أعد المحاولة أو ارجع إلى الصفحة الرئيسية.</p><button type="button" onClick={() => reset()} style={{ border: 0, borderRadius: 10, padding: "12px 18px", color: "#fff", background: "#0e4b42", cursor: "pointer" }}>إعادة المحاولة</button></div></main></body></html>;
}
