import { prisma } from "@/lib/db";
import { hashPassword, requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageUsers } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/generated/prisma/client";

export async function GET() {
  try {
    const session = await requireAdminApi(canManageUsers);
    if (isAuthError(session)) return session;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageUsers(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const body = await request.json();
    const name = body.name?.toString().trim();
    const email = body.email?.toString().trim().toLowerCase();
    const password = body.password?.toString();
    const role = (body.role || "EDITOR") as UserRole;

    if (!name || !email || !password) {
      return jsonError("Заповніть усі обов'язкові поля");
    }

    if (password.length < 6) {
      return jsonError("Пароль має містити щонайменше 6 символів");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("Користувач з таким email вже існує", 409);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logAudit({
      userId: session.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      details: JSON.stringify({ email, role }),
    });

    return jsonOk(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
