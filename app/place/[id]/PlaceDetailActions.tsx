"use client";

import { Check, Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function PlaceDetailActions({ id, name }: { id: string; name: string }) {
  const [saved, setSaved] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => { const values = JSON.parse(localStorage.getItem("souf360_favorites") || "[]").map(String); setSaved(values.includes(id)); }, [id]);
  function toggle() { const values = new Set(JSON.parse(localStorage.getItem("souf360_favorites") || "[]").map(String)); if (values.has(id)) values.delete(id); else values.add(id); localStorage.setItem("souf360_favorites", JSON.stringify([...values])); setSaved(values.has(id)); }
  async function share() { const url = window.location.href; if (navigator.share) await navigator.share({ title: name, text: `اكتشف ${name} مع Ouedna`, url }); else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } }
  return <div className="place-detail-actions"><button type="button" className={`platform-button ${saved ? "platform-button--amber" : "platform-button--outline"}`} onClick={toggle}><Heart size={17} fill={saved ? "currentColor" : "none"} />{saved ? "محفوظ" : "إضافة للمفضلة"}</button><button type="button" className="place-share-button" onClick={share}>{copied ? <Check size={17} /> : <Share2 size={17} />}{copied ? "تم نسخ الرابط" : "مشاركة المكان"}</button></div>;
}
