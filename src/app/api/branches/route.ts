import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-utils";
import type { BranchType } from "@/generated/prisma/client";
import { getLocaleFromRequest } from "@/lib/settings";
import { localizeBranch } from "@/lib/i18n/entities";

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type")?.toUpperCase() as BranchType | null;
  const region = searchParams.get("region");
  const country = searchParams.get("country");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (region) where.region = region;
  if (country) where.country = country;

  const branches = await prisma.branch.findMany({
    where,
    include: { translations: true },
    orderBy: [{ order: "asc" }, { city: "asc" }],
  });

  return jsonOk(branches.map((b) => localizeBranch(b, locale)));
}
