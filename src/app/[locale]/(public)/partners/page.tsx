import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { PartnerCard } from "@/components/cards/PartnerCard";
import { prisma } from "@/lib/db";
import { localizePartner } from "@/lib/i18n/entities";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partners" });
  return { title: t("title") };
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("partners");

  const partnersRaw = await prisma.partner.findMany({
    include: { translations: true },
    orderBy: { order: "asc" },
  });

  const partners = partnersRaw.map((partner) => localizePartner(partner, locale));

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {partners.length === 0 ? (
            <p className="text-center text-text-muted">{t("empty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <PartnerCard key={partner.id} {...partner} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
