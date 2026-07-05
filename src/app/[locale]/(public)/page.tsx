import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { NewsCard } from "@/components/cards/NewsCard";
import { PartnerLogo } from "@/components/cards/PartnerCard";
import { HeroImage, HeroLeaderPhoto } from "@/components/layout/HeroImage";
import { HomeVideoSection } from "@/components/home/HomeVideoSection";
import { AppImage } from "@/components/ui/AppImage";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { localizeNews, localizePartner, localizeLeader } from "@/lib/i18n/entities";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSiteSettings(locale);
  return buildPageMetadata({
    locale,
    path: "/",
    title: settings.defaultSeoTitle || settings.siteName,
    description: settings.defaultSeoDescription || settings.heroSlogan,
    image: settings.heroImageUrl || settings.logoUrl,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const settings = await getSiteSettings(locale);

  const heroSrc = settings.heroImageUrl || "/images/hero-cossacks-bg.jpg";

  const [newsRaw, partnersRaw, headLeaderRaw] = await Promise.all([
    prisma.news.findMany({
      where: { status: "PUBLISHED" },
      include: { translations: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.partner.findMany({
      include: { translations: true },
      orderBy: { order: "asc" },
      take: 8,
    }),
    prisma.leader.findFirst({
      where: { order: 0 },
      include: { translations: true, videos: true },
    }),
  ]);

  const news = newsRaw.map((n) => localizeNews(n, locale));
  const partners = partnersRaw.map((p) => localizePartner(p, locale));
  const headLeader = headLeaderRaw ? localizeLeader(headLeaderRaw, locale) : null;
  const headVideoUrl = headLeaderRaw?.videos[0]?.youtubeUrl;
  const showHeadMessage = headLeaderRaw?.showHomeMessage !== false && Boolean(headVideoUrl);

  const features = [
    { image: "/images/news-conference.jpg", label: t("features.international") },
    { image: "/images/news-lviv-opening.jpg", label: t("features.traditions") },
    { image: "/images/news-youth-camp.jpg", label: t("features.community") },
    { image: "/images/leader-general.jpg", label: t("features.patriotism") },
  ];

  return (
    <>
      <section className="home-hero relative isolate z-0 min-h-[90vh] overflow-hidden text-white">
        <HeroImage src={heroSrc} alt={settings.siteName} />

        <div className="hero-vignette pointer-events-none absolute inset-0 md:hero-vignette-light" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 lg:px-8 lg:pb-24">
          <div className="hero-text max-w-2xl">
            {headLeader?.photoUrl && (
              <HeroLeaderPhoto src={headLeader.photoUrl} name={headLeader.name} />
            )}
            <div className="hero-badge mb-5 inline-flex items-center gap-3 rounded-full border border-white/30 bg-black/25 px-4 py-2 backdrop-blur-[2px]">
              <span className="text-2xl">🇺🇦</span>
              <span className="text-sm font-medium tracking-wide">{t("badge")}</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              {settings.siteName}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/95 md:text-xl">
              {settings.heroSlogan}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/about" variant="primary">
                {tNav("about")}
              </Button>
              <Button href="/news" variant="outline">
                {tNav("news")}
              </Button>
              <Button href="/join/apply" variant="secondary">
                {tNav("join")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {showHeadMessage && headVideoUrl && (
        <HomeVideoSection youtubeUrl={headVideoUrl} title={t("videoTitle")} />
      )}

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-dark-blue">{t("aboutTitle")}</h2>
              <div className="mt-2 h-1 w-20 bg-ukraine-yellow" />
              <p className="mt-6 text-lg leading-relaxed text-text-muted">
                {settings.aboutText}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/about" variant="secondary" size="sm">
                  {t("aboutMore")}
                </Button>
                <Button href="/about/documents" variant="outline-dark" size="sm">
                  {t("documentsBtn")}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((item) => (
                <div
                  key={item.label}
                  className="overflow-hidden rounded-xl bg-white shadow-md"
                >
                  <div className="relative aspect-[4/3]">
                    <AppImage src={item.image} alt={item.label} fill className="object-cover" sizes="200px" />
                  </div>
                  <p className="p-3 text-center text-sm font-semibold text-dark-blue">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {news.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-dark-blue">{t("latestNews")}</h2>
                <div className="mt-2 h-1 w-20 bg-ukraine-yellow" />
              </div>
              <Link href="/news" className="text-sm font-semibold text-ukraine-blue hover:underline">
                {tNav("news")} →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard key={item.id} {...item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {partners.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-dark-blue">{t("partnersTitle")}</h2>
              <div className="mx-auto mt-2 h-1 w-20 bg-ukraine-yellow" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {partners.map((partner) => (
                <PartnerLogo
                  key={partner.id}
                  name={partner.name}
                  logoUrl={partner.logoUrl}
                  websiteUrl={partner.websiteUrl}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="hero-gradient py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold">{t("joinTitle")}</h2>
          <p className="mt-4 text-lg text-blue-100">{t("joinText")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/join/rules" variant="primary">
              {t("joinRules")}
            </Button>
            <Button href="/join/apply" variant="outline">
              {t("joinApply")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
