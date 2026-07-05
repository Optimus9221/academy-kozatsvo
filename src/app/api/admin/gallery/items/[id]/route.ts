import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";

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

    const item = await prisma.galleryItem.update({
      where: { id },
      data: {
        type: body.type,
        imageUrl: body.imageUrl,
        youtubeUrl: body.youtubeUrl,
        title: body.title,
        caption: body.caption,
        order: body.order,
      },
    });

    return jsonOk(item);
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
    await prisma.galleryItem.delete({ where: { id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
