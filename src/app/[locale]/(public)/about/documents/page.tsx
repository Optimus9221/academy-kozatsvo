import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "documents" });
  return buildPageMetadata({
    locale,
    path: "/about/documents",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("documents");
  const tNav = await getTranslations("nav");

  const docs = [
    {
      title: t("statute"),
      desc: t("statuteDesc"),
      href: "/about/documents/statut",
    },
    {
      title: t("brochure"),
      desc: t("brochureDesc"),
      href: "/about",
    },
  ];

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <Breadcrumbs
            items={[
              { label: tNav("about"), href: "/about" },
              { label: t("title") },
            ]}
          />
          <div className="space-y-4">
            {docs.map((doc) => (
              <div
                key={doc.title}
                className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-lg font-bold text-dark-blue">{doc.title}</h2>
                  <p className="mt-1 text-sm text-text-muted">{doc.desc}</p>
                </div>
                <Button href={doc.href} variant="secondary" size="sm">
                  {t("read")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
