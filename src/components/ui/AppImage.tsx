import Image, { type ImageProps } from "next/image";

type AppImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function AppImage({ src, alt, className, ...props }: AppImageProps) {
  const isLocal = src.startsWith("/");

  if (!isLocal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} loading="lazy" />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      unoptimized={src.startsWith("/uploads")}
      {...props}
    />
  );
}
