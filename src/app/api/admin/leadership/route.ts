import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncLeaderTranslations } from "@/lib/i18n/entities";

export async function GET() {
  const leaders = await prisma.leader.findMany({
    include: { videos: true, translations: true },
    orderBy: { order: "asc" },
  });
  return jsonOk(leaders);
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageContent(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const body = await request.json();
    const leader = await prisma.leader.create({
      data: {
        name: body.name,
        position: body.position,
        photoUrl: body.photoUrl || null,
        bio: body.bio || "",
        order: body.order ?? 0,
        phone: body.phone || null,
        email: body.email || null,
        showHomeMessage: Boolean(body.showHomeMessage),
      },
    });

    if (Array.isArray(body.videos)) {
      for (const video of body.videos) {
        if (!video.youtubeUrl) continue;
        await prisma.leaderVideo.create({
          data: {
            leaderId: leader.id,
            youtubeUrl: video.youtubeUrl,
            title: video.title || null,
          },
        });
      }
    }

    await syncLeaderTranslations(leader.id, body.translations);

    return jsonOk(leader, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
