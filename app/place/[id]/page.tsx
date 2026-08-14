import { ArrowRight, Clock3, Globe2, MapPin, Phone, Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlatformFrame from "@/components/platform/PlatformFrame";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import PlaceDetailActions from "./PlaceDetailActions";

export const dynamic = "force-dynamic";

function images(value: unknown) { if (Array.isArray(value)) return value.map(String).filter(Boolean); if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",").map((item) => item.trim()).filter(Boolean); return []; }

async function getPlace(id: string) { const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); const { data } = await supabase.from("places").select("*").eq("id", Number(id)).eq("status", "منشور").maybeSingle(); return data; }

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const place = await getPlace(id); if (!place) notFound(); const gallery = images(place.image_url); const hero = gallery[0] || "/ouedna/local-architecture.webp";
  return <PlatformFrame active="/explore"><section className="place-detail-page"><div className="platform-container"><Link className="platform-back-link" href="/explore"><ArrowRight size={16} /> العودة إلى المعالم</Link><div className="place-detail-hero"><div className="place-detail-hero__image"><img src={hero} alt={place.name} /><span>{place.category || place.main_category || "معلم سياحي"}</span></div><div className="place-detail-hero__copy"><span className="platform-eyebrow"><i />تفاصيل المعلم</span><h1>{place.name}</h1><p className="place-detail-location"><MapPin size={16} /> {place.municipality || place.address || "ولاية الوادي"}</p><p className="place-detail-description">{place.description || "اكتشف تفاصيل هذا المعلم من دليل Ouedna المحلي."}</p><div className="place-detail-rating"><Star size={17} fill="currentColor" /> {place.rating ? Number(place.rating).toFixed(1) : "جديد"}<span>تقييم الدليل</span></div><PlaceDetailActions id={String(place.id)} name={place.name} /><Link className="platform-button platform-button--green place-start-route" href={`/map?place=${place.id}`}><MapPin size={17} /> ابدأ الرحلة إلى هنا</Link></div></div>{gallery.length > 1 ? <div className="place-detail-gallery">{gallery.slice(1, 5).map((image) => <img key={image} src={image} alt={`صورة من ${place.name}`} loading="lazy" />)}</div> : null}<div className="place-detail-info-grid"><article><MapPin size={20} /><div><strong>الموقع</strong><p>{place.address || place.municipality || "ولاية الوادي"}</p></div></article><article><Clock3 size={20} /><div><strong>ساعات الزيارة</strong><p>{place.opening_hours || "تحقق من المعلومات قبل الزيارة"}</p></div></article><article><Phone size={20} /><div><strong>التواصل</strong><p>{place.phone ? <a href={`tel:${place.phone}`}>{place.phone}</a> : "غير متوفر حالياً"}</p></div></article><article><Globe2 size={20} /><div><strong>البيانات</strong><p>معلومة منشورة من قاعدة Ouedna</p></div></article></div><div className="place-detail-note"><strong>تحتاج مساعدة؟</strong><p>شارك ملاحظة عن هذا المكان من صفحة المجتمع، أو اقترح تعديلاً لفريق الإدارة.</p><Link className="platform-text-link" href="/community">أرسل ملاحظة <ArrowRight size={14} /></Link></div></div></section></PlatformFrame>;
}
