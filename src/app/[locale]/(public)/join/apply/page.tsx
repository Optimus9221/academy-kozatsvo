import { getTranslations } from "next-intl/server";
import { ApplyForm } from "./ApplyForm";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "join" });
  return { title: t("applyTitle") };
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <ApplyForm />;
}
