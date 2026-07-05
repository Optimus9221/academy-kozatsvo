import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHero } from "@/components/layout/PageHero";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { prisma } from "@/lib/db";
import { localizeAlbum } from "@/lib/i18n/entities";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  const albumRaw = await prisma.galleryAlbum.findUnique({
    where: { slug },
    include: { translations: true },
  });
  const album = albumRaw ? localizeAlbum(albumRaw, locale) : null;
  return buildPageMetadata({
    locale,
    path: `/gallery/${slug}`,
    title: album?.title || t("title"),
    description: album?.description,
    image: album?.coverImageUrl,
  });
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("gallery");
  const tCommon = await getTranslations("common");

  const albumRaw = await prisma.galleryAlbum.findUnique({
    where: { slug },
    include: {
      translations: true,
      items: { orderBy: { order: "asc" } },
    },
  });

  if (!albumRaw) notFound();

  const album = localizeAlbum(albumRaw, locale);

  return (
    <>
      <PageHero title={album.title} subtitle={album.description || undefined} />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Breadcrumbs
            items={[
              { label: tCommon("home"), href: "/" },
              { label: t("title"), href: "/gallery" },
              { label: album.title },
            ]}
          />
          <GalleryGrid items={album.items} />
        </div>
      </section>
    </>
  );
}
