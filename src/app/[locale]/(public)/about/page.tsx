import { getTranslations } from "next-intl/server";
import { Literata } from "next/font/google";
import { PageHero } from "@/components/layout/PageHero";
import { getSiteSettings } from "@/lib/settings";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

const literata = Literata({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  variable: "--font-about-display",
});

const VALUE_KEYS = Array.from({ length: 10 }, (_, i) => `value${i + 1}`);
const ACTIVITY_KEYS = Array.from({ length: 8 }, (_, i) => `activity${i + 1}`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildPageMetadata({
    locale,
    path: "/about",
    title: t("title"),
    description: t("subtitle"),
  });
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
      <section className={`about-section ${literata.variable}`}>
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <article className="about-charter">
            <div className="about-ornament" aria-hidden="true">
              <span className="about-ornament-line" />
              <span className="about-ornament-diamond" />
              <span className="about-ornament-line" />
            </div>

            <p className="about-lead whitespace-pre-line">{settings.aboutText}</p>

            <div className="about-callout">
              <h2 className="about-heading">{t("mission")}</h2>
              <p>{t("missionText")}</p>
            </div>

            <div className="about-callout about-callout--soft">
              <h2 className="about-heading">{t("vision")}</h2>
              <p>{t("visionText")}</p>
            </div>

            <h2 className="about-heading">{t("values")}</h2>
            <ul className="about-list">
              {VALUE_KEYS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>

            <h2 className="about-heading">{t("activities")}</h2>
            <ul className="about-list about-list--columns">
              {ACTIVITY_KEYS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>

            <h2 className="about-heading">{t("structure")}</h2>
            <p>{t("structureText")}</p>

            <h2 className="about-heading">{t("membership")}</h2>
            <p>{t("membershipText")}</p>

            <h2 className="about-heading">{t("international")}</h2>
            <p>{t("internationalText")}</p>

            <div className="about-motto">
              <p className="about-motto-label">{t("motto")}</p>
              <p className="about-motto-text">{t("mottoText")}</p>
            </div>

            <div className="about-ornament about-ornament--bottom" aria-hidden="true">
              <span className="about-ornament-line" />
              <span className="about-ornament-diamond" />
              <span className="about-ornament-line" />
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
