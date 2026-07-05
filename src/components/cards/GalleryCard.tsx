"use client";

import { useState } from "react";
import Link from "next/link";
import { getYoutubeThumbnail } from "@/lib/api-utils";

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
        <p className="mt-2 text-xs text-ukraine-blue">{itemCount} елементів</p>
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
        className="absolute right-4 top-4 text-3xl text-white"
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
              className="rounded bg-white/20 px-4 py-2 text-white"
              onClick={() => setIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
            >
              ←
            </button>
            <span className="text-white">
              {index + 1} / {images.length}
            </span>
            <button
              className="rounded bg-white/20 px-4 py-2 text-white"
              onClick={() => setIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function GalleryVideoCard({
  youtubeUrl,
  title,
}: {
  youtubeUrl: string;
  title?: string | null;
}) {
  const thumb = getYoutubeThumbnail(youtubeUrl);
  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover block overflow-hidden rounded-xl bg-white shadow-md"
    >
      <div className="relative aspect-video bg-dark-blue">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={title || "Відео"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">▶️</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="rounded-full bg-red-600 px-4 py-2 text-white">YouTube</span>
        </div>
      </div>
      {title && <p className="p-3 text-sm font-medium text-dark-blue">{title}</p>}
    </a>
  );
}
