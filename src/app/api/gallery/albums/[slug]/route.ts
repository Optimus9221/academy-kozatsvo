import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { getLocaleFromRequest } from "@/lib/settings";
import { localizeAlbum } from "@/lib/i18n/entities";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const locale = getLocaleFromRequest(request);
  const { slug } = await params;
  const album = await prisma.galleryAlbum.findUnique({
    where: { slug },
    include: {
      items: { orderBy: { order: "asc" }, include: { translations: true } },
      translations: true,
    },
  });

  if (!album) return jsonError("Альбом не знайдено", 404);
  return jsonOk(localizeAlbum(album, locale));
}
