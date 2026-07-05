/**
 * Non-destructive content sync: site settings, join rules, gallery album.
 * Does not reset users, applications, or other admin data.
 *
 * Usage: npm run db:sync-content
 */
import "dotenv/config";
import { prisma } from "./client";
import {
  aboutText,
  galleryAlbum,
  GALLERY_PHOTOS,
  heroImageUrl,
  heroSlogan,
  joinRulesHtml,
} from "./content/site-content";

async function main() {
  const settings = await prisma.siteSettings.findFirst();
  if (settings) {
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        aboutText,
        heroSlogan,
        heroImageUrl,
      },
    });
    console.log("Updated site settings");
  } else {
    console.warn("No site settings found — run db:seed first");
  }

  const rules = await prisma.joinRules.findFirst();
  if (rules) {
    await prisma.joinRules.update({
      where: { id: rules.id },
      data: {
        contentHtml: joinRulesHtml,
        pdfUrls: JSON.stringify(["/about/documents/statut"]),
      },
    });
    console.log("Updated join rules");
  } else {
    await prisma.joinRules.create({
      data: {
        contentHtml: joinRulesHtml,
        pdfUrls: JSON.stringify(["/about/documents/statut"]),
      },
    });
    console.log("Created join rules");
  }

  let album = await prisma.galleryAlbum.findUnique({
    where: { slug: galleryAlbum.slug },
  });

  if (!album) {
    album = await prisma.galleryAlbum.create({
      data: {
        title: galleryAlbum.title,
        slug: galleryAlbum.slug,
        description: galleryAlbum.description,
        coverImageUrl: GALLERY_PHOTOS[0],
      },
    });
    console.log("Created gallery album");
  } else {
    await prisma.galleryAlbum.update({
      where: { id: album.id },
      data: {
        title: galleryAlbum.title,
        description: galleryAlbum.description,
        coverImageUrl: GALLERY_PHOTOS[0],
      },
    });
    console.log("Updated gallery album");
  }

  await prisma.galleryItem.deleteMany({ where: { albumId: album.id } });
  await prisma.galleryItem.createMany({
    data: GALLERY_PHOTOS.map((imageUrl, order) => ({
      albumId: album!.id,
      type: "PHOTO" as const,
      imageUrl,
      order,
    })),
  });
  console.log(`Gallery: ${GALLERY_PHOTOS.length} photos synced`);

  console.log("Sync OK");
}

main().catch(console.error).finally(() => prisma.$disconnect());
