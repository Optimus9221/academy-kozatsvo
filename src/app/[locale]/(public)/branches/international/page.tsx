import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { BranchCard } from "@/components/cards/BranchCard";
import { BranchFilter } from "@/components/branches/BranchFilter";
import { BranchMap } from "@/components/branches/BranchMap";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { prisma } from "@/lib/db";
import { localizeBranch } from "@/lib/i18n/entities";
import { getBranchCoords } from "@/lib/branch-coords";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "branches" });
  return { title: t("intlTitle") };
}

export default async function InternationalBranchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { locale } = await params;
  const { country } = await searchParams;
  const t = await getTranslations("branches");

  const [branchesRaw, countries] = await Promise.all([
    prisma.branch.findMany({
      where: {
        type: "INTERNATIONAL",
        ...(country ? { country } : {}),
      },
      include: { translations: true },
      orderBy: [{ order: "asc" }, { city: "asc" }],
    }),
    prisma.branch.findMany({
      where: { type: "INTERNATIONAL", country: { not: null } },
      select: { country: true },
      distinct: ["country"],
    }),
  ]);

  const branches = branchesRaw.map((branch) => localizeBranch(branch, locale));
  const mapBranches = branches.map((b) => {
    const c = getBranchCoords(b.city);
    return { id: b.id, name: b.name, city: b.city, lat: c.lat, lng: c.lng };
  });

  const countryList = countries
    .map((b) => b.country)
    .filter((c): c is string => !!c)
    .sort();

  return (
    <>
      <PageHero title={t("intlTitle")} subtitle={t("intlSubtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Breadcrumbs items={[{ label: t("intlTitle") }]} />
          <BranchMap branches={mapBranches} />
          <BranchFilter
            countries={countryList}
            currentCountry={country}
            basePath="/branches/international"
            filterLabel={t("filterCountry")}
          />

          {branches.length === 0 ? (
            <p className="mt-8 text-center text-text-muted">{t("empty")}</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <BranchCard key={branch.id} {...branch} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
