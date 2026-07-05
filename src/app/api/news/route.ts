import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-utils";
import { getLocaleFromRequest } from "@/lib/settings";
import { localizeNews } from "@/lib/i18n/entities";

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");
  const limit = searchParams.get("limit");
  const admin = searchParams.get("admin") === "true";

  const where: Record<string, unknown> = {};
  if (!admin) {
    where.status = "PUBLISHED";
    where.publishedAt = { lte: new Date() };
  } else if (status) {
    where.status = status.toUpperCase();
  }

  const news = await prisma.news.findMany({
    where,
    include: {
      tags: { include: { tag: true } },
      images: true,
      translations: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit ? parseInt(limit, 10) : undefined,
  });

  const filtered = tag
    ? news.filter((item) =>
        item.tags.some((t) => t.tag.slug === tag || t.tag.name === tag)
      )
    : news;

  return jsonOk(filtered.map((n) => localizeNews(n, locale)));
}
