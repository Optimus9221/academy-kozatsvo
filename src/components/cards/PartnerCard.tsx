import Link from "next/link";

interface PartnerCardProps {
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
}

export function PartnerCard({ name, logoUrl, description, websiteUrl }: PartnerCardProps) {
  const content = (
    <div className="card-hover flex h-full flex-col items-center rounded-xl bg-white p-6 text-center shadow-md">
      <div className="mb-4 flex h-20 w-full items-center justify-center">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={name} className="max-h-16 max-w-full object-contain" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-ukraine-blue">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="font-bold text-dark-blue">{name}</h3>
      {description && (
        <p className="mt-2 text-sm text-text-muted line-clamp-3">{description}</p>
      )}
    </div>
  );

  if (websiteUrl) {
    return (
      <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

export function PartnerLogo({
  name,
  logoUrl,
  websiteUrl,
}: {
  name: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
}) {
  const inner = (
    <div className="flex h-16 items-center justify-center rounded-lg bg-white px-4 shadow-sm transition hover:shadow-md">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} className="max-h-12 max-w-[120px] object-contain" />
      ) : (
        <span className="text-sm font-semibold text-dark-blue">{name}</span>
      )}
    </div>
  );

  if (websiteUrl) {
    return (
      <a href={websiteUrl} target="_blank" rel="noopener noreferrer" title={name}>
        {inner}
      </a>
    );
  }

  return inner;
}
