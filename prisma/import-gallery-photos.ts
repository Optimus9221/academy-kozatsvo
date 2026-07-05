import "dotenv/config";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "./client";

const SOURCE_DIR = path.join("C:\\Users\\Gamer_1\\Desktop", "Академия козацтва");
const TARGET_DIR = path.join(process.cwd(), "public", "uploads", "gallery");
const ALBUM_SLUG = "akademiya-kozatsva";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function copyImage(filename: string): string {
  const src = path.join(SOURCE_DIR, filename);
  const ext = path.extname(filename).toLowerCase();
  const destName = `${randomUUID()}${ext}`;
  const dest = path.join(TARGET_DIR, destName);
  fs.copyFileSync(src, dest);
  return `/uploads/gallery/${destName}`;
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error("Source folder not found:", SOURCE_DIR);
    process.exit(1);
  }

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "uk"));

  if (files.length === 0) {
    console.error("No images found in", SOURCE_DIR);
    process.exit(1);
  }

  console.log(`Found ${files.length} images`);

  const imageUrls = files.map((file) => {
    const url = copyImage(file);
    console.log(`  copied ${file}`);
    return url;
  });

  let album = await prisma.galleryAlbum.findUnique({
    where: { slug: ALBUM_SLUG },
    include: { items: true },
  });

  if (!album) {
    album = await prisma.galleryAlbum.create({
      data: {
        title: "Академія козацтва",
        slug: ALBUM_SLUG,
        description: "Фото з матеріалів Міжнародної Академії Козацтва",
        coverImageUrl: imageUrls[0],
      },
      include: { items: true },
    });
    console.log("Created album:", album.title);
  } else {
    await prisma.galleryAlbum.update({
      where: { id: album.id },
      data: {
        description: "Фото з матеріалів Міжнародної Академії Козацтва",
        coverImageUrl: album.coverImageUrl || imageUrls[0],
      },
    });
    console.log("Using existing album:", album.title);
  }

  const startOrder = album.items.length;
  await prisma.galleryItem.createMany({
    data: imageUrls.map((imageUrl, i) => ({
      albumId: album!.id,
      type: "PHOTO" as const,
      imageUrl,
      order: startOrder + i,
    })),
  });

  const total = await prisma.galleryItem.count({ where: { albumId: album.id } });
  console.log(`Done. Album has ${total} photos. Slug: ${ALBUM_SLUG}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
