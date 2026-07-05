interface BranchCardProps {
  name: string;
  city: string;
  region?: string | null;
  country?: string | null;
  headName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  photoUrl?: string | null;
}

export function BranchCard({
  name,
  city,
  region,
  country,
  headName,
  phone,
  email,
  address,
  photoUrl,
}: BranchCardProps) {
  return (
    <article className="card-hover overflow-hidden rounded-xl bg-white shadow-md">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-gradient-to-r from-ukraine-blue to-dark-blue text-4xl">
          🏛️
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-bold text-dark-blue">{name}</h3>
        <p className="mt-1 text-sm text-ukraine-blue">
          {[region, country, city].filter(Boolean).join(", ")}
        </p>
        <p className="mt-3 text-sm">
          <span className="font-medium">Керівник:</span> {headName}
        </p>
        {phone && (
          <p className="mt-1 text-sm text-text-muted">
            <a href={`tel:${phone}`} className="hover:text-ukraine-blue">
              {phone}
            </a>
          </p>
        )}
        {email && (
          <p className="mt-1 text-sm text-text-muted">
            <a href={`mailto:${email}`} className="hover:text-ukraine-blue">
              {email}
            </a>
          </p>
        )}
        {address && <p className="mt-1 text-sm text-text-muted">{address}</p>}
      </div>
    </article>
  );
}
