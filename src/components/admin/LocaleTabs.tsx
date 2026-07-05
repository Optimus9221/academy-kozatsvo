"use client";

import { useTranslations } from "next-intl";
import { locales, localeLabels, defaultLocale, type Locale } from "@/i18n/locales";
import { useState } from "react";

export type TranslationFormData = Partial<
  Record<Locale, Record<string, string>>
>;

interface LocaleTabsProps {
  fields: { key: string; label: string; type?: "text" | "textarea" | "html" }[];
  values: TranslationFormData;
  onChange: (locale: Locale, key: string, value: string) => void;
  baseLocale?: Locale;
  baseValues?: Record<string, string>;
}

export function LocaleTabs({
  fields,
  values,
  onChange,
  baseLocale = defaultLocale,
  baseValues = {},
}: LocaleTabsProps) {
  const t = useTranslations("admin");
  const [activeLocale, setActiveLocale] = useState<Locale>(baseLocale);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-3 text-sm font-semibold text-dark-blue">🌐 {t("translations")}</p>
      <div className="mb-4 flex flex-wrap gap-1">
        {locales.map((loc) => {
          const hasContent = loc === baseLocale
            ? Object.values(baseValues).some(Boolean)
            : fields.some((f) => values[loc]?.[f.key]?.trim());
          return (
            <button
              key={loc}
              type="button"
              onClick={() => setActiveLocale(loc)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                activeLocale === loc
                  ? "bg-ukraine-blue text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {localeLabels[loc].flag}{" "}
              {loc.toUpperCase()}
              {hasContent && loc !== baseLocale && (
                <span className="ml-1 text-green-400">●</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {activeLocale === baseLocale ? (
          <p className="text-sm text-text-muted">
            {localeLabels[baseLocale].native} — {t("translations")} ↑
          </p>
        ) : (
          fields.map((field) => (
            <div key={field.key}>
              <label className="admin-label">
                {field.label} ({localeLabels[activeLocale].native})
              </label>
              {field.type === "textarea" || field.type === "html" ? (
                <textarea
                  className="admin-input font-mono text-sm"
                  rows={field.type === "html" ? 8 : 3}
                  value={values[activeLocale]?.[field.key] || ""}
                  onChange={(e) => onChange(activeLocale, field.key, e.target.value)}
                  placeholder={`${field.label} (${activeLocale})`}
                />
              ) : (
                <input
                  className="admin-input"
                  value={values[activeLocale]?.[field.key] || ""}
                  onChange={(e) => onChange(activeLocale, field.key, e.target.value)}
                  placeholder={`${field.label} (${activeLocale})`}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function buildTranslationPayload(
  values: TranslationFormData
): TranslationFormData {
  const result: TranslationFormData = {};
  for (const loc of locales) {
    if (loc === defaultLocale) continue;
    const data = values[loc];
    if (!data) continue;
    const filtered: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v?.trim()) filtered[k] = v.trim();
    }
    if (Object.keys(filtered).length > 0) result[loc] = filtered;
  }
  return result;
}
