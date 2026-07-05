import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncFaqItemTranslations } from "@/lib/i18n/entities";
import { logAudit } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const { id } = await params;
    const item = await prisma.faqItem.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!item) return jsonError("Не знайдено", 404);
    return jsonOk(item);
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

    const item = await prisma.faqItem.update({
      where: { id },
      data: {
        question: body.question,
        answerHtml: body.answerHtml,
        order: body.order,
      },
    });

    await syncFaqItemTranslations(id, body.translations);

    await logAudit({
      userId: session.id,
      action: "UPDATE",
      entity: "FaqItem",
      entityId: id,
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
    await prisma.faqItem.delete({ where: { id } });

    await logAudit({
      userId: session.id,
      action: "DELETE",
      entity: "FaqItem",
      entityId: id,
    });

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
