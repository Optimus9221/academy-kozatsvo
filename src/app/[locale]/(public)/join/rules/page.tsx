import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/PageHero";
import { Link } from "@/i18n/navigation";
import { getJoinRules } from "@/lib/settings";
import { parseJsonArray } from "@/lib/uploads";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "join" });
  return { title: t("rulesTitle") };
}

export default async function JoinRulesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("join");
  const tAdmin = await getTranslations("admin");
  const tDocs = await getTranslations("documents");
  const rules = await getJoinRules(locale);
  const pdfUrls = parseJsonArray(rules.pdfUrls);

  const documentLinks = pdfUrls.map((url, i) => ({
    url,
    label:
      url.includes("/about/documents/statut") || url.endsWith("statut-mak.docx")
        ? tDocs("statute")
        : `${tAdmin("documents")} ${i + 1}`,
    external: !url.startsWith("/"),
  }));

  return (
    <>
      <PageHero title={t("rulesTitle")} subtitle={t("rulesSubtitle")} />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div
            className="prose-content rounded-xl bg-white p-8 shadow-md"
            dangerouslySetInnerHTML={{ __html: rules.contentHtml }}
          />

          {documentLinks.length > 0 && (
            <div className="mt-8 rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-bold text-dark-blue">
                {tAdmin("documents")}
              </h3>
              <ul className="space-y-2">
                {documentLinks.map((doc) => (
                  <li key={doc.url}>
                    {doc.external ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ukraine-blue hover:underline"
                      >
                        📄 {doc.label}
                      </a>
                    ) : (
                      <Link href={doc.url} className="text-ukraine-blue hover:underline">
                        📄 {doc.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
