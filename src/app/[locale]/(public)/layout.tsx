import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrganizationSchema } from "@/components/layout/OrganizationSchema";
import { getSiteSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getSiteSettings(locale);

  return (
    <>
      <OrganizationSchema locale={locale} />
      <Header siteName={settings.siteName} logoUrl={settings.logoUrl} />
      <main className="relative z-0 flex-1">{children}</main>
      <Footer
        siteName={settings.siteName}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
        contactAddress={settings.contactAddress}
        socialLinks={settings.socialLinks}
      />
    </>
  );
}
