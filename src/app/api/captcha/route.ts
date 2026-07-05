import { createMathCaptcha } from "@/lib/math-captcha";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = await checkRateLimit(`captcha:${ip}`, 30);
  if (!limit.allowed) {
    return jsonError(`Забагато спроб. Спробуйте через ${limit.retryAfterSec} с`, 429);
  }

  return jsonOk(createMathCaptcha());
}
