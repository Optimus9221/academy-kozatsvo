import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { uniqueSlug } from "@/lib/slug";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncEventTranslations } from "@/lib/i18n/entities";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const events = await prisma.event.findMany({
      include: { translations: true },
      orderBy: { startsAt: "desc" },
    });
    return jsonOk(events);
  } catch (error) {
    return handleApiError(error);
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
      const existing = await prisma.event.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const event = await prisma.event.create({
      data: {
        title: body.title,
        slug,
        description: body.description || null,
        location: body.location || null,
        startsAt: new Date(body.startsAt),
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        imageUrl: body.imageUrl || null,
        status: body.status || "UPCOMING",
      },
    });

    await syncEventTranslations(event.id, body.translations);

    await logAudit({
      userId: session.id,
      action: "CREATE",
      entity: "Event",
      entityId: event.id,
    });

    return jsonOk(event, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
