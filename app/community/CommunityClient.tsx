"use client";

import { Camera, CheckCircle2, Image as ImageIcon, LoaderCircle, MessageSquareHeart, Send, Star } from "lucide-react";
import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

type Experience = { id: string | number; name?: string | null; message: string; photos?: unknown; created_at?: string };

function images(value: unknown) { if (Array.isArray(value)) return value.map(String); if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",").map((item) => item.trim()).filter(Boolean); return []; }

export default function CommunityClient({ experiences }: { experiences: Experience[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(""); const [message, setMessage] = useState(""); const [files, setFiles] = useState<File[]>([]); const [sending, setSending] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState("");
  const submit = async () => {
    if (!message.trim()) { setError("اكتب تجربتك أولاً."); return; }
    setSending(true); setError("");
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); const photoUrls: string[] = [];
      for (const file of files.slice(0, 5)) { const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_"); const path = `testimonials/${Date.now()}-${safeName}`; const upload = await supabase.storage.from("testimonials-photos").upload(path, file, { cacheControl: "3600", upsert: false }); if (upload.error) throw upload.error; photoUrls.push(supabase.storage.from("testimonials-photos").getPublicUrl(path).data.publicUrl); }
      const insert = await supabase.from("testimonials").insert({ name: name.trim() || null, message: message.trim(), photos: photoUrls, status: "pending" }); if (insert.error) throw insert.error;
      setDone(true); setName(""); setMessage(""); setFiles([]); if (fileRef.current) fileRef.current.value = "";
    } catch (caught) { setError(caught instanceof Error ? caught.message : "تعذر إرسال التجربة حالياً."); } finally { setSending(false); }
  };
  return <div className="platform-community-layout"><div className="platform-community-feed"><div className="platform-community-feed__head"><div><span className="platform-eyebrow">تجارب منشورة بعد المراجعة</span><h2>تجارب تلهمك.</h2></div><span><Star size={13} /> {experiences.length} تجربة</span></div><div className="platform-experience-list">{experiences.length ? experiences.map((item) => <article className="platform-experience-card" key={item.id}><span className="platform-experience-card__quote">“</span><p>{item.message}</p><footer><strong>{item.name || "زائر وادنا"}</strong><small>{item.created_at ? new Date(item.created_at).toLocaleDateString("ar-DZ") : ""}</small></footer>{images(item.photos).length ? <div className="platform-experience-card__photos">{images(item.photos).slice(0, 4).map((photo) => <img key={photo} src={photo} alt="صورة من تجربة زائر" />)}</div> : null}</article>) : <div className="platform-empty-panel"><MessageSquareHeart size={28} /><h2>كن أول من يشارك</h2><p>لا توجد تجارب منشورة بعد. اترك أثراً صادقاً للزائر التالي.</p></div>}</div></div><aside className="platform-community-panel"><div className="platform-community-form-head"><Camera size={22} /><h2>شارك أثراً من رحلتك</h2><p>ستُراجع التجربة قبل نشرها حفاظاً على جودة الدليل.</p></div>{done ? <div className="platform-community-success"><CheckCircle2 size={30} /><h3>شكراً لمشاركتك.</h3><p>وصلت تجربتك إلى الإدارة للمراجعة.</p><button type="button" onClick={() => setDone(false)}>إضافة تجربة أخرى</button></div> : <div className="platform-community-form"><label>الاسم (اختياري)<input value={name} onChange={(event) => setName(event.target.value)} placeholder="اسمك" /></label><label>تجربتك *<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="ما الذي ترك أثراً في رحلتك؟" rows={5} /></label><label className="platform-file-input"><ImageIcon size={16} />{files.length ? `${files.length} صور مختارة` : "أرفق صوراً (اختياري)"}<input ref={fileRef} type="file" accept="image/*" multiple onChange={(event) => setFiles(event.target.files ? Array.from(event.target.files) : [])} /></label>{error && <p className="platform-form-notice">{error}</p>}<button type="button" className="platform-button platform-button--amber" disabled={sending} onClick={submit}>{sending ? <LoaderCircle className="platform-spin" size={16} /> : <Send size={16} />}{sending ? "جارٍ الإرسال..." : "إرسال للمراجعة"}</button></div>}</aside></div>;
}
