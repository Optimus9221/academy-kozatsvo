import { prisma } from "@/lib/db";
import {
  createSessionToken,
  hashPassword,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendLoginAlert } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import {
  createPending2faToken,
  decryptTotpSecret,
  verifyPending2faToken,
  verifyTotpCode,
} from "@/lib/totp";
import { cookies } from "next/headers";

async function issueSession(user: {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "MODERATOR";
}, request: Request) {
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

  const ip = getClientIp(request);
  await logAudit({
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    details: `ip=${ip}`,
  });

  void sendLoginAlert({
    name: user.name,
    email: user.email,
    ip,
    userAgent: request.headers.get("user-agent"),
  }).catch((err) => console.error("[email] login alert failed", err));

  return jsonOk({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(`login:${ip}`, 10);
    if (!limit.allowed) {
      return jsonError(`Забагато спроб входу. Спробуйте через ${limit.retryAfterSec} с`, 429);
    }

    const body = await request.json();
    const { email, password, totpCode, pendingToken } = body as {
      email?: string;
      password?: string;
      totpCode?: string;
      pendingToken?: string;
    };

    // Step 2: finish login with TOTP after password was accepted
    if (pendingToken && totpCode) {
      const totpLimit = await checkRateLimit(`login-2fa:${ip}`, 10);
      if (!totpLimit.allowed) {
        return jsonError(
          `Забагато спроб 2FA. Спробуйте через ${totpLimit.retryAfterSec} с`,
          429
        );
      }

      const userId = await verifyPending2faToken(pendingToken);
      if (!userId) {
        return jsonError("Сесія 2FA закінчилась. Увійдіть знову", 401);
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.totpEnabled || !user.totpSecret) {
        return jsonError("2FA не налаштовано для цього акаунта", 400);
      }

      const secret = decryptTotpSecret(user.totpSecret);
      if (!verifyTotpCode(secret, totpCode)) {
        return jsonError("Невірний код 2FA", 401);
      }

      return issueSession(user, request);
    }

    if (!email || !password) {
      return jsonError("Email і пароль обов'язкові");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Невірний email або пароль", 401);
    }

    if (user.totpEnabled && user.totpSecret) {
      if (totpCode) {
        const secret = decryptTotpSecret(user.totpSecret);
        if (!verifyTotpCode(secret, totpCode)) {
          return jsonError("Невірний код 2FA", 401);
        }
        return issueSession(user, request);
      }

      const token = await createPending2faToken(user.id);
      return jsonOk({
        requires2fa: true,
        pendingToken: token,
      });
    }

    return issueSession(user, request);
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

    await logAudit({
      userId: user.id,
      action: "PASSWORD_CHANGE",
      entity: "User",
      entityId: user.id,
    });

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
