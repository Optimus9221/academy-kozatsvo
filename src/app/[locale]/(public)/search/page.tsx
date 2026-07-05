import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { NewsCard } from "@/components/cards/NewsCard";
import { prisma } from "@/lib/db";
import { localizeNews } from "@/lib/i18n/entities";
import { buildPageMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = await getTranslations({ locale, namespace: "common" });
  const settings = await getSiteSettings(locale);

  const metadata = buildPageMetadata({
    locale,
    path: "/search",
    title: t("search"),
    description: settings.defaultSeoDescription,
  });

  if (q?.trim()) {
    return {
      ...metadata,
      robots: { index: false, follow: true },
    };
  }

  return metadata;
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const t = await getTranslations("common");
  const newsRaw = query
    ? await prisma.news.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { previewText: { contains: query, mode: "insensitive" } },
            { body: { contains: query, mode: "insensitive" } },
            {
              translations: {
                some: {
                  OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { previewText: { contains: query, mode: "insensitive" } },
                    { body: { contains: query, mode: "insensitive" } },
                  ],
                },
              },
            },
          ],
        },
        include: { translations: true },
        orderBy: { publishedAt: "desc" },
        take: 20,
      })
    : [];

  const news = newsRaw.map((n) => localizeNews(n, locale));

  return (
    <>
      <PageHero title={t("search")} subtitle={query || undefined} />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Breadcrumbs
            items={[
              { label: t("home"), href: "/" },
              { label: t("search") },
            ]}
          />
          {!query ? (
            <p className="text-text-muted">{t("search")}...</p>
          ) : news.length === 0 ? (
            <p className="text-text-muted">{t("notFound")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard key={item.id} {...item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
