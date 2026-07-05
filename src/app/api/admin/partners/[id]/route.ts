import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncPartnerTranslations } from "@/lib/i18n/entities";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const { id } = await params;
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!partner) return jsonError("Не знайдено", 404);
    return jsonOk(partner);
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

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name: body.name,
        logoUrl: body.logoUrl,
        description: body.description,
        websiteUrl: body.websiteUrl,
        order: body.order,
      },
    });

    await syncPartnerTranslations(id, body.translations);

    return jsonOk(partner);
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
    await prisma.partner.delete({ where: { id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
