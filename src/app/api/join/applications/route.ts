import { prisma } from "@/lib/db";
import { saveUpload } from "@/lib/uploads";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyFormCaptcha } from "@/lib/captcha";
import { sendApplicationNotification, sendApplicationConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(`apply:${ip}`, 5);
    if (!limit.allowed) {
      return jsonError(`Забагато спроб. Спробуйте через ${limit.retryAfterSec} с`, 429);
    }

    const formData = await request.formData();
    const turnstileToken = formData.get("cf-turnstile-response")?.toString();
    const captchaToken = formData.get("captchaToken")?.toString();
    const captchaAnswer = formData.get("captchaAnswer")?.toString();
    const captcha = await verifyFormCaptcha({ turnstileToken, captchaToken, captchaAnswer });
    if (!captcha.ok) {
      return jsonError(captcha.error, 400);
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
      return jsonError("Заповніть усі обов'язкові поля");
    }

    if (motivationText.length < 50) {
      return jsonError("Мотивація має містити щонайменше 50 символів");
    }

    if (consent !== "true") {
      return jsonError("Необхідна згода на обробку даних");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonError("Некоректний email");
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
