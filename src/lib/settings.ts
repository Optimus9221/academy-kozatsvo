import { prisma } from "@/lib/db";
import { parseSocialLinks } from "@/lib/uploads";
import { resolveLocalized } from "@/lib/i18n/content";
import { defaultLocale, type Locale } from "@/i18n/locales";

export async function getSiteSettings(locale: string = defaultLocale) {
  let settings = await prisma.siteSettings.findFirst({
    include: { translations: true },
  });
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        siteName: "Міжнародна Академія Козацтва",
        heroSlogan: "Збереження традицій, формування майбутнього",
        aboutText:
          "Міжнародна Академія Козацтва — це організація, що об'єднує людей, які прагнуть зберегти та розвивати козацькі традиції, патріотизм та громадянську активність.",
        defaultSeoTitle: "Міжнародна Академія Козацтва",
        defaultSeoDescription:
          "Офіційний сайт Міжнародної Академії Козацтва: новини, галерея, представництва, правила вступу.",
        socialLinksJson: JSON.stringify({
          youtube: "https://youtube.com",
          facebook: "https://facebook.com",
          instagram: "https://instagram.com",
          telegram: "https://t.me",
        }),
      },
      include: { translations: true },
    });
  }

  const localized = resolveLocalized(
    settings,
    settings.translations,
    locale,
    ["siteName", "aboutText", "heroSlogan", "defaultSeoTitle", "defaultSeoDescription", "contactAddress"]
  );

  const tr = settings.translations.find((t) => t.locale === locale);
  if (tr) {
    if (tr.siteName) localized.siteName = tr.siteName;
    if (tr.aboutText) localized.aboutText = tr.aboutText;
    if (tr.heroSlogan) localized.heroSlogan = tr.heroSlogan;
    if (tr.seoTitle) localized.defaultSeoTitle = tr.seoTitle;
    if (tr.seoDescription) localized.defaultSeoDescription = tr.seoDescription;
    if (tr.contactAddress) localized.contactAddress = tr.contactAddress;
  }

  return {
    ...localized,
    socialLinks: parseSocialLinks(settings.socialLinksJson),
    translations: settings.translations,
  };
}

export async function getJoinRules(locale: string = defaultLocale) {
  let rules = await prisma.joinRules.findFirst({
    include: { translations: true },
  });
  if (!rules) {
    rules = await prisma.joinRules.create({
      data: {
        contentHtml: `<h2>Вимоги до кандидатів</h2>
<p>Кандидат має бути громадянином України або особою українського походження, досягти 18 років, поважати традиції та цінності Академії.</p>
<h2>Порядок вступу</h2>
<ol>
<li>Ознайомлення з правилами та документами організації.</li>
<li>Заповнення заявки на сайті.</li>
<li>Розгляд заявки модератором протягом 14 днів.</li>
<li>Інформування про рішення електронною поштою.</li>
</ol>
<h2>Необхідні документи</h2>
<p>Копія паспорта, фото 3×4, мотиваційний лист (можна вказати у формі заявки).</p>
<h2>Права та обов'язки</h2>
<p>Члени Академії беруть участь у заходах, дотримуються статуту та сприяють розвитку організації.</p>`,
        pdfUrls: "[]",
      },
      include: { translations: true },
    });
  }

  const tr = rules.translations.find((t) => t.locale === locale);
  if (tr && locale !== defaultLocale) {
    return { ...rules, contentHtml: tr.contentHtml };
  }
  return rules;
}

export function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");
  if (locale && ["uk", "en", "ru", "he", "kk", "es", "de", "fr", "ar", "pl"].includes(locale)) {
    return locale as Locale;
  }
  return defaultLocale;
}
