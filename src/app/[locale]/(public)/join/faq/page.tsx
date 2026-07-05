import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { prisma } from "@/lib/db";
import { localizeFaqItem } from "@/lib/i18n/entities";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return buildPageMetadata({
    locale,
    path: "/join/faq",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("faq");

  const itemsRaw = await prisma.faqItem.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  const items = itemsRaw.map((item) => localizeFaqItem(item, locale));

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          {items.length === 0 ? (
            <p className="text-center text-text-muted">{t("empty")}</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <details
                  key={item.id}
                  className="group rounded-xl bg-white p-6 shadow-md"
                >
                  <summary className="cursor-pointer list-none font-semibold text-dark-blue marker:content-none">
                    <span className="flex items-center justify-between gap-4">
                      {item.question}
                      <span className="text-ukraine-blue transition group-open:rotate-180">▼</span>
                    </span>
                  </summary>
                  <div
                    className="prose prose-sm mt-4 max-w-none text-text-muted"
                    dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                  />
                </details>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
