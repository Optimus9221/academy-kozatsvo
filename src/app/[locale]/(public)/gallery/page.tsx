import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { GalleryAlbumCard } from "@/components/cards/GalleryCard";
import { prisma } from "@/lib/db";
import { localizeAlbum } from "@/lib/i18n/entities";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return { title: t("title") };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("gallery");

  const albumsRaw = await prisma.galleryAlbum.findMany({
    include: { translations: true, _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  const albums = albumsRaw.map((album) => localizeAlbum(album, locale));

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {albums.length === 0 ? (
            <p className="text-center text-text-muted">{t("empty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <GalleryAlbumCard
                  key={album.id}
                  title={album.title}
                  slug={album.slug}
                  description={album.description}
                  coverImageUrl={album.coverImageUrl}
                  itemCount={album._count.items}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
