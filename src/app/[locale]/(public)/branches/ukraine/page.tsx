import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { BranchCard } from "@/components/cards/BranchCard";
import { BranchFilter } from "@/components/branches/BranchFilter";
import { BranchMap } from "@/components/branches/BranchMap";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { prisma } from "@/lib/db";
import { localizeBranch } from "@/lib/i18n/entities";
import { getBranchCoords } from "@/lib/branch-coords";
import { UKRAINE_REGIONS } from "@/lib/api-utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "branches" });
  return { title: t("ukraineTitle") };
}

export default async function UkraineBranchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ region?: string }>;
}) {
  const { locale } = await params;
  const { region } = await searchParams;
  const t = await getTranslations("branches");

  const branchesRaw = await prisma.branch.findMany({
    where: {
      type: "UKRAINE",
      ...(region ? { region } : {}),
    },
    include: { translations: true },
    orderBy: [{ order: "asc" }, { city: "asc" }],
  });

  const branches = branchesRaw.map((branch) => localizeBranch(branch, locale));
  const mapBranches = branches.map((b) => {
    const c = getBranchCoords(b.city);
    return { id: b.id, name: b.name, city: b.city, lat: c.lat, lng: c.lng };
  });

  return (
    <>
      <PageHero title={t("ukraineTitle")} subtitle={t("ukraineSubtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Breadcrumbs items={[{ label: t("ukraineTitle") }]} />
          <BranchMap branches={mapBranches} />
          <BranchFilter
            regions={UKRAINE_REGIONS}
            currentRegion={region}
            basePath="/branches/ukraine"
            filterLabel={t("filterRegion")}
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
