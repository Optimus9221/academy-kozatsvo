import { AppImage } from "@/components/ui/AppImage";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export function PageHero({ title, subtitle, imageUrl = "/images/hero-cossacks-bg.jpg" }: PageHeroProps) {
  return (
    <section className="page-hero relative isolate z-0 min-h-[220px] overflow-hidden py-20 text-white">
      <div className="page-hero-media absolute inset-0 z-0 overflow-hidden">
        <AppImage
          src={imageUrl}
          alt={title}
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-dark-blue/85 via-dark-blue/55 to-dark-blue/35" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
        <h1 className="text-4xl font-bold drop-shadow-md md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-blue-100 drop-shadow">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
