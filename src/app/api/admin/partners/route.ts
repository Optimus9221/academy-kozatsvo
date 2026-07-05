import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncPartnerTranslations } from "@/lib/i18n/entities";

export async function GET() {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const partners = await prisma.partner.findMany({
      orderBy: { order: "asc" },
      include: { translations: true },
    });
    return jsonOk(partners);
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
    const partner = await prisma.partner.create({
      data: {
        name: body.name,
        logoUrl: body.logoUrl || null,
        description: body.description || "",
        websiteUrl: body.websiteUrl || null,
        order: body.order ?? 0,
      },
    });

    await syncPartnerTranslations(partner.id, body.translations);

    return jsonOk(partner, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
