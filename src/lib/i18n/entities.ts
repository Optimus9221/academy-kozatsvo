import { prisma } from "@/lib/db";
import { defaultLocale } from "@/i18n/locales";

export function localizeNews<T extends {
  title: string;
  previewText: string | null;
  body: string;
  translations?: { locale: string; title: string; previewText: string | null; body: string }[];
}>(item: T, locale: string) {
  if (locale === defaultLocale) return item;
  const tr = item.translations?.find((t) => t.locale === locale);
  if (!tr) return item;
  return {
    ...item,
    title: tr.title || item.title,
    previewText: tr.previewText ?? item.previewText,
    body: tr.body || item.body,
  };
}

export function localizePartner<T extends {
  name: string;
  description: string | null;
  translations?: { locale: string; name: string; description: string | null }[];
}>(item: T, locale: string) {
  if (locale === defaultLocale) return item;
  const tr = item.translations?.find((t) => t.locale === locale);
  if (!tr) return item;
  return {
    ...item,
    name: tr.name || item.name,
    description: tr.description ?? item.description,
  };
}

export function localizeLeader<T extends {
  name: string;
  position: string;
  bio: string | null;
  translations?: { locale: string; name: string; position: string; bio: string | null }[];
}>(item: T, locale: string) {
  if (locale === defaultLocale) return item;
  const tr = item.translations?.find((t) => t.locale === locale);
  if (!tr) return item;
  return {
    ...item,
    name: tr.name || item.name,
    position: tr.position || item.position,
    bio: tr.bio ?? item.bio,
  };
}

export function localizeBranch<T extends {
  name: string;
  headName: string;
  address: string | null;
  translations?: { locale: string; name: string; headName: string; address: string | null }[];
}>(item: T, locale: string) {
  if (locale === defaultLocale) return item;
  const tr = item.translations?.find((t) => t.locale === locale);
  if (!tr) return item;
  return {
    ...item,
    name: tr.name || item.name,
    headName: tr.headName || item.headName,
    address: tr.address ?? item.address,
  };
}

export function localizeAlbum<T extends {
  title: string;
  description: string | null;
  translations?: { locale: string; title: string; description: string | null }[];
}>(item: T, locale: string) {
  if (locale === defaultLocale) return item;
  const tr = item.translations?.find((t) => t.locale === locale);
  if (!tr) return item;
  return {
    ...item,
    title: tr.title || item.title,
    description: tr.description ?? item.description,
  };
}

export async function syncNewsTranslations(
  newsId: string,
  payload: Record<string, { title?: string; previewText?: string; body?: string }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data?.title?.trim()) continue;
    await prisma.newsTranslation.upsert({
      where: { newsId_locale: { newsId, locale } },
      create: {
        newsId,
        locale,
        title: data.title!.trim(),
        previewText: data.previewText?.trim() || "",
        body: data.body?.trim() || "",
      },
      update: {
        title: data.title!.trim(),
        previewText: data.previewText?.trim() || "",
        body: data.body?.trim() || "",
      },
    });
  }
}

export async function syncPartnerTranslations(
  partnerId: string,
  payload: Record<string, { name?: string; description?: string }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data?.name?.trim()) continue;
    await prisma.partnerTranslation.upsert({
      where: { partnerId_locale: { partnerId, locale } },
      create: {
        partnerId,
        locale,
        name: data.name!.trim(),
        description: data.description?.trim() || "",
      },
      update: {
        name: data.name!.trim(),
        description: data.description?.trim() || "",
      },
    });
  }
}

export async function syncSettingsTranslations(
  settingsId: string,
  payload: Record<string, {
    siteName?: string;
    aboutText?: string;
    heroSlogan?: string;
    seoTitle?: string;
    seoDescription?: string;
    contactAddress?: string;
  }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale) continue;
    const hasContent = data.siteName?.trim() || data.aboutText?.trim();
    if (!hasContent) {
      await prisma.siteSettingsTranslation.deleteMany({ where: { settingsId, locale } });
      continue;
    }
    await prisma.siteSettingsTranslation.upsert({
      where: { settingsId_locale: { settingsId, locale } },
      create: {
        settingsId,
        locale,
        siteName: data.siteName?.trim() || null,
        aboutText: data.aboutText?.trim() || null,
        heroSlogan: data.heroSlogan?.trim() || null,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        contactAddress: data.contactAddress?.trim() || null,
      },
      update: {
        siteName: data.siteName?.trim() || null,
        aboutText: data.aboutText?.trim() || null,
        heroSlogan: data.heroSlogan?.trim() || null,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        contactAddress: data.contactAddress?.trim() || null,
      },
    });
  }
}

export async function syncJoinRulesTranslations(
  rulesId: string,
  payload: Record<string, { contentHtml?: string }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data?.contentHtml?.trim()) continue;
    await prisma.joinRulesTranslation.upsert({
      where: { rulesId_locale: { rulesId, locale } },
      create: { rulesId, locale, contentHtml: data.contentHtml.trim() },
      update: { contentHtml: data.contentHtml.trim() },
    });
  }
}

export async function syncLeaderTranslations(
  leaderId: string,
  payload: Record<string, { name?: string; position?: string; bio?: string }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data?.name?.trim()) continue;
    await prisma.leaderTranslation.upsert({
      where: { leaderId_locale: { leaderId, locale } },
      create: {
        leaderId,
        locale,
        name: data.name!.trim(),
        position: data.position?.trim() || "",
        bio: data.bio?.trim() || null,
      },
      update: {
        name: data.name!.trim(),
        position: data.position?.trim() || "",
        bio: data.bio?.trim() || null,
      },
    });
  }
}

export async function syncBranchTranslations(
  branchId: string,
  payload: Record<string, { name?: string; headName?: string; address?: string }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data?.name?.trim()) continue;
    await prisma.branchTranslation.upsert({
      where: { branchId_locale: { branchId, locale } },
      create: {
        branchId,
        locale,
        name: data.name!.trim(),
        headName: data.headName?.trim() || "",
        address: data.address?.trim() || null,
      },
      update: {
        name: data.name!.trim(),
        headName: data.headName?.trim() || "",
        address: data.address?.trim() || null,
      },
    });
  }
}

export async function syncAlbumTranslations(
  albumId: string,
  payload: Record<string, { title?: string; description?: string }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data?.title?.trim()) continue;
    await prisma.galleryAlbumTranslation.upsert({
      where: { albumId_locale: { albumId, locale } },
      create: {
        albumId,
        locale,
        title: data.title!.trim(),
        description: data.description?.trim() || null,
      },
      update: {
        title: data.title!.trim(),
        description: data.description?.trim() || null,
      },
    });
  }
}

export function localizeEvent<T extends {
  title: string;
  description: string | null;
  location: string | null;
  translations?: { locale: string; title: string; description: string | null; location: string | null }[];
}>(item: T, locale: string) {
  if (locale === defaultLocale) return item;
  const tr = item.translations?.find((t) => t.locale === locale);
  if (!tr) return item;
  return {
    ...item,
    title: tr.title || item.title,
    description: tr.description ?? item.description,
    location: tr.location ?? item.location,
  };
}

export function localizeFaqItem<T extends {
  question: string;
  answerHtml: string;
  translations?: { locale: string; question: string; answerHtml: string }[];
}>(item: T, locale: string) {
  if (locale === defaultLocale) return item;
  const tr = item.translations?.find((t) => t.locale === locale);
  if (!tr) return item;
  return {
    ...item,
    question: tr.question || item.question,
    answerHtml: tr.answerHtml || item.answerHtml,
  };
}

export async function syncEventTranslations(
  eventId: string,
  payload: Record<string, { title?: string; description?: string; location?: string }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data?.title?.trim()) continue;
    await prisma.eventTranslation.upsert({
      where: { eventId_locale: { eventId, locale } },
      create: {
        eventId,
        locale,
        title: data.title!.trim(),
        description: data.description?.trim() || null,
        location: data.location?.trim() || null,
      },
      update: {
        title: data.title!.trim(),
        description: data.description?.trim() || null,
        location: data.location?.trim() || null,
      },
    });
  }
}

export async function syncFaqItemTranslations(
  faqItemId: string,
  payload: Record<string, { question?: string; answerHtml?: string }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data?.question?.trim()) continue;
    await prisma.faqItemTranslation.upsert({
      where: { faqItemId_locale: { faqItemId, locale } },
      create: {
        faqItemId,
        locale,
        question: data.question!.trim(),
        answerHtml: data.answerHtml?.trim() || "",
      },
      update: {
        question: data.question!.trim(),
        answerHtml: data.answerHtml?.trim() || "",
      },
    });
  }
}

export async function syncGalleryItemTranslations(
  itemId: string,
  payload: Record<string, { caption?: string }> | undefined
) {
  if (!payload) return;
  for (const [locale, data] of Object.entries(payload)) {
    if (locale === defaultLocale || !data?.caption?.trim()) continue;
    await prisma.galleryItemTranslation.upsert({
      where: { itemId_locale: { itemId, locale } },
      create: { itemId, locale, caption: data.caption.trim() },
      update: { caption: data.caption.trim() },
    });
  }
}
