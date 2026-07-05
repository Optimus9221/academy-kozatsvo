import { prisma } from "@/lib/db";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageApplications } from "@/lib/permissions";
import { handleApiError, jsonOk } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const session = await requireAdminApi(canManageApplications);
    if (isAuthError(session)) return session;

    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get("unread") === "true";

    const messages = await prisma.contactMessage.findMany({
      where: unreadOnly ? { isRead: false } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(messages);
  } catch (error) {
    return handleApiError(error);
  }
}
