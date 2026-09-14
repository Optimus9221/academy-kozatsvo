"use client";

import { useEffect, useState } from "react";
import { Lightbox } from "@/components/cards/GalleryCard";

type NewsGalleryItem = {
  id: string;
  imageUrl: string;
  caption?: string | null;
};

export function NewsImageGallery({ images }: { images: NewsGalleryItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = images.map((img) => ({
    url: img.imageUrl,
    caption: img.caption,
  }));

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) =>
          i !== null && i > 0 ? i - 1 : photos.length - 1
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) =>
          i !== null && i < photos.length - 1 ? i + 1 : 0
        );
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, photos.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {images.map((img, index) => (
          <figure key={img.id}>
            <button
              type="button"
              className="block w-full overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-ukraine-blue"
              onClick={() => setLightboxIndex(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={img.caption || ""}
                className="w-full transition hover:scale-[1.02]"
              />
            </button>
            {img.caption && (
              <figcaption className="mt-1 text-sm text-text-muted">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

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
