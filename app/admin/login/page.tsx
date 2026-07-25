import { redirect } from "next/navigation";

// أي زيارة لمسار /admin نفسه تُحوَّل مباشرة إلى صفحة تسجيل الدخول.
// (طبقة أمان إضافية: الـ middleware يقوم أصلاً بهذا التحويل، لكن هذا
// يضمن عدم وجود صفحة 404 حتى في حال تجاوز الـ middleware لأي سبب)
export default function AdminIndexPage() {
  redirect("/admin/login");
}
