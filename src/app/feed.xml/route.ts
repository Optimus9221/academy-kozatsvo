import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { getSiteBaseUrl, getLocalizedPath } from "@/lib/seo";
import { defaultLocale } from "@/i18n/locales";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = getSiteBaseUrl();
  const settings = await getSiteSettings(defaultLocale);

  const news = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      slug: true,
      title: true,
      previewText: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  const channelLink = `${baseUrl}${getLocalizedPath("/news", defaultLocale)}`;
  const items = news
    .map((item) => {
      const link = `${baseUrl}${getLocalizedPath(`/news/${item.slug}`, defaultLocale)}`;
      const pubDate = item.publishedAt?.toUTCString() ?? item.updatedAt.toUTCString();

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(item.previewText || "")}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(settings.siteName)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(settings.defaultSeoDescription || settings.heroSlogan || "")}</description>
    <language>uk</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
