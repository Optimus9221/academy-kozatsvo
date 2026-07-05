"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/api-utils";

interface NewsCardProps {
  title: string;
  slug: string;
  previewText?: string | null;
  mainImageUrl?: string | null;
  publishedAt?: Date | string | null;
}

export function NewsCard({
  title,
  slug,
  previewText,
  mainImageUrl,
  publishedAt,
}: NewsCardProps) {
  const t = useTranslations("common");

  return (
    <article className="card-hover overflow-hidden rounded-xl bg-white shadow-md">
      <Link href={`/news/${slug}`}>
        <div className="aspect-video bg-gradient-to-br from-ukraine-blue to-dark-blue">
          {mainImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainImageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">📰</div>
          )}
        </div>
        <div className="p-5">
          {publishedAt && (
            <time className="text-xs text-text-muted">{formatDate(publishedAt)}</time>
          )}
          <h3 className="mt-1 text-lg font-bold text-dark-blue line-clamp-2">{title}</h3>
          {previewText && (
            <p className="mt-2 text-sm text-text-muted line-clamp-3">{previewText}</p>
          )}
          <span className="mt-3 inline-block text-sm font-semibold text-ukraine-blue">
            {t("readMore")} →
          </span>
        </div>
      </Link>
    </article>
  );
}
