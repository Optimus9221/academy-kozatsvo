export function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const required = ["JWT_SECRET", "DATABASE_URL", "NEXT_PUBLIC_SITE_URL"] as const;
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env: ${key}`);
    }
  }

  if (process.env.TURNSTILE_SECRET_KEY && !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    console.warn(
      "[env] TURNSTILE_SECRET_KEY is set without NEXT_PUBLIC_TURNSTILE_SITE_KEY — captcha disabled",
    );
  } else if (!process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    console.warn(
      "[env] NEXT_PUBLIC_TURNSTILE_SITE_KEY is set without TURNSTILE_SECRET_KEY — captcha disabled",
    );
  }
}

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return new TextEncoder().encode("academy-kozatsvo-dev-secret-change-in-production");
  }
  return new TextEncoder().encode(secret);
}
