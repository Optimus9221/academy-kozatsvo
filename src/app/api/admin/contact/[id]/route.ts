import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageApplications } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (!canManageApplications(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: body.isRead ?? true },
    });

    return jsonOk(message);
  } catch (error) {
    return handleApiError(error);
  }
}
