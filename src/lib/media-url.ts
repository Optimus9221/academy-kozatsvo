/** Vercel Blob Hobby is currently returning 403 for public reads. */
const BLOCKED_BLOB_HOST = /public\.blob\.vercel-storage\.com/i;

const STATIC_FALLBACKS = [
  "/images/news-conference.jpg",
  "/images/news-lviv-opening.jpg",
  "/images/news-youth-camp.jpg",
  "/images/leader-general.jpg",
  "/images/photo-01.jpg",
  "/images/photo-02.jpg",
  "/images/photo-03.jpg",
  "/images/photo-04.jpg",
  "/images/photo-17.jpg",
] as const;

function pickFallback(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return STATIC_FALLBACKS[hash % STATIC_FALLBACKS.length];
}

/**
 * Resolve CMS/media URLs for public display.
 * When Blob storage is blocked (403 on Hobby limits), fall back to static /images.
 */
export function resolveMediaUrl(
  url: string | null | undefined,
  fallback?: string,
): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) {
    return fallback ?? STATIC_FALLBACKS[0];
  }
  if (BLOCKED_BLOB_HOST.test(trimmed)) {
    return fallback ?? pickFallback(trimmed);
  }
  return trimmed;
}

export function isBlockedBlobUrl(url: string | null | undefined): boolean {
  return Boolean(url && BLOCKED_BLOB_HOST.test(url));
}
