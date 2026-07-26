'use client';

import { useState, useRef, useEffect } from 'react';
import { Languages, Check } from 'lucide-react';
import { LANGUAGES, useLanguage } from '@/lib/i18n';

/* مبدّل اللغة — قائمة منسدلة مدمجة تعمل فوق أي خلفية (فاتحة كانت أو داكنة) */
export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('language')}
        className={`flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-sm'
        } font-bold`}
      >
        <Languages size={14} className="text-amber-400" />
        <span>{current.flag}</span>
        {!compact && <span className="hidden sm:inline">{current.label}</span>}
      </button>

      {open && (
        <div
          className="absolute z-50 top-[calc(100%+8px)] end-0 min-w-[9.5rem] bg-[#171310] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-bold transition ${
                l.code === lang ? 'text-amber-400 bg-amber-500/10' : 'text-stone-200 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </span>
              {l.code === lang && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}