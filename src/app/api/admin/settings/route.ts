import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { requireAdminApi, isAuthError } from "@/lib/api-auth";
import { canManageSettings } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/settings";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncSettingsTranslations } from "@/lib/i18n/entities";
import { normalizeHomeFeatures } from "@/lib/home-features";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/locales";

export async function GET() {
  try {
    const session = await requireAdminApi(canManageSettings);
    if (isAuthError(session)) return session;

    const settings = await getSiteSettings();
    return jsonOk(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageSettings(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const body = await request.json();
    const existing = await getSiteSettings();

    if (!existing.id) {
      return jsonError("Налаштування не знайдено", 404);
    }

    await prisma.siteSettings.update({
      where: { id: existing.id },
      data: {
        siteName: body.siteName,
        logoUrl: body.logoUrl,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        contactAddress: body.contactAddress,
        socialLinksJson: JSON.stringify(body.socialLinks || {}),
        defaultSeoTitle: body.defaultSeoTitle,
        defaultSeoDescription: body.defaultSeoDescription,
        aboutText: body.aboutText,
        heroSlogan: body.heroSlogan,
        heroImageUrl: body.heroImageUrl,
        homeFeaturesJson: JSON.stringify(normalizeHomeFeatures(body.homeFeatures)),
      },
    });

    await syncSettingsTranslations(existing.id, body.translations);

    for (const locale of locales) {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/about`);
    }

    const updated = await getSiteSettings();
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
