import { prisma } from "@/lib/db";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/captcha";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(`contact:${ip}`, 5);
    if (!limit.allowed) {
      return jsonError(`Забагато спроб. Спробуйте через ${limit.retryAfterSec} с`, 429);
    }

    const contentType = request.headers.get("content-type") || "";
    let fullName: string | undefined;
    let email: string | undefined;
    let phone: string | undefined;
    let subject: string | undefined;
    let message: string | undefined;
    let turnstileToken: string | undefined;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      fullName = body.fullName?.toString().trim();
      email = body.email?.toString().trim();
      phone = body.phone?.toString().trim();
      subject = body.subject?.toString().trim();
      message = body.message?.toString().trim();
      turnstileToken = body.turnstileToken?.toString();
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
    }

    if (!(await verifyTurnstile(turnstileToken))) {
      return jsonError("Підтвердіть, що ви не робот", 400);
    }

    if (!fullName || !email || !message) {
      return jsonError("Заповніть усі обов'язкові поля");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonError("Некоректний email");
    }

    if (message.length < 10) {
      return jsonError("Повідомлення має містити щонайменше 10 символів");
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
