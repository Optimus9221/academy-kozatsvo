import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageSettings } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/settings";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { syncSettingsTranslations } from "@/lib/i18n/entities";

export async function GET() {
  const settings = await getSiteSettings();
  return jsonOk(settings);
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageSettings(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const body = await request.json();
    const existing = await getSiteSettings();

    const settings = await prisma.siteSettings.update({
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
      },
    });

    await syncSettingsTranslations(existing.id, body.translations);

    const updated = await getSiteSettings();
    return jsonOk(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
