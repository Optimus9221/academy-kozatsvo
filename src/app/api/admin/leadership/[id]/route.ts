import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncLeaderTranslations } from "@/lib/i18n/entities";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const { id } = await params;
    const leader = await prisma.leader.findUnique({
      where: { id },
      include: { videos: true, translations: true },
    });
    if (!leader) return jsonError("Не знайдено", 404);
    return jsonOk(leader);
  } catch (error) {
    return handleApiError(error);
  }
}

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

    const leader = await prisma.leader.update({
      where: { id },
      data: {
        name: body.name,
        position: body.position,
        photoUrl: body.photoUrl,
        bio: body.bio,
        order: body.order,
        phone: body.phone,
        email: body.email,
        showHomeMessage: Boolean(body.showHomeMessage),
      },
    });

    if (Array.isArray(body.videos)) {
      await prisma.leaderVideo.deleteMany({ where: { leaderId: id } });
      for (const video of body.videos) {
        if (!video.youtubeUrl) continue;
        await prisma.leaderVideo.create({
          data: {
            leaderId: id,
            youtubeUrl: video.youtubeUrl,
            title: video.title || null,
          },
        });
      }
    }

    await syncLeaderTranslations(id, body.translations);

    return jsonOk(leader);
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
    await prisma.leader.delete({ where: { id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
