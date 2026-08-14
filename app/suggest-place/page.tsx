import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import PlatformFrame from "@/components/platform/PlatformFrame";
import SuggestPlaceClient from "./SuggestPlaceClient";

export default function SuggestPlacePage() {
  return <PlatformFrame active="/community"><section className="platform-page platform-suggest-page"><div className="platform-container"><Link className="platform-back-link" href="/explore"><ArrowRight size={16} /> العودة إلى الاستكشاف</Link><div className="platform-suggest-hero"><div><span className="platform-eyebrow"><i />أهل المكان يعرفون أكثر</span><h1>أضف مكاناً<br /><em>يستحق الاكتشاف.</em></h1><p>ساعدنا على توسيع دليل وادي سوف. املأ المعلومات الأساسية، وسيراجع فريق الإدارة الاقتراح قبل نشره.</p></div><div className="platform-suggest-visual"><MapPin size={28} /><span>معلومة محلية<br /><b>تصنع طريقاً جديداً.</b></span></div></div><SuggestPlaceClient /></div></section></PlatformFrame>;
}
