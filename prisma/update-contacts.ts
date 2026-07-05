import "dotenv/config";
import { prisma } from "./client";

const contactAddress =
  "м. Київ, 01011, вулиця Еспланадна, будинок 4, оф. 107";
const contactAddressEn =
  "Kyiv, 01011, Esplanadna Street, building 4, office 107";
const contactPhone =
  "8 (04497) 9-25-50, 8 (093) 291-06-33, 8 (044) 452-43-04";
const contactEmail = "A.Kremnev18@gmail.com";

async function main() {
  const settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    console.error("SiteSettings not found");
    process.exit(1);
  }

  await prisma.siteSettings.update({
    where: { id: settings.id },
    data: {
      contactAddress,
      contactPhone,
      contactEmail,
    },
  });

  await prisma.siteSettingsTranslation.upsert({
    where: { settingsId_locale: { settingsId: settings.id, locale: "en" } },
    create: {
      settingsId: settings.id,
      locale: "en",
      contactAddress: contactAddressEn,
    },
    update: {
      contactAddress: contactAddressEn,
    },
  });

  await prisma.siteSettingsTranslation.upsert({
    where: { settingsId_locale: { settingsId: settings.id, locale: "ru" } },
    create: {
      settingsId: settings.id,
      locale: "ru",
      contactAddress:
        "г. Киев, 01011, улица Эспланадная, дом 4, оф. 107",
    },
    update: {
      contactAddress:
        "г. Киев, 01011, улица Эспланадная, дом 4, оф. 107",
    },
  });

  console.log("Contacts updated:");
  console.log("  Address:", contactAddress);
  console.log("  Phone:", contactPhone);
  console.log("  Email:", contactEmail);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
