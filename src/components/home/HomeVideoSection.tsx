import { getYoutubeEmbedUrl } from "@/lib/api-utils";

interface HomeVideoSectionProps {
  youtubeUrl: string;
  title: string;
}

export function HomeVideoSection({ youtubeUrl, title }: HomeVideoSectionProps) {
  const embed = getYoutubeEmbedUrl(youtubeUrl);
  if (!embed) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-dark-blue">{title}</h2>
        <div className="aspect-video overflow-hidden rounded-xl shadow-xl">
          <iframe
            src={embed}
            title={title}
            className="h-full w-full"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
