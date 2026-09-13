import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { prisma } from "@/lib/db";
import { localizeEvent } from "@/lib/i18n/entities";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return buildPageMetadata({
    locale,
    path: "/events",
    title: t("title"),
    description: t("subtitle"),
  });
}

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "upcoming",
  PAST: "past",
  CANCELLED: "cancelled",
};

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("events");

  const eventsRaw = await prisma.event.findMany({
    where: { status: { not: "CANCELLED" } },
    include: { translations: true },
    orderBy: { startsAt: "desc" },
  });

  const events = eventsRaw.map((item) => localizeEvent(item, locale));

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          {events.length === 0 ? (
            <p className="text-center text-text-muted">{t("empty")}</p>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-xl bg-white shadow-md"
                >
                  {event.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          event.status === "UPCOMING"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t(STATUS_LABELS[event.status] || "upcoming")}
                      </span>
                      <time className="text-sm text-text-muted">
                        {new Date(event.startsAt).toLocaleDateString(locale, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-dark-blue">{event.title}</h2>
                    {event.location && (
                      <p className="mt-1 text-sm text-ukraine-blue">📍 {event.location}</p>
                    )}
                    {event.description && (
                      <div
                        className="prose prose-sm mt-4 max-w-none text-text-muted"
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
