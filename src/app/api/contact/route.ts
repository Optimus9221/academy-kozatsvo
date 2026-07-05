import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { localizedJsonError } from "@/lib/api-errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyFormCaptcha } from "@/lib/captcha";

const MESSAGE_MIN = 10;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(`contact:${ip}`, 5);
    if (!limit.allowed) {
      return localizedJsonError(request, "rateLimit", 429, { seconds: limit.retryAfterSec });
    }

    const contentType = request.headers.get("content-type") || "";
    let fullName: string | undefined;
    let email: string | undefined;
    let phone: string | undefined;
    let subject: string | undefined;
    let message: string | undefined;
    let turnstileToken: string | undefined;
    let captchaToken: string | undefined;
    let captchaAnswer: string | undefined;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      fullName = body.fullName?.toString().trim();
      email = body.email?.toString().trim();
      phone = body.phone?.toString().trim();
      subject = body.subject?.toString().trim();
      message = body.message?.toString().trim();
      turnstileToken = body.turnstileToken?.toString();
      captchaToken = body.captchaToken?.toString();
      captchaAnswer = body.captchaAnswer?.toString();
    } else {
      const formData = await request.formData();
      fullName = formData.get("fullName")?.toString().trim();
      email = formData.get("email")?.toString().trim();
      phone = formData.get("phone")?.toString().trim();
      subject = formData.get("subject")?.toString().trim();
      message = formData.get("message")?.toString().trim();
      turnstileToken =
        formData.get("turnstileToken")?.toString() ||
        formData.get("cf-turnstile-response")?.toString();
      captchaToken = formData.get("captchaToken")?.toString();
      captchaAnswer = formData.get("captchaAnswer")?.toString();
    }

    const captcha = await verifyFormCaptcha({
      turnstileToken,
      captchaToken,
      captchaAnswer,
    });
    if (!captcha.ok && captcha.errorKey) {
      return localizedJsonError(request, captcha.errorKey, 400);
    }

    if (!fullName || !email || !message) {
      return localizedJsonError(request, "requiredFields", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return localizedJsonError(request, "invalidEmail", 400);
    }

    if (message.length < MESSAGE_MIN) {
      return localizedJsonError(request, "messageMinLength", 400, { min: MESSAGE_MIN });
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        fullName,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      },
    });

    return jsonOk({ success: true, id: contactMessage.id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
