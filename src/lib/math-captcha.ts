import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { getJwtSecret } from "@/lib/env";

const TTL_MS = 10 * 60 * 1000;

type CaptchaPayload = {
  answer: number;
  expires: number;
};

function signPayload(payload: CaptchaPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getJwtSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function parseToken(token: string): CaptchaPayload | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = createHmac("sha256", getJwtSecret()).update(data).digest("base64url");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as CaptchaPayload;
  } catch {
    return null;
  }
}

export function createMathCaptcha() {
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  const answer = a + b;
  const expires = Date.now() + TTL_MS;
  const token = signPayload({ answer, expires });

  return {
    token,
    question: `${a} + ${b}`,
  };
}

export function verifyMathCaptcha(
  token: string | null | undefined,
  userAnswer: string | null | undefined,
): boolean {
  if (!token || userAnswer === null || userAnswer === undefined || userAnswer === "") {
    return false;
  }

  const payload = parseToken(token);
  if (!payload || payload.expires < Date.now()) return false;

  const parsed = Number.parseInt(userAnswer.trim(), 10);
  if (!Number.isFinite(parsed)) return false;

  return parsed === payload.answer;
}
