import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageApplications } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { sendApplicationStatusUpdate } from "@/lib/email";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (!canManageApplications(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const { id } = await params;
    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return jsonError("Не знайдено", 404);
    return jsonOk(application);
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
    if (!canManageApplications(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) return jsonError("Не знайдено", 404);

    const application = await prisma.application.update({
      where: { id },
      data: {
        status: body.status,
        moderatorNote: body.moderatorNote,
      },
    });

    if (body.status && body.status !== existing.status) {
      await sendApplicationStatusUpdate({
        fullName: application.fullName,
        email: application.email,
        status: application.status,
        moderatorNote: application.moderatorNote,
      }).catch((err) => console.error("[email] status update failed:", err));
    }

    return jsonOk(application);
  } catch (error) {
    return handleApiError(error);
  }
}
