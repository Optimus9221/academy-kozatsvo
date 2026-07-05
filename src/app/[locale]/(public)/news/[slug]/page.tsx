import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHero } from "@/components/layout/PageHero";
import { NewsCard } from "@/components/cards/NewsCard";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { localizeNews } from "@/lib/i18n/entities";
import { formatDate, getYoutubeEmbedUrl } from "@/lib/api-utils";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const newsRaw = await prisma.news.findUnique({
    where: { slug },
    include: { translations: true },
  });
  const news = newsRaw ? localizeNews(newsRaw, locale) : null;
  if (!news) return { title: "News" };
  return buildPageMetadata({
    locale,
    path: `/news/${slug}`,
    title: news.title,
    description: news.previewText,
    image: news.mainImageUrl,
    type: "article",
  });
}

export default async function NewsDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { locale, slug } = await params;
  const { preview } = await searchParams;
  const t = await getTranslations("news");
  const tCommon = await getTranslations("common");

  const newsRaw = await prisma.news.findUnique({
    where: { slug },
    include: {
      translations: true,
      tags: { include: { tag: true } },
      images: true,
    },
  });

  if (!newsRaw) notFound();

  const isDraftPreview = preview === "1" && newsRaw.status === "DRAFT";
  if (newsRaw.status !== "PUBLISHED") {
    if (!isDraftPreview) notFound();
    const session = await getSession();
    if (!session) notFound();
  }

  const news = localizeNews(newsRaw, locale);

  const relatedRaw = await prisma.news.findMany({
    where: { status: "PUBLISHED", NOT: { id: news.id } },
    include: { translations: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const related = relatedRaw.map((item) => localizeNews(item, locale));
  const embedUrl = news.youtubeUrl ? getYoutubeEmbedUrl(news.youtubeUrl) : null;

  return (
    <>
      <PageHero title={news.title} />
      <article className="py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Breadcrumbs
            items={[
              { label: tCommon("home"), href: "/" },
              { label: t("title"), href: "/news" },
              { label: news.title },
            ]}
          />
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-text-muted">
            {news.publishedAt && <time>{formatDate(news.publishedAt)}</time>}
            {news.author && (
              <span>
                {t("author")}: {news.author}
              </span>
            )}
          </div>

          {news.mainImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={news.mainImageUrl}
              alt={news.title}
              className="mb-8 w-full rounded-xl shadow-lg"
            />
          )}

          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: news.body }}
          />

          {embedUrl && (
            <div className="mt-8 aspect-video overflow-hidden rounded-xl">
              <iframe
                src={embedUrl}
                title={news.title}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          )}

          {news.images.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {news.images.map((img) => (
                <figure key={img.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.caption || ""}
                    className="w-full rounded-lg"
                  />
                  {img.caption && (
                    <figcaption className="mt-1 text-sm text-text-muted">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}

          {news.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {news.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-ukraine-blue"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-16 border-t pt-12">
              <h2 className="mb-6 text-2xl font-bold text-dark-blue">
                {t("otherNews")}
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {related.map((item) => (
                  <NewsCard key={item.id} {...item} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <Link href="/news" className="text-ukraine-blue hover:underline">
              ← {tCommon("allNews")}
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
