import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { NewsCard } from "@/components/cards/NewsCard";
import { NewsTagFilter, NewsPagination } from "@/components/news/NewsFilters";
import { prisma } from "@/lib/db";
import { localizeNews } from "@/lib/i18n/entities";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const PAGE_SIZE = 9;

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return buildPageMetadata({
    locale,
    path: "/news",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { tag, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const t = await getTranslations("news");

  const where = {
    status: "PUBLISHED" as const,
    ...(tag
      ? {
          tags: {
            some: {
              tag: { OR: [{ slug: tag }, { name: tag }] },
            },
          },
        }
      : {}),
  };

  const [newsRaw, total, tagsRaw] = await Promise.all([
    prisma.news.findMany({
      where,
      include: { translations: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.news.count({ where }),
    prisma.newsTag.findMany({
      where: {
        news: { some: { news: { status: "PUBLISHED" } } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const news = newsRaw.map((item) => localizeNews(item, locale));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <NewsTagFilter
            tags={tagsRaw.map((tg) => ({ slug: tg.slug, name: tg.name }))}
            currentTag={tag}
            labels={{ all: t("allTags"), filter: t("filterTags") }}
          />

          {news.length === 0 ? (
            <p className="text-center text-text-muted">{t("empty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard key={item.id} {...item} />
              ))}
            </div>
          )}

          <NewsPagination
            currentPage={page}
            totalPages={totalPages}
            baseQuery={{ tag }}
            labels={{
              prev: t("prevPage"),
              next: t("nextPage"),
              page: t("page"),
            }}
          />
        </div>
      </section>
    </>
  );
}
