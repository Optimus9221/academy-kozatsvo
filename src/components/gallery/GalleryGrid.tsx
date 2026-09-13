"use client";

import { useState, useEffect } from "react";
import { Lightbox, GalleryVideoCard, VideoLightbox } from "@/components/cards/GalleryCard";
import { useTranslations } from "next-intl";

interface GalleryItem {
  id: string;
  type: "PHOTO" | "VIDEO";
  imageUrl?: string | null;
  youtubeUrl?: string | null;
  title?: string | null;
  caption?: string | null;
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const t = useTranslations("gallery");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<{
    youtubeUrl: string;
    title?: string | null;
  } | null>(null);

  const photos = items
    .filter((i) => i.type === "PHOTO" && i.imageUrl)
    .map((i) => ({ url: i.imageUrl!, caption: i.caption }));

  const videos = items.filter((i) => i.type === "VIDEO" && i.youtubeUrl);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : photos.length - 1));
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, photos.length]);

  if (items.length === 0) {
    return <p className="text-center text-text-muted">{t("empty")}</p>;
  }

  return (
    <>
      {photos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <button
              key={index}
              className="aspect-square overflow-hidden rounded-lg shadow-md"
              onClick={() => setLightboxIndex(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption || ""}
                className="h-full w-full object-cover transition hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <GalleryVideoCard
              key={video.id}
              youtubeUrl={video.youtubeUrl!}
              title={video.title}
              onPlay={() =>
                setActiveVideo({
                  youtubeUrl: video.youtubeUrl!,
                  title: video.title,
                })
              }
            />
          ))}
        </div>
      )}

      {activeVideo && (
        <VideoLightbox
          youtubeUrl={activeVideo.youtubeUrl}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
