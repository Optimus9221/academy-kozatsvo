export const locales = [
  "uk",
  "en",
  "ru",
  "he",
  "kk",
  "es",
  "de",
  "fr",
  "ar",
  "pl",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uk";

export const rtlLocales: Locale[] = ["he", "ar"];

export const localeLabels: Record<
  Locale,
  { name: string; native: string; flag: string }
> = {
  uk: { name: "Ukrainian", native: "Українська", flag: "🇺🇦" },
  en: { name: "English", native: "English", flag: "🇺🇸" },
  ru: { name: "Russian", native: "Русский", flag: "🇷🇺" },
  he: { name: "Hebrew", native: "עברית", flag: "🇮🇱" },
  kk: { name: "Kazakh", native: "Қазақша", flag: "🇰🇿" },
  es: { name: "Spanish", native: "Español", flag: "🇪🇸" },
  de: { name: "German", native: "Deutsch", flag: "🇩🇪" },
  fr: { name: "French", native: "Français", flag: "🇫🇷" },
  ar: { name: "Arabic", native: "العربية", flag: "🇸🇦" },
  pl: { name: "Polish", native: "Polski", flag: "🇵🇱" },
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
