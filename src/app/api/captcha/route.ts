import { createMathCaptcha } from "@/lib/math-captcha";
import { jsonOk } from "@/lib/api-utils";
import { localizedJsonError } from "@/lib/api-errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = await checkRateLimit(`captcha:${ip}`, 30);
  if (!limit.allowed) {
    return localizedJsonError(request, "rateLimit", 429, { seconds: limit.retryAfterSec });
  }

  return jsonOk(createMathCaptcha());
}
