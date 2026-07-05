import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title") };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("privacy");

  return (
    <>
      <PageHero title={t("title")} />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="prose-content rounded-xl bg-white p-8 shadow-md">
            <p>{t("intro")}</p>
            <h2>{t("dataTitle")}</h2>
            <p>{t("dataText")}</p>
            <h2>{t("purposeTitle")}</h2>
            <p>{t("purposeText")}</p>
            <h2>{t("storageTitle")}</h2>
            <p>{t("storageText")}</p>
            <h2>{t("rightsTitle")}</h2>
            <p>{t("rightsText")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
