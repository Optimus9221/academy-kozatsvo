import { prisma } from "@/lib/db";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageUsers } from "@/lib/permissions";
import { handleApiError, jsonOk } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const session = await requireAdminApi(canManageUsers);
    if (isAuthError(session)) return session;

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), 500);
    const entity = url.searchParams.get("entity");

    const logs = await prisma.auditLog.findMany({
      where: entity ? { entity } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const userIds = [...new Set(logs.map((l) => l.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const enriched = logs.map((log) => ({
      ...log,
      user: userMap[log.userId] || null,
    }));

    return jsonOk(enriched);
  } catch (error) {
    return handleApiError(error);
  }
}
