"use client";

// Shared Ouedna navigation for public Next.js routes.
import { Bell, Compass, Download, Globe2, Heart, History, MapPinned, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function PlatformHeader({ active }: { active?: string }) {
  const items = [
    ["/explore", "استكشف", Compass],
    ["/map", "الخريطة", MapPinned],
    ["/archive", "ذاكرة الوادي", History],
    ["/community", "المجتمع", MessageCircle],
    ["/favorites", "المفضلة", Heart],
  ] as const;
  return <header className="platform-header"><div className="platform-header__inner"><Link href="/" className="platform-brand"><span className="platform-brand__mark"><img src="/ouedna/mark.svg" alt="" /></span><span><strong>وادنا</strong><small>Ouedna · Wadi Souf</small></span></Link><nav className="platform-nav" aria-label="التنقل الرئيسي">{items.map(([href, label, Icon]) => <Link key={href} href={href} className={active === href ? "is-active" : ""}><Icon size={16} />{label}</Link>)}</nav><div className="platform-header__actions"><Link href="/updates" className="platform-icon-link" aria-label="مركز التحديثات"><Bell size={18} /><span className="platform-notification-dot" /></Link><label className="platform-language" aria-label="اللغة"><Globe2 size={15} /><select defaultValue="ar" onChange={(event) => { if (typeof window !== "undefined") localStorage.setItem("ouedna.language", event.target.value); }}><option value="ar">العربية</option><option value="fr">Français</option><option value="en">English</option></select></label><Link className="platform-download-link" href="/download"><Download size={15} /> حمّل التطبيق</Link></div></div></header>;
}
