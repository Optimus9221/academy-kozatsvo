import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { uniqueSlug } from "@/lib/slug";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncAlbumTranslations } from "@/lib/i18n/entities";

export async function GET() {
  const albums = await prisma.galleryAlbum.findMany({
    include: {
      items: { orderBy: { order: "asc" } },
      translations: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(albums);
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageContent(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const body = await request.json();
    const slug = await uniqueSlug(body.title, async (s) => {
      const existing = await prisma.galleryAlbum.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const album = await prisma.galleryAlbum.create({
      data: {
        title: body.title,
        slug,
        description: body.description || "",
        coverImageUrl: body.coverImageUrl || null,
      },
    });

    await syncAlbumTranslations(album.id, body.translations);

    return jsonOk(album, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
