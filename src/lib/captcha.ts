import { verifyMathCaptcha } from "@/lib/math-captcha";

export function isTurnstileEnabled(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.TURNSTILE_SECRET_KEY
  );
}

export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!isTurnstileEnabled()) {
    return true;
  }

  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY!;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const data = (await res.json()) as { success?: boolean };
  return !!data.success;
}

export async function verifyFormCaptcha(input: {
  turnstileToken?: string | null;
  captchaToken?: string | null;
  captchaAnswer?: string | null;
}): Promise<{ ok: boolean; errorKey?: "captchaRobot" | "captchaWrongAnswer" }> {
  if (isTurnstileEnabled()) {
    const ok = await verifyTurnstile(input.turnstileToken);
    return ok ? { ok: true } : { ok: false, errorKey: "captchaRobot" };
  }

  const ok = verifyMathCaptcha(input.captchaToken, input.captchaAnswer);
  return ok ? { ok: true } : { ok: false, errorKey: "captchaWrongAnswer" };
}
