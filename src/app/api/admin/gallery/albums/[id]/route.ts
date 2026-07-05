import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncAlbumTranslations } from "@/lib/i18n/entities";

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

    const album = await prisma.galleryAlbum.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        coverImageUrl: body.coverImageUrl,
      },
    });

    await syncAlbumTranslations(id, body.translations);

    return jsonOk(album);
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
    await prisma.galleryAlbum.delete({ where: { id } });
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
    const album = await prisma.galleryAlbum.findUnique({
      where: { id },
      include: { items: { orderBy: { order: "asc" } }, translations: true },
    });
    if (!album) return jsonError("Не знайдено", 404);
    return jsonOk(album);
  } catch (error) {
    return handleApiError(error);
  }
}
