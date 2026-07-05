"use client";

import { AppImage } from "@/components/ui/AppImage";

interface HeroImageProps {
  src: string;
  alt?: string;
}

export function HeroImage({ src, alt = "" }: HeroImageProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <AppImage
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
    </div>
  );
}

interface HeroLeaderPhotoProps {
  src: string;
  name: string;
}

export function HeroLeaderPhoto({ src, name }: HeroLeaderPhotoProps) {
  return (
    <div className="mb-4 hidden items-center gap-4 lg:flex">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-ukraine-yellow shadow-lg ring-2 ring-white/30">
        <AppImage src={src} alt={name} fill className="object-cover" sizes="64px" />
      </div>
      <p className="text-sm font-medium text-white/90">{name}</p>
    </div>
  );
}
