import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { LeaderCard } from "@/components/cards/LeaderCard";
import { prisma } from "@/lib/db";
import { localizeLeader } from "@/lib/i18n/entities";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leadership" });
  return { title: t("title") };
}

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("leadership");

  const leadersRaw = await prisma.leader.findMany({
    include: { translations: true, videos: true },
    orderBy: { order: "asc" },
  });

  const leaders = leadersRaw.map((leader) => localizeLeader(leader, locale));

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-5xl space-y-8 px-4 lg:px-8">
          {leaders.length === 0 ? (
            <p className="text-center text-text-muted">{t("empty")}</p>
          ) : (
            leaders.map((leader) => (
              <LeaderCard key={leader.id} {...leader} videos={leader.videos} />
            ))
          )}
        </div>
      </section>
    </>
  );
}
