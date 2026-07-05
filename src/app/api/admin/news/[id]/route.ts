import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncNewsTranslations } from "@/lib/i18n/entities";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (!canManageContent(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const news = await prisma.news.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        previewText: body.previewText,
        body: body.body,
        mainImageUrl: body.mainImageUrl,
        status: body.status,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        author: body.author,
        youtubeUrl: body.youtubeUrl,
      },
    });

    if (Array.isArray(body.tags)) {
      await prisma.newsTagRelation.deleteMany({ where: { newsId: id } });
      for (const name of body.tags) {
        const trimmed = name.trim();
        if (!trimmed) continue;
        const slug = trimmed.toLowerCase().replace(/\s+/g, "-");
        const tag = await prisma.newsTag.upsert({
          where: { slug },
          create: { name: trimmed, slug },
          update: { name: trimmed },
        });
        await prisma.newsTagRelation.create({
          data: { newsId: id, tagId: tag.id },
        });
      }
    }

    await syncNewsTranslations(id, body.translations);

    return jsonOk(news);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (!canManageContent(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const { id } = await params;
    await prisma.news.delete({ where: { id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const { id } = await params;
    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        images: true,
        translations: true,
      },
    });
    if (!news) return jsonError("Не знайдено", 404);
    return jsonOk(news);
  } catch (error) {
    return handleApiError(error);
  }
}
