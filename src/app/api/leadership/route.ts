import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-utils";
import { getLocaleFromRequest } from "@/lib/settings";
import { localizeLeader } from "@/lib/i18n/entities";

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const leaders = await prisma.leader.findMany({
    include: { videos: true, translations: true },
    orderBy: { order: "asc" },
  });
  return jsonOk(leaders.map((l) => localizeLeader(l, locale)));
}
