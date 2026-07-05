import type { UserRole } from "@/generated/prisma/client";
import { requireSession, type SessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/api-utils";

type PermissionCheck = (role: UserRole) => boolean;

export async function requireAdminApi(
  check: PermissionCheck
): Promise<SessionUser | Response> {
  try {
    const session = await requireSession();
    if (!check(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }
    return session;
  } catch {
    return jsonError("Не авторизовано", 401);
  }
}

export function isAuthError(result: SessionUser | Response): result is Response {
  return result instanceof Response;
}
