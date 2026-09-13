import Image, { type ImageProps } from "next/image";

type AppImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function AppImage({ src, alt, className, fill, ...props }: AppImageProps) {
  const isLocal = src.startsWith("/");

  // Blob / remote uploads must support `fill` like local images.
  if (!isLocal) {
    return (
      <Image
        src={src}
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
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      unoptimized={src.startsWith("/uploads")}
      {...props}
    />
  );
}
