import type { Metadata } from "next";
import { locales, defaultLocale, type Locale } from "@/i18n/locales";

export function getSiteBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function getLocalizedPath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function buildAlternates(path: string): Record<string, string> {
  const baseUrl = getSiteBaseUrl();
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${baseUrl}${getLocalizedPath(path, locale)}`;
  }
  languages["x-default"] = `${baseUrl}${getLocalizedPath(path, defaultLocale)}`;
  return languages;
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
}: {
  locale: string;
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
}): Metadata {
  const baseUrl = getSiteBaseUrl();
  const url = `${baseUrl}${getLocalizedPath(path, locale as Locale)}`;
  const imageUrl = image?.startsWith("http")
    ? image
    : image
      ? `${baseUrl}${image}`
      : undefined;

  return {
    title,
    description: description || undefined,
    alternates: {
      canonical: url,
      languages: buildAlternates(path),
    },
    openGraph: {
      title,
      description: description || undefined,
      url,
      locale,
      type,
      siteName: "Міжнародна Академія Козацтва",
      ...(imageUrl ? { images: [{ url: imageUrl, alt: title }] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description: description || undefined,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
