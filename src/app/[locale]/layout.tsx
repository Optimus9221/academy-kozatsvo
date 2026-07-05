import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, isLocale, isRtl, type Locale } from "@/i18n/locales";
import { HtmlLang } from "@/components/layout/HtmlLang";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <HtmlLang />
      <div dir={isRtl(locale as Locale) ? "rtl" : "ltr"}>{children}</div>
    </NextIntlClientProvider>
  );
}
