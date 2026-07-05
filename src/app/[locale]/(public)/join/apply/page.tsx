import { getTranslations } from "next-intl/server";
import { ApplyForm } from "./ApplyForm";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "join" });
  return buildPageMetadata({
    locale,
    path: "/join/apply",
    title: t("applyTitle"),
    description: t("applySubtitle"),
  });
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <ApplyForm />;
}
