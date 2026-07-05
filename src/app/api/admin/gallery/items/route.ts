import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageContent(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const body = await request.json();
    const item = await prisma.galleryItem.create({
      data: {
        albumId: body.albumId,
        type: body.type,
        imageUrl: body.imageUrl || null,
        youtubeUrl: body.youtubeUrl || null,
        title: body.title || null,
        caption: body.caption || null,
        order: body.order ?? 0,
      },
    });

    return jsonOk(item, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
