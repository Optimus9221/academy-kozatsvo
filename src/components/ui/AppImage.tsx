import Image, { type ImageProps } from "next/image";
import { resolveMediaUrl } from "@/lib/media-url";

type AppImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function AppImage({ src, alt, className, fill, ...props }: AppImageProps) {
  const resolved = resolveMediaUrl(src);
  const isLocal = resolved.startsWith("/");

  // Blob / remote uploads must support `fill` like local images.
  if (!isLocal) {
    return (
      <Image
        src={resolved}
        alt={alt}
        className={className}
        fill={fill}
        unoptimized
        {...props}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      className={className}
      fill={fill}
      unoptimized={resolved.startsWith("/uploads")}
      {...props}
    />
  );
}
