import "dotenv/config";
import { prisma } from "./client";

const aboutText = `Міжнародна громадська організація «Міжнародна Академія Козацтва» (МГО «МАК») — незалежна міжнародна науково-громадська організація, яка об'єднує вчених, освітян, представників козацтва, громадських діячів, військових, волонтерів, митців і фахівців з України та інших держав.

Академія є платформою для розвитку науки, освіти, культури, духовності, патріотичного виховання та міжнародного партнерства. Її діяльність спрямована на збереження історичної спадщини українського козацтва, підтримку інновацій, реалізацію суспільно важливих проєктів і зміцнення міжнародної співпраці.`;

const heroSlogan = "Наука. Честь. Козацький дух. Служіння Україні та людству.";

const aboutTextEn = `The International Public Organization «International Academy of Cossackdom» (IPO «IAC») is an independent international scientific and public organization that unites scientists, educators, representatives of Cossackdom, public figures, military personnel, volunteers, artists, and specialists from Ukraine and other countries.

The Academy is a platform for the development of science, education, culture, spirituality, patriotic education, and international partnership. Its activities are aimed at preserving the historical heritage of Ukrainian Cossackdom, supporting innovation, implementing socially important projects, and strengthening international cooperation.`;

async function main() {
  const settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    console.error("SiteSettings not found");
    process.exit(1);
  }

  await prisma.siteSettings.update({
    where: { id: settings.id },
    data: {
      aboutText,
      heroSlogan,
      siteName: "Міжнародна Академія Козацтва",
      defaultSeoDescription:
        "Міжнародна громадська організація «Міжнародна Академія Козацтва» (МГО «МАК») — офіційний сайт",
    },
  });

  await prisma.siteSettingsTranslation.upsert({
    where: { settingsId_locale: { settingsId: settings.id, locale: "en" } },
    create: {
      settingsId: settings.id,
      locale: "en",
      aboutText: aboutTextEn,
      heroSlogan: "Science. Honor. Cossack Spirit. Service to Ukraine and Humanity.",
      siteName: "International Academy of Cossackdom",
      seoDescription: "Official website of the International Academy of Cossackdom (IAC)",
    },
    update: {
      aboutText: aboutTextEn,
      heroSlogan: "Science. Honor. Cossack Spirit. Service to Ukraine and Humanity.",
      siteName: "International Academy of Cossackdom",
      seoDescription: "Official website of the International Academy of Cossackdom (IAC)",
    },
  });

  await prisma.siteSettingsTranslation.upsert({
    where: { settingsId_locale: { settingsId: settings.id, locale: "ru" } },
    create: {
      settingsId: settings.id,
      locale: "ru",
      aboutText:
        "Международная общественная организация «Международная Академия Казачества» (МГО «МАК») — независимая международная научно-общественная организация, объединяющая учёных, педагогов, представителей казачества, общественных деятелей, военных, волонтёров, деятелей искусства и специалистов из Украины и других государств.",
      heroSlogan: "Наука. Честь. Казацкий дух. Служение Украине и человечеству.",
      siteName: "Международная Академия Казачества",
    },
    update: {
      aboutText:
        "Международная общественная организация «Международная Академия Казачества» (МГО «МАК») — независимая международная научно-общественная организация, объединяющая учёных, педагогов, представителей казачества, общественных деятелей, военных, волонтёров, деятелей искусства и специалистов из Украины и других государств.",
      heroSlogan: "Наука. Честь. Казацкий дух. Служение Украине и человечеству.",
      siteName: "Международная Академия Казачества",
    },
  });

  console.log("Site settings updated successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
