import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { locales } from "@/i18n/locales";
import { getSiteBaseUrl, getLocalizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/locales";

export const revalidate = 3600;

const staticPaths = [
  "",
  "/about",
  "/branches/ukraine",
  "/branches/international",
  "/leadership",
  "/gallery",
  "/news",
  "/partners",
  "/join/rules",
  "/join/apply",
  "/join/faq",
  "/legal/privacy",
  "/about/documents",
  "/about/documents/statut",
  "/search",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();

  const [news, albums] = await Promise.all([
    prisma.news.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.galleryAlbum.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${baseUrl}${getLocalizedPath(path, locale as Locale)}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.8,
      });
    }

    for (const item of news) {
      entries.push({
        url: `${baseUrl}${getLocalizedPath(`/news/${item.slug}`, locale as Locale)}`,
        lastModified: item.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const album of albums) {
      entries.push({
        url: `${baseUrl}${getLocalizedPath(`/gallery/${album.slug}`, locale as Locale)}`,
        lastModified: album.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
