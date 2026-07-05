import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { getJoinRules } from "@/lib/settings";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncJoinRulesTranslations } from "@/lib/i18n/entities";

export async function GET() {
  const rules = await getJoinRules();
  return jsonOk(rules);
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageContent(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const body = await request.json();
    const existing = await getJoinRules();

    await prisma.joinRules.update({
      where: { id: existing.id },
      data: {
        contentHtml: body.contentHtml,
        pdfUrls: JSON.stringify(body.pdfUrls || []),
      },
    });

    await syncJoinRulesTranslations(existing.id, body.translations);

    const updated = await getJoinRules();
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
