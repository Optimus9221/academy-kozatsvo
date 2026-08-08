import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { generateSecret, generateSync, generateURI, verifySync } from "otplib";
import { SignJWT, jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/env";

const ISSUER = "МАК Admin";
const PENDING_PURPOSE = "2fa-pending";

function encryptionKey() {
  return createHash("sha256").update(getJwtSecret()).digest();
}

/** Encrypt TOTP secret at rest (DB leak ≠ usable seed without JWT_SECRET). */
export function encryptTotpSecret(plainSecret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plainSecret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptTotpSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid TOTP secret payload");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivB64, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function createTotpSecret(): string {
  return generateSecret();
}

export function buildTotpUri(email: string, secret: string): string {
  return generateURI({
    issuer: ISSUER,
    label: email,
    secret,
  });
}

export function verifyTotpCode(secret: string, token: string): boolean {
  const code = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) return false;
  const result = verifySync({ token: code, secret });
  return Boolean(result.valid);
}

/** For tests / diagnostics only. */
export function generateTotpCode(secret: string): string {
  return generateSync({ secret });
}

export async function createPending2faToken(userId: string): Promise<string> {
  return new SignJWT({ purpose: PENDING_PURPOSE, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(getJwtSecret());
}

export async function verifyPending2faToken(
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.purpose !== PENDING_PURPOSE || typeof payload.userId !== "string") {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
  }
}
