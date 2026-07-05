import { prisma } from "@/lib/db";
import { saveUpload } from "@/lib/uploads";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { localizedJsonError } from "@/lib/api-errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyFormCaptcha } from "@/lib/captcha";
import { sendApplicationNotification, sendApplicationConfirmation } from "@/lib/email";

const MOTIVATION_MIN = 50;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(`apply:${ip}`, 5);
    if (!limit.allowed) {
      return localizedJsonError(request, "rateLimit", 429, { seconds: limit.retryAfterSec });
    }

    const formData = await request.formData();
    const turnstileToken = formData.get("cf-turnstile-response")?.toString();
    const captchaToken = formData.get("captchaToken")?.toString();
    const captchaAnswer = formData.get("captchaAnswer")?.toString();
    const captcha = await verifyFormCaptcha({ turnstileToken, captchaToken, captchaAnswer });
    if (!captcha.ok && captcha.errorKey) {
      return localizedJsonError(request, captcha.errorKey, 400);
    }

    const fullName = formData.get("fullName")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const country = formData.get("country")?.toString().trim();
    const motivationText = formData.get("motivationText")?.toString().trim();
    const consent = formData.get("consent")?.toString();
    const file = formData.get("file") as File | null;

    if (!fullName || !phone || !email || !city || !country || !motivationText) {
      return localizedJsonError(request, "requiredFields", 400);
    }

    if (motivationText.length < MOTIVATION_MIN) {
      return localizedJsonError(request, "motivationMinLength", 400, { min: MOTIVATION_MIN });
    }

    if (consent !== "true") {
      return localizedJsonError(request, "consentRequired", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return localizedJsonError(request, "invalidEmail", 400);
    }

    let fileUrl: string | null = null;
    if (file && file.size > 0) {
      fileUrl = await saveUpload(file);
    }

    const application = await prisma.application.create({
      data: {
        fullName,
        phone,
        email,
        city,
        country,
        motivationText,
        fileUrl,
      },
    });

    await sendApplicationNotification({
      fullName,
      email,
      phone,
      city,
      country,
      motivationText,
      applicationId: application.id,
    }).catch(console.error);

    await sendApplicationConfirmation({ fullName, email }).catch(console.error);

    return jsonOk({ success: true, id: application.id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
