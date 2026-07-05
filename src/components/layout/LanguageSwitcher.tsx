"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/locales";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = localeLabels[locale];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur transition hover:bg-white/20 ${
          compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
        aria-label="Language"
      >
        <span>{current.flag}</span>
        {!compact && <span className="font-medium">{current.native}</span>}
        <svg
          className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-56 overflow-auto rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
          {locales.map((loc) => {
            const info = localeLabels[loc];
            const active = loc === locale;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  router.replace(pathname, { locale: loc });
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-blue-50 ${
                  active ? "bg-blue-50 font-semibold text-ukraine-blue" : "text-gray-700"
                }`}
              >
                <span className="text-lg">{info.flag}</span>
                <div>
                  <div>{info.native}</div>
                  <div className="text-xs text-gray-400">{info.name}</div>
                </div>
                {active && <span className="ml-auto text-ukraine-blue">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminLanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = localeLabels[locale];

  return (
    <div className="relative px-4 pb-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-blue-200 hover:bg-white/10"
      >
        <span>{current.flag}</span>
        <span>{current.native}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-4 right-4 z-50 mb-1 max-h-64 overflow-auto rounded-lg border border-white/10 bg-dark-blue py-1 shadow-xl">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                router.replace(pathname, { locale: loc });
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 ${
                loc === locale ? "text-ukraine-yellow" : "text-blue-200"
              }`}
            >
              {localeLabels[loc].flag} {localeLabels[loc].native}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
