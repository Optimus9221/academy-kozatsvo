"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getYoutubeEmbedUrl, getYoutubeThumbnail } from "@/lib/api-utils";

interface GalleryAlbumCardProps {
  title: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  itemCount: number;
}

export function GalleryAlbumCard({
  title,
  slug,
  description,
  coverImageUrl,
  itemCount,
}: GalleryAlbumCardProps) {
  const t = useTranslations("common");

  return (
    <Link href={`/gallery/${slug}`} className="card-hover block overflow-hidden rounded-xl bg-white shadow-md">
      <div className="aspect-video bg-gradient-to-br from-ukraine-blue to-dark-blue">
        {coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🖼️</div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-dark-blue">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-text-muted line-clamp-2">{description}</p>
        )}
        <p className="mt-2 text-xs text-ukraine-blue">{itemCount} {t("elements")}</p>
      </div>
    </Link>
  );
}

interface LightboxProps {
  images: { url: string; caption?: string | null }[];
  initialIndex?: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 text-3xl text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        onClick={onClose}
        aria-label="Закрити"
      >
        ×
      </button>
      <div className="relative max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index].url}
          alt={images[index].caption || ""}
          className="max-h-[80vh] max-w-full object-contain"
        />
        {images[index].caption && (
          <p className="mt-2 text-center text-white">{images[index].caption}</p>
        )}
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              className="rounded bg-white/20 px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => setIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
              aria-label="Попереднє"
            >
              ←
            </button>
            <span className="text-white">
              {index + 1} / {images.length}
            </span>
            <button
              className="rounded bg-white/20 px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => setIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
              aria-label="Наступне"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function VideoLightbox({
  youtubeUrl,
  title,
  onClose,
}: {
  youtubeUrl: string;
  title?: string | null;
  onClose: () => void;
}) {
  const t = useTranslations("common");
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!embedUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "YouTube"}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 text-3xl text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        onClick={onClose}
        aria-label={t("close")}
      >
        ×
      </button>
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
          <iframe
            src={`${embedUrl}?autoplay=1&rel=0`}
            title={title || "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        {title && <p className="mt-3 text-center text-white">{title}</p>}
      </div>
    </div>
  );
}

export function GalleryVideoCard({
  youtubeUrl,
  title,
  onPlay,
}: {
  youtubeUrl: string;
  title?: string | null;
  onPlay: () => void;
}) {
  const thumb = getYoutubeThumbnail(youtubeUrl);
  return (
    <button
      type="button"
      onClick={onPlay}
      className="card-hover block w-full overflow-hidden rounded-xl bg-white text-left shadow-md"
    >
      <div className="relative aspect-video bg-dark-blue">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={title || "Відео"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">▶️</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl text-white shadow-lg">
            ▶
          </span>
        </div>
      </div>
      {title && <p className="p-3 text-sm font-medium text-dark-blue">{title}</p>}
    </button>
  );
}
