import { prisma } from "@/lib/db";
import {
  createSessionToken,
  hashPassword,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(`login:${ip}`, 10);
    if (!limit.allowed) {
      return jsonError(`Забагато спроб входу. Спробуйте через ${limit.retryAfterSec} с`, 429);
    }

    const { email, password } = await request.json();
    if (!email || !password) {
      return jsonError("Email і пароль обов'язкові");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Невірний email або пароль", 401);
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return jsonOk({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { requireSession } = await import("@/lib/auth");
    const session = await requireSession();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return jsonError("Новий пароль має містити щонайменше 6 символів");
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return jsonError("Невірний поточний пароль", 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
