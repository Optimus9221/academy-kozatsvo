import { getTranslations } from "next-intl/server";
import { jsonError } from "@/lib/api-utils";
import { defaultLocale, isLocale, type Locale } from "@/i18n/locales";

export type ApiErrorKey =
  | "requiredFields"
  | "invalidEmail"
  | "motivationMinLength"
  | "messageMinLength"
  | "consentRequired"
  | "captchaRobot"
  | "captchaWrongAnswer"
  | "rateLimit"
  | "generic";

export function getLocaleFromRequest(request: Request): Locale {
  const header = request.headers.get("x-locale");
  if (header && isLocale(header)) return header;
  return defaultLocale;
}

export async function translateError(
  locale: Locale,
  key: ApiErrorKey,
  params?: Record<string, string | number>,
): Promise<string> {
  const t = await getTranslations({ locale, namespace: "errors" });
  return t(key, params);
}

export async function localizedJsonError(
  request: Request,
  key: ApiErrorKey,
  status = 400,
  params?: Record<string, string | number>,
) {
  const locale = getLocaleFromRequest(request);
  const message = await translateError(locale, key, params);
  return jsonError(message, status);
}
