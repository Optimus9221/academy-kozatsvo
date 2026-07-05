import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncEventTranslations } from "@/lib/i18n/entities";
import { logAudit } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!event) return jsonError("Не знайдено", 404);
    return jsonOk(event);
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

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        location: body.location,
        startsAt: new Date(body.startsAt),
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        imageUrl: body.imageUrl,
        status: body.status,
      },
    });

    await syncEventTranslations(id, body.translations);

    await logAudit({
      userId: session.id,
      action: "UPDATE",
      entity: "Event",
      entityId: id,
    });

    return jsonOk(event);
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
    await prisma.event.delete({ where: { id } });

    await logAudit({
      userId: session.id,
      action: "DELETE",
      entity: "Event",
      entityId: id,
    });

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
