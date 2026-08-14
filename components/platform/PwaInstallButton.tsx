"use client";

import { DownloadCloud, Info, MonitorDown } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function PwaInstallButton({ compact = true }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null); const [helpOpen, setHelpOpen] = useState(false); const [installed, setInstalled] = useState(false);
  useEffect(() => { const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent); }; const onInstalled = () => { setInstalled(true); setPrompt(null); setHelpOpen(false); }; window.addEventListener("beforeinstallprompt", onPrompt); window.addEventListener("appinstalled", onInstalled); if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true); return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); }; }, []);
  async function install() { if (prompt) { await prompt.prompt(); await prompt.userChoice; setPrompt(null); return; } setHelpOpen((value) => !value); }
  if (installed) return null;
  return <span className={`pwa-install-wrap${compact ? " pwa-install-wrap--compact" : ""}`}><button type="button" className={`pwa-install-button${compact ? " pwa-install-button--compact" : ""}`} onClick={install}><MonitorDown size={compact ? 15 : 17} />{compact ? "ثبّت الموقع" : "تثبيت الموقع كتطبيق"}</button>{helpOpen && <span className="pwa-install-help"><Info size={14} /><span>على الكمبيوتر استخدم زر التثبيت في شريط العنوان. على iPhone افتح المشاركة ثم اختر «إضافة إلى الشاشة الرئيسية».</span></span>}</span>;
}
