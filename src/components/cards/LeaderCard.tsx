import { getYoutubeEmbedUrl } from "@/lib/api-utils";

interface LeaderCardProps {
  name: string;
  position: string;
  photoUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  videos?: { youtubeUrl: string; title?: string | null }[];
}

export function LeaderCard({
  name,
  position,
  photoUrl,
  bio,
  phone,
  email,
  videos = [],
}: LeaderCardProps) {
  return (
    <article className="card-hover overflow-hidden rounded-xl bg-white shadow-md">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={name} className="h-64 w-full object-cover md:h-full" />
          ) : (
            <div className="flex h-64 items-center justify-center bg-gradient-to-b from-ukraine-blue to-dark-blue text-6xl md:h-full">
              👤
            </div>
          )}
        </div>
        <div className="flex-1 p-6">
          <h3 className="text-2xl font-bold text-dark-blue">{name}</h3>
          <p className="mt-1 text-ukraine-blue font-medium">{position}</p>
          {bio && <p className="mt-4 text-sm leading-relaxed text-text-muted">{bio}</p>}
          {(phone || email) && (
            <div className="mt-4 space-y-1 text-sm text-text-muted">
              {phone && <p>📞 {phone}</p>}
              {email && (
                <p>
                  ✉️{" "}
                  <a href={`mailto:${email}`} className="text-ukraine-blue hover:underline">
                    {email}
                  </a>
                </p>
              )}
            </div>
          )}
          {videos.length > 0 && (
            <div className="mt-6 space-y-4">
              {videos.map((video, i) => {
                const embed = getYoutubeEmbedUrl(video.youtubeUrl);
                if (!embed) return null;
                return (
                  <div key={i}>
                    {video.title && (
                      <p className="mb-2 text-sm font-medium">{video.title}</p>
                    )}
                    <div className="aspect-video overflow-hidden rounded-lg">
                      <iframe
                        src={embed}
                        title={video.title || `Відео ${name}`}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
