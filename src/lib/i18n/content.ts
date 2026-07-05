import type { Locale } from "@/i18n/locales";
import { defaultLocale } from "@/i18n/locales";

type TranslationRow = { locale: string } & Record<string, unknown>;

export function resolveLocalized<T extends Record<string, unknown>>(
  base: T,
  translations: TranslationRow[] | undefined,
  locale: string,
  fields: (keyof T)[]
): T {
  if (locale === defaultLocale) return base;

  const tr = translations?.find((t) => t.locale === locale);
  if (!tr) return base;

  const result = { ...base };
  for (const field of fields) {
    const value = tr[field as string];
    if (value !== null && value !== undefined && value !== "") {
      (result as Record<string, unknown>)[field as string] = value;
    }
  }
  return result;
}

export type TranslationPayload = Partial<
  Record<
    Locale,
    Record<string, string | null | undefined>
  >
>;

export async function syncTranslations<
  T extends { locale: string; [key: string]: unknown },
>(
  existing: T[],
  payload: TranslationPayload | undefined,
  create: (locale: string, data: Record<string, string>) => Promise<void>,
  update: (id: string, data: Record<string, string>) => Promise<void>,
  remove: (id: string) => Promise<void>,
  fieldMap: Record<string, string>
) {
  if (!payload) return;

  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data) continue;

    const mapped: Record<string, string> = {};
    let hasContent = false;
    for (const [apiKey, dbKey] of Object.entries(fieldMap)) {
      const val = data[apiKey];
      if (val && val.trim()) {
        mapped[dbKey] = val.trim();
        hasContent = true;
      }
    }

    const found = existing.find((t) => t.locale === locale);

    if (!hasContent) {
      if (found && "id" in found) await remove(found.id as string);
      continue;
    }

    if (found && "id" in found) {
      await update(found.id as string, mapped);
    } else {
      await create(locale, mapped);
    }
  }
}
