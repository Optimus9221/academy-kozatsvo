import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncBranchTranslations } from "@/lib/i18n/entities";

export async function GET(request: Request) {
  try {
    const session = await requireAdminApi(canManageContent);
    if (isAuthError(session)) return session;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type")?.toUpperCase();

    const branches = await prisma.branch.findMany({
      where: type ? { type: type as "UKRAINE" | "INTERNATIONAL" } : undefined,
      include: { translations: true },
      orderBy: [{ order: "asc" }, { city: "asc" }],
    });
    return jsonOk(branches);
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
    const branch = await prisma.branch.create({
      data: {
        type: body.type,
        country: body.country || null,
        region: body.region || null,
        city: body.city,
        name: body.name,
        headName: body.headName,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        photoUrl: body.photoUrl || null,
        latitude: body.latitude != null && body.latitude !== "" ? parseFloat(body.latitude) : null,
        longitude: body.longitude != null && body.longitude !== "" ? parseFloat(body.longitude) : null,
        order: body.order ?? 0,
      },
    });

    await syncBranchTranslations(branch.id, body.translations);

    return jsonOk(branch, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
