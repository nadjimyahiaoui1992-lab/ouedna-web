import { Bell, CheckCircle2, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import PlatformFrame from "@/components/platform/PlatformFrame";

export default function UpdatesPage() {
  return <PlatformFrame><section className="platform-page"><div className="platform-container"><div className="platform-page-hero"><div><span className="platform-eyebrow"><i />06 / مركز التحديثات</span><h1>ابقَ على<br /><em>المسار.</em></h1><p>آخر إصدار من Ouedna، وروابط التثبيت الرسمية، وما يتغير في دليل وادي سوف.</p></div><div className="platform-page-hero__aside"><Sparkles size={20} /><strong>2.0.4</strong><span>الإصدار الحالي</span></div></div><div className="platform-update-card"><div><span>الإصدار الرئيسي الحالي</span><h2>Ouedna 2.0.4</h2><p>خرائط، معالم وصور حقيقية، تجربة مجتمع، وتحسينات الملاحة للتطبيق Android.</p><div className="platform-update-card__meta"><span><CheckCircle2 size={14} /> إصدار موثوق</span><span><Bell size={14} /> تحديثات عند النشر</span></div></div><Link className="platform-button platform-button--amber" href="/download"><Download size={16} /> تنزيل التطبيق</Link></div><div className="platform-empty-panel"><Bell size={28} /><h2>سيظهر الجديد هنا</h2><p>عند نشر إعلان أو إضافة معلم أو إصدار جديد من لوحة Ouedna، ستجد التفاصيل في هذا المركز.</p></div></div></section></PlatformFrame>;
}
