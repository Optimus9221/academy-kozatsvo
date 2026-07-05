export function isCaptchaEnabled(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.TURNSTILE_SECRET_KEY
  );
}

export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!isCaptchaEnabled()) {
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
