import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-utils";
import { getLocaleFromRequest } from "@/lib/settings";
import { localizeAlbum } from "@/lib/i18n/entities";

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const albums = await prisma.galleryAlbum.findMany({
    include: { _count: { select: { items: true } }, translations: true },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(albums.map((a) => localizeAlbum(a, locale)));
}
