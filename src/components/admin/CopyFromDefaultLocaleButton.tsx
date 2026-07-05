"use client";

import { useTranslations } from "next-intl";
import { defaultLocale, locales, type Locale } from "@/i18n/locales";

interface Props {
  baseValues: Record<string, string>;
  onCopy: (translations: Partial<Record<Locale, Record<string, string>>>) => void;
}

/** Demo helper: copies Ukrainian base fields into empty translation slots */
export function CopyFromDefaultLocaleButton({ baseValues, onCopy }: Props) {
  const t = useTranslations("admin");

  function handleCopy() {
    const result: Partial<Record<Locale, Record<string, string>>> = {};
    for (const loc of locales) {
      if (loc === defaultLocale) continue;
      result[loc] = { ...baseValues };
    }
    onCopy(result);
  }

  return (
    <button type="button" onClick={handleCopy} className="admin-btn mb-4 text-sm">
      📋 {t("copyTranslations")}
    </button>
  );
}
