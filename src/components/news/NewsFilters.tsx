"use client";

import { Link, usePathname } from "@/i18n/navigation";

interface NewsTagFilterProps {
  tags: { slug: string; name: string }[];
  currentTag?: string;
  labels: { all: string; filter: string };
}

export function NewsTagFilter({ tags, currentTag, labels }: NewsTagFilterProps) {
  const pathname = usePathname();

  if (tags.length === 0) return null;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-text-muted">{labels.filter}:</span>
      <Link
        href={pathname}
        className={`rounded-full px-3 py-1 text-sm transition ${
          !currentTag
            ? "bg-ukraine-blue text-white"
            : "bg-white text-dark-blue shadow-sm hover:bg-blue-50"
        }`}
      >
        {labels.all}
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`${pathname}?tag=${tag.slug}`}
          className={`rounded-full px-3 py-1 text-sm transition ${
            currentTag === tag.slug
              ? "bg-ukraine-blue text-white"
              : "bg-white text-dark-blue shadow-sm hover:bg-blue-50"
          }`}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}

interface NewsPaginationProps {
  currentPage: number;
  totalPages: number;
  baseQuery: Record<string, string | undefined>;
  labels: { prev: string; next: string; page: string };
}

export function NewsPagination({
  currentPage,
  totalPages,
  baseQuery,
  labels,
}: NewsPaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams();
    if (baseQuery.tag) params.set("tag", baseQuery.tag);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/news?${qs}` : "/news";
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ukraine-blue shadow hover:bg-blue-50"
        >
          ← {labels.prev}
        </Link>
      ) : (
        <span className="rounded-lg px-4 py-2 text-sm text-gray-400">← {labels.prev}</span>
      )}
      <span className="text-sm text-text-muted">
        {labels.page} {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ukraine-blue shadow hover:bg-blue-50"
        >
          {labels.next} →
        </Link>
      ) : (
        <span className="rounded-lg px-4 py-2 text-sm text-gray-400">{labels.next} →</span>
      )}
    </div>
  );
}
