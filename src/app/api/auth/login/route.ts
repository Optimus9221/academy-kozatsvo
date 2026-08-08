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

/** Max login attempts per IP / email within 15 minutes (see rate-limit WINDOW_MS). */
const LOGIN_MAX_ATTEMPTS = 5;
const TWO_FA_MAX_ATTEMPTS = 5;

function notifyLogin(
  kind: "success" | "failed" | "failed_2fa" | "rate_limited",
  request: Request,
  extra?: {
    accountEmail?: string | null;
    accountName?: string | null;
    detail?: string | null;
  }
) {
  void sendLoginAlert({
    kind,
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
    accountEmail: extra?.accountEmail,
    accountName: extra?.accountName,
    detail: extra?.detail,
  }).catch((err) => console.error("[email] login alert failed", err));
}

async function issueSession(
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "EDITOR" | "MODERATOR";
  },
  request: Request
) {
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

  notifyLogin("success", request, {
    accountEmail: user.email,
    accountName: user.name,
  });

  return jsonOk({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

function rateLimitMessage(retryAfterSec?: number) {
  const sec = retryAfterSec ?? 900;
  const min = Math.max(1, Math.ceil(sec / 60));
  return `Забагато спроб входу. Спробуйте через ${min} хв (${sec} с)`;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = await checkRateLimit(`login:${ip}`, LOGIN_MAX_ATTEMPTS);
    if (!ipLimit.allowed) {
      notifyLogin("rate_limited", request, {
        detail: `ip limit, retryAfter=${ipLimit.retryAfterSec}s`,
      });
      return jsonError(rateLimitMessage(ipLimit.retryAfterSec), 429);
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
      const totpLimit = await checkRateLimit(
        `login-2fa:${ip}`,
        TWO_FA_MAX_ATTEMPTS
      );
      if (!totpLimit.allowed) {
        notifyLogin("rate_limited", request, {
          detail: `2fa ip limit, retryAfter=${totpLimit.retryAfterSec}s`,
        });
        return jsonError(rateLimitMessage(totpLimit.retryAfterSec), 429);
      }

      const userId = await verifyPending2faToken(pendingToken);
      if (!userId) {
        notifyLogin("failed_2fa", request, {
          detail: "pending token expired",
        });
        return jsonError("Сесія 2FA закінчилась. Увійдіть знову", 401);
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.totpEnabled || !user.totpSecret) {
        return jsonError("2FA не налаштовано для цього акаунта", 400);
      }

      const secret = decryptTotpSecret(user.totpSecret);
      if (!verifyTotpCode(secret, totpCode)) {
        notifyLogin("failed_2fa", request, {
          accountEmail: user.email,
          accountName: user.name,
        });
        return jsonError("Невірний код 2FA", 401);
      }

      return issueSession(user, request);
    }

    if (!email || !password) {
      return jsonError("Email і пароль обов'язкові");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailLimit = await checkRateLimit(
      `login-email:${normalizedEmail}`,
      LOGIN_MAX_ATTEMPTS
    );
    if (!emailLimit.allowed) {
      notifyLogin("rate_limited", request, {
        accountEmail: normalizedEmail,
        detail: `email limit, retryAfter=${emailLimit.retryAfterSec}s`,
      });
      return jsonError(rateLimitMessage(emailLimit.retryAfterSec), 429);
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      notifyLogin("failed", request, {
        accountEmail: normalizedEmail,
        accountName: user?.name,
        detail: user ? "wrong password" : "unknown email",
      });
      return jsonError("Невірний email або пароль", 401);
    }

    if (user.totpEnabled && user.totpSecret) {
      if (totpCode) {
        const secret = decryptTotpSecret(user.totpSecret);
        if (!verifyTotpCode(secret, totpCode)) {
          notifyLogin("failed_2fa", request, {
            accountEmail: user.email,
            accountName: user.name,
          });
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
