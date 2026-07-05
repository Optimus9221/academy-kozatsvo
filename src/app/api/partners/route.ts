import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-utils";
import { getLocaleFromRequest } from "@/lib/settings";
import { localizePartner } from "@/lib/i18n/entities";

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const partners = await prisma.partner.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });
  return jsonOk(partners.map((p) => localizePartner(p, locale)));
}
