import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncFaqItemTranslations } from "@/lib/i18n/entities";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const items = await prisma.faqItem.findMany({
      include: { translations: true },
      orderBy: { order: "asc" },
    });
    return jsonOk(items);
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
    const item = await prisma.faqItem.create({
      data: {
        question: body.question,
        answerHtml: body.answerHtml || "",
        order: body.order ?? 0,
      },
    });

    await syncFaqItemTranslations(item.id, body.translations);

    await logAudit({
      userId: session.id,
      action: "CREATE",
      entity: "FaqItem",
      entityId: item.id,
    });

    return jsonOk(item, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
