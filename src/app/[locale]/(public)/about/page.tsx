import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";

const VALUE_KEYS = Array.from({ length: 10 }, (_, i) => `value${i + 1}`);
const ACTIVITY_KEYS = Array.from({ length: 8 }, (_, i) => `activity${i + 1}`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("about");
  const settings = await getSiteSettings(locale);

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="prose-content rounded-xl bg-white p-8 shadow-md">
            <p className="text-lg leading-relaxed whitespace-pre-line">{settings.aboutText}</p>

            <h2>{t("mission")}</h2>
            <p>{t("missionText")}</p>

            <h2>{t("vision")}</h2>
            <p>{t("visionText")}</p>

            <h2>{t("values")}</h2>
            <ul>
              {VALUE_KEYS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>

            <h2>{t("activities")}</h2>
            <ul>
              {ACTIVITY_KEYS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>

            <h2>{t("structure")}</h2>
            <p>{t("structureText")}</p>

            <h2>{t("membership")}</h2>
            <p>{t("membershipText")}</p>

            <h2>{t("international")}</h2>
            <p>{t("internationalText")}</p>

            <h2>{t("motto")}</h2>
            <p className="text-lg font-semibold italic text-dark-blue">{t("mottoText")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
