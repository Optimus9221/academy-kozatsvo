import { prisma } from "@/lib/db";
import { hashPassword, requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageUsers } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/generated/prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (!canManageUsers(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const data: {
      name?: string;
      email?: string;
      role?: UserRole;
      passwordHash?: string;
    } = {};

    if (body.name?.trim()) data.name = body.name.trim();
    if (body.email?.trim()) data.email = body.email.trim().toLowerCase();
    if (body.role) data.role = body.role as UserRole;
    if (body.password?.trim()) {
      if (body.password.length < 6) {
        return jsonError("Пароль має містити щонайменше 6 символів");
      }
      data.passwordHash = await hashPassword(body.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
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
      action: "UPDATE",
      entity: "User",
      entityId: id,
      details: JSON.stringify({ role: body.role, name: body.name }),
    });

    return jsonOk(user);
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
    if (!canManageUsers(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const { id } = await params;

    if (id === session.id) {
      return jsonError("Не можна видалити власний обліковий запис", 400);
    }

    await prisma.user.delete({ where: { id } });

    await logAudit({
      userId: session.id,
      action: "DELETE",
      entity: "User",
      entityId: id,
    });

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApi(canManageUsers);
    if (isAuthError(session)) return session;

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return jsonError("Не знайдено", 404);
    return jsonOk(user);
  } catch (error) {
    return handleApiError(error);
  }
}
