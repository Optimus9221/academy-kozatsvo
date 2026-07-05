import { getSiteBaseUrl, getLocalizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/locales";

type NewsArticleSchemaProps = {
  locale: string;
  slug: string;
  title: string;
  description?: string | null;
  image?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string;
  author?: string | null;
  publisherName?: string;
};

export function NewsArticleSchema({
  locale,
  slug,
  title,
  description,
  image,
  publishedAt,
  updatedAt,
  author,
  publisherName = "Міжнародна Академія Козацтва",
}: NewsArticleSchemaProps) {
  const baseUrl = getSiteBaseUrl();
  const url = `${baseUrl}${getLocalizedPath(`/news/${slug}`, locale as Locale)}`;
  const imageUrl = image?.startsWith("http")
    ? image
    : image
      ? `${baseUrl}${image}`
      : undefined;

  const published =
    publishedAt instanceof Date
      ? publishedAt.toISOString()
      : publishedAt
        ? new Date(publishedAt).toISOString()
        : undefined;
  const modified =
    updatedAt instanceof Date
      ? updatedAt.toISOString()
      : updatedAt
        ? new Date(updatedAt).toISOString()
        : published;

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: description || undefined,
    image: imageUrl,
    datePublished: published,
    dateModified: modified,
    author: author ? { "@type": "Person", name: author } : undefined,
    publisher: {
      "@type": "Organization",
      name: publisherName,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
