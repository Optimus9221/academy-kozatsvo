import { prisma } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs = WINDOW_MS
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const since = new Date(Date.now() - windowMs);

  await prisma.rateLimit.deleteMany({
    where: { createdAt: { lt: since } },
  });

  const count = await prisma.rateLimit.count({
    where: { key, createdAt: { gte: since } },
  });

  if (count >= maxAttempts) {
    const oldest = await prisma.rateLimit.findFirst({
      where: { key, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
    });
    const retryAfterSec = oldest
      ? Math.ceil((oldest.createdAt.getTime() + windowMs - Date.now()) / 1000)
      : 60;
    return { allowed: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  await prisma.rateLimit.create({ data: { key } });
  return { allowed: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
