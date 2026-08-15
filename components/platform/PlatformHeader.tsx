"use client";

// Ouedna platform header: language and direction are driven by the shared provider.
import { Bell, Compass, Download, Globe2, Heart, History, Home, MapPinned, MessageCircle } from "lucide-react";
import Link from "next/link";
import { type DictKey, useLanguage } from "@/lib/i18n";
import PwaInstallButton from "./PwaInstallButton";

type NavItem = readonly [href: string, labelKey: DictKey, icon: typeof Compass];

export default function PlatformHeader({ active }: { active?: string }) {
  const { lang, setLang, t } = useLanguage();
  const items: NavItem[] = [
    ["/explore", "explore", Compass],
    ["/map", "map", MapPinned],
    ["/archive", "archive", History],
    ["/community", "community", MessageCircle],
    ["/favorites", "favorites", Heart],
  ];
  const mobileItems: NavItem[] = [["/", "home", Home], ...items.slice(0, 4)];

  return (
    <>
      <header className="platform-header">
        <div className="platform-header__inner">
          <Link href="/" className="platform-brand">
            <span className="platform-brand__mark"><img src="/ouedna/mark.svg" alt="" /></span>
            <span><strong>وادنا</strong><small>Ouedna · Wadi Souf</small></span>
          </Link>
          <nav className="platform-nav" aria-label={t("home")}>
            {items.map(([href, labelKey, Icon]) => <Link key={href} href={href} className={active === href ? "is-active" : ""}><Icon size={16} />{t(labelKey)}</Link>)}
          </nav>
          <div className="platform-header__actions">
            <Link href="/updates" className="platform-icon-link" aria-label={t("updates")}><Bell size={18} /><span className="platform-notification-dot" /></Link>
            <label className="platform-language" aria-label={t("language")}>
              <Globe2 size={15} />
              <select value={lang} onChange={(event) => setLang(event.target.value as typeof lang)}>
                <option value="ar">العربية</option><option value="fr">Français</option><option value="en">English</option>
              </select>
            </label>
            <PwaInstallButton />
            <Link className="platform-download-link" href="/download"><Download size={15} /> {t("downloadApp")}</Link>
          </div>
        </div>
      </header>
      <nav className="platform-mobile-nav" aria-label={t("home")}>
        {mobileItems.map(([href, labelKey, Icon]) => <Link key={href} href={href} className={active === href ? "is-active" : ""}><Icon size={19} /><span>{t(labelKey)}</span></Link>)}
      </nav>
    </>
  );
}
