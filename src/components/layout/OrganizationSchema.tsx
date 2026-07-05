import { getSiteSettings } from "@/lib/settings";
import { getSiteBaseUrl } from "@/lib/seo";

export async function OrganizationSchema({ locale }: { locale: string }) {
  const settings = await getSiteSettings(locale);
  const baseUrl = getSiteBaseUrl();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    alternateName: "МАК",
    url: `${baseUrl}/${locale}`,
    logo: settings.logoUrl
      ? settings.logoUrl.startsWith("http")
        ? settings.logoUrl
        : `${baseUrl}${settings.logoUrl}`
      : undefined,
    description: settings.aboutText,
    email: settings.contactEmail || undefined,
    telephone: settings.contactPhone || undefined,
    address: settings.contactAddress
      ? { "@type": "PostalAddress", addressLocality: settings.contactAddress }
      : undefined,
    sameAs: Object.values(settings.socialLinks).filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
