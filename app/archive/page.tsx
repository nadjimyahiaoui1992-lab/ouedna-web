import { Image as ImageIcon } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import PlatformFrame from "@/components/platform/PlatformFrame";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

function firstImage(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (typeof value === "string") {
    const clean = value.trim().replace(/[\[\]"']/g, "");
    return clean.split(",")[0]?.trim() || "";
  }
  return "";
}

async function getMemories() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const [{ data: memories }, { data: heritage }] = await Promise.all([
    supabase.from("old_memories").select("id,image_url,caption,year,created_at").order("created_at", { ascending: false }),
    supabase.from("heritage").select("id,image,title,text,created_at").order("created_at", { ascending: false }),
  ]);
  return [...(memories || []), ...(heritage || []).map((item) => ({ id: `heritage-${item.id}`, image_url: item.image, caption: item.title ? `${item.title} — ${item.text || ""}` : item.text, year: null }))].map((item) => ({ ...item, image: firstImage(item.image_url) })).filter((item) => item.image);
}

export default async function ArchivePage() {
  const memories = await getMemories();
  return <PlatformFrame active="/archive"><section className="platform-page platform-archive-page"><div className="platform-container"><div className="platform-page-hero"><div><span className="platform-eyebrow"><i />03 / ذاكرة الوادي</span><h1>صور تحفظ<br /><em>روح المكان.</em></h1><p>أرشيف بصري لولاية الوادي، يجمع الذكريات القديمة والمواد التراثية التي يشاركها أهل سوف.</p></div><div className="platform-page-hero__aside platform-page-hero__aside--image"><img src="/ouedna/local-architecture.webp" alt="عمارة وادي سوف" /><span><ImageIcon size={14} /> أرشيف حي</span></div></div><div className="platform-archive-intro"><span>{memories.length}</span><p>صورة وذكرى منشورة<br />تستحق التوقف.</p></div>{memories.length ? <div className="platform-archive-grid">{memories.map((memory) => <figure key={String(memory.id)}><img src={memory.image} alt={memory.caption || "ذاكرة من وادي سوف"} loading="lazy" /><figcaption>{memory.caption || "من ذاكرة الوادي"}{memory.year ? <small>{memory.year}</small> : null}</figcaption></figure>)}</div> : <div className="platform-empty-panel"><ImageIcon size={28} /><h2>الأرشيف قيد التوسعة</h2><p>ستظهر هنا الصور التي تعتمدها الإدارة من ذاكرة وادي سوف.</p></div>}</div></section></PlatformFrame>;
}
