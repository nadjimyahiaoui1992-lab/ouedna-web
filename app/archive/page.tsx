import { Image as ImageIcon } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import PlatformFrame from "@/components/platform/PlatformFrame";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

function imageList(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(imageList);
  if (typeof value !== "string") return [];
  const clean = value.trim().replace(/[\[\]"']/g, "");
  return clean.split(",").map((image) => image.trim()).filter(Boolean);
}

function uniqueImages(...values: unknown[]) {
  return Array.from(new Set(values.flatMap(imageList)));
}

async function getMemories() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const [{ data: memories }, { data: heritage }] = await Promise.all([
    supabase.from("old_memories").select("id,image_url,gallery,caption,year,created_at").order("created_at", { ascending: false }),
    supabase.from("heritage").select("id,image,gallery,title,text,year,created_at").order("created_at", { ascending: false }),
  ]);

  const archive = [
    ...(memories || []).map((item) => ({ id: `memory-${item.id}`, caption: item.caption, year: item.year, created_at: item.created_at, images: uniqueImages(item.image_url, item.gallery) })),
    ...(heritage || []).map((item) => ({ id: `heritage-${item.id}`, caption: item.title ? `${item.title}${item.text ? ` — ${item.text}` : ""}` : item.text, year: item.year, created_at: item.created_at, images: uniqueImages(item.image, item.gallery) })),
  ];

  return archive.filter((item) => item.images.length > 0);
}

export default async function ArchivePage() {
  const memories = await getMemories();
  return <PlatformFrame active="/archive"><section className="platform-page platform-archive-page"><div className="platform-container"><div className="platform-page-hero"><div><span className="platform-eyebrow"><i />03 / ذاكرة الوادي</span><h1>صور تحفظ<br /><em>روح المكان.</em></h1><p>أرشيف بصري لولاية الوادي، يجمع الذكريات القديمة والمواد التراثية التي يشاركها أهل سوف.</p></div><div className="platform-page-hero__aside platform-page-hero__aside--image"><img src="/ouedna/local-architecture.webp" alt="عمارة وادي سوف" /><span><ImageIcon size={14} /> أرشيف حي</span></div></div><div className="platform-archive-intro"><span>{memories.length}</span><p>مادة منشورة<br />تستحق التوقف.</p></div>{memories.length ? <div className="platform-archive-grid">{memories.map((memory) => <article className="platform-archive-card" key={memory.id}><img src={memory.images[0]} alt={memory.caption || "ذاكرة من وادي سوف"} loading="lazy" />{memory.images.length > 1 ? <div className="platform-archive-card__gallery" aria-label={`${memory.images.length} صور موثقة`}><img src={memory.images[1]} alt="صورة إضافية من الأرشيف" loading="lazy" />{memory.images.length > 2 ? <span>+{memory.images.length - 2}</span> : null}</div> : null}<div className="platform-archive-card__content"><span>{memory.year || "تاريخ قيد التوثيق"}</span><h2>{memory.caption || "من ذاكرة الوادي"}</h2><p>{memory.images.length > 1 ? `${memory.images.length} صور موثقة ضمن هذه المادة` : "صورة واحدة موثقة ضمن هذه المادة"}</p></div></article>)}</div> : <div className="platform-empty-panel"><ImageIcon size={28} /><h2>الأرشيف قيد التوسعة</h2><p>ستظهر هنا الصور التي تعتمدها الإدارة من ذاكرة وادي سوف.</p></div>}</div></section></PlatformFrame>;
}
