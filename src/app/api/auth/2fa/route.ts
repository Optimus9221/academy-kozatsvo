import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { requireSession, verifyPassword } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { logAudit } from "@/lib/audit";
import {
  buildTotpUri,
  createTotpSecret,
  decryptTotpSecret,
  encryptTotpSecret,
  verifyTotpCode,
} from "@/lib/totp";

/** Start 2FA setup: create (or reuse pending) secret + QR. */
export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return jsonError("Користувача не знайдено", 404);

    if (user.totpEnabled) {
      return jsonOk({ enabled: true });
    }

    const plainSecret = createTotpSecret();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: encryptTotpSecret(plainSecret),
        totpEnabled: false,
      },
    });

    const otpauthUrl = buildTotpUri(user.email, plainSecret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
      margin: 1,
      width: 220,
      errorCorrectionLevel: "M",
    });

    return jsonOk({
      enabled: false,
      secret: plainSecret,
      qrDataUrl,
      otpauthUrl,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Confirm 2FA with first authenticator code. */
export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return jsonError("Введіть 6-значний код з додатка");
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user?.totpSecret) {
      return jsonError("Спочатку згенеруйте QR-код 2FA", 400);
    }
    if (user.totpEnabled) {
      return jsonOk({ enabled: true });
    }

    const secret = decryptTotpSecret(user.totpSecret);
    if (!verifyTotpCode(secret, code)) {
      return jsonError("Невірний код. Спробуйте ще раз", 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: true },
    });

    await logAudit({
      userId: user.id,
      action: "2FA_ENABLE",
      entity: "User",
      entityId: user.id,
    });

    return jsonOk({ enabled: true });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Disable 2FA — requires password + current TOTP code. */
export async function DELETE(request: Request) {
  try {
    const session = await requireSession();
    const { password, code } = await request.json();
    if (!password || !code) {
      return jsonError("Потрібні пароль і код 2FA");
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return jsonError("Користувача не знайдено", 404);
    if (!user.totpEnabled || !user.totpSecret) {
      return jsonOk({ enabled: false });
    }

    if (!(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Невірний пароль", 401);
    }

    const secret = decryptTotpSecret(user.totpSecret);
    if (!verifyTotpCode(secret, code)) {
      return jsonError("Невірний код 2FA", 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: false, totpSecret: null },
    });

    await logAudit({
      userId: user.id,
      action: "2FA_DISABLE",
      entity: "User",
      entityId: user.id,
    });

    return jsonOk({ enabled: false });
  } catch (error) {
    return handleApiError(error);
  }
}
