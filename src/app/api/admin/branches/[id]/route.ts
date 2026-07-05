import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncBranchTranslations } from "@/lib/i18n/entities";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const { id } = await params;
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!branch) return jsonError("Не знайдено", 404);
    return jsonOk(branch);
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

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        type: body.type,
        country: body.country,
        region: body.region,
        city: body.city,
        name: body.name,
        headName: body.headName,
        phone: body.phone,
        email: body.email,
        address: body.address,
        photoUrl: body.photoUrl,
        latitude: body.latitude != null && body.latitude !== "" ? parseFloat(body.latitude) : null,
        longitude: body.longitude != null && body.longitude !== "" ? parseFloat(body.longitude) : null,
        order: body.order,
      },
    });

    await syncBranchTranslations(id, body.translations);

    return jsonOk(branch);
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
    await prisma.branch.delete({ where: { id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
