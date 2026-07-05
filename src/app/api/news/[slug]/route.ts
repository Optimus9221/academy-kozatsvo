import { prisma } from "@/lib/db";
import { jsonOk, jsonError, handleApiError } from "@/lib/api-utils";
import { getLocaleFromRequest } from "@/lib/settings";
import { localizeNews } from "@/lib/i18n/entities";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const locale = getLocaleFromRequest(request);
  const { slug } = await params;
  const news = await prisma.news.findUnique({
    where: { slug },
    include: {
      tags: { include: { tag: true } },
      images: true,
      translations: true,
    },
  });

  if (!news || news.status !== "PUBLISHED") {
    return jsonError("Новину не знайдено", 404);
  }

  const related = await prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      NOT: { id: news.id },
    },
    include: { translations: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return jsonOk({
    news: localizeNews(news, locale),
    related: related.map((n) => localizeNews(n, locale)),
  });
}
