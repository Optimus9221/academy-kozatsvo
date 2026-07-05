import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { uniqueSlug } from "@/lib/slug";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncNewsTranslations } from "@/lib/i18n/entities";

async function syncTags(newsId: string, tagNames: string[]) {
  await prisma.newsTagRelation.deleteMany({ where: { newsId } });

  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const slug = trimmed.toLowerCase().replace(/\s+/g, "-");
    const tag = await prisma.newsTag.upsert({
      where: { slug },
      create: { name: trimmed, slug },
      update: { name: trimmed },
    });
    await prisma.newsTagRelation.create({
      data: { newsId, tagId: tag.id },
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageContent(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const body = await request.json();
    const slug = await uniqueSlug(body.title, async (s) => {
      const existing = await prisma.news.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const news = await prisma.news.create({
      data: {
        title: body.title,
        slug,
        previewText: body.previewText || "",
        body: body.body || "",
        mainImageUrl: body.mainImageUrl || null,
        status: body.status || "DRAFT",
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        author: body.author || session.name,
        youtubeUrl: body.youtubeUrl || null,
      },
    });

    if (Array.isArray(body.tags)) {
      await syncTags(news.id, body.tags);
    }

    if (Array.isArray(body.images)) {
      for (const img of body.images) {
        await prisma.newsImage.create({
          data: {
            newsId: news.id,
            imageUrl: img.imageUrl,
            caption: img.caption || null,
          },
        });
      }
    }

    await syncNewsTranslations(news.id, body.translations);

    return jsonOk(news, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const where = status ? { status: status.toUpperCase() as "DRAFT" | "PUBLISHED" | "HIDDEN" } : {};

  const news = await prisma.news.findMany({
    where,
    include: { tags: { include: { tag: true } }, translations: true },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(news);
}
