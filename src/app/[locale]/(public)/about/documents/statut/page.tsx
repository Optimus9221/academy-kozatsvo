import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getStatuteHtml, STATUTE_DOWNLOAD_URL } from "@/lib/documents";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "documents" });
  return { title: t("statute") };
}

export default async function StatutePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("documents");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const html = await getStatuteHtml();

  return (
    <>
      <PageHero title={t("statute")} subtitle={t("statuteDesc")} />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Breadcrumbs
            items={[
              { label: tNav("about"), href: "/about" },
              { label: t("title"), href: "/about/documents" },
              { label: t("statute") },
            ]}
          />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <a
              href="/about/documents"
              className="text-sm font-medium text-ukraine-blue hover:underline"
            >
              ← {tCommon("back")}
            </a>
            <a
              href={STATUTE_DOWNLOAD_URL}
              download
              className="text-sm text-text-muted hover:text-ukraine-blue"
            >
              {t("downloadDocx")}
            </a>
          </div>

          <article
            className="prose-content statute-content rounded-xl bg-white p-8 shadow-md"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>
    </>
  );
}
