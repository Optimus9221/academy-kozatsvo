"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ImageUploadField } from "@/components/admin/AdminUtils";
import {
  LocaleTabs,
  buildTranslationPayload,
  type TranslationFormData,
} from "@/components/admin/LocaleTabs";
import type { Locale } from "@/i18n/locales";

export default function AdminSettingsPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [form, setForm] = useState({
    siteName: "",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    defaultSeoTitle: "",
    defaultSeoDescription: "",
    aboutText: "",
    heroSlogan: "",
    heroImageUrl: "",
    youtube: "",
    facebook: "",
    instagram: "",
    telegram: "",
  });
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const social =
          d.socialLinks ||
          (typeof d.socialLinksJson === "string"
            ? JSON.parse(d.socialLinksJson || "{}")
            : {});
        setForm({
          siteName: d.siteName || "",
          logoUrl: d.logoUrl || "",
          contactEmail: d.contactEmail || "",
          contactPhone: d.contactPhone || "",
          contactAddress: d.contactAddress || "",
          defaultSeoTitle: d.defaultSeoTitle || "",
          defaultSeoDescription: d.defaultSeoDescription || "",
          aboutText: d.aboutText || "",
          heroSlogan: d.heroSlogan || "",
          heroImageUrl: d.heroImageUrl || "",
          youtube: social.youtube || "",
          facebook: social.facebook || "",
          instagram: social.instagram || "",
          telegram: social.telegram || "",
        });
        const tr: TranslationFormData = {};
        for (const item of d.translations || []) {
          tr[item.locale as Locale] = {
            siteName: item.siteName || "",
            aboutText: item.aboutText || "",
            heroSlogan: item.heroSlogan || "",
            seoTitle: item.seoTitle || "",
            seoDescription: item.seoDescription || "",
            contactAddress: item.contactAddress || "",
          };
        }
        setTranslations(tr);
      });
  }, []);

  function updateTranslation(locale: Locale, key: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName: form.siteName,
        logoUrl: form.logoUrl,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        contactAddress: form.contactAddress,
        defaultSeoTitle: form.defaultSeoTitle,
        defaultSeoDescription: form.defaultSeoDescription,
        aboutText: form.aboutText,
        heroSlogan: form.heroSlogan,
        heroImageUrl: form.heroImageUrl,
        socialLinks: {
          youtube: form.youtube,
          facebook: form.facebook,
          instagram: form.instagram,
          telegram: form.telegram,
        },
        translations: buildTranslationPayload(translations),
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-blue">{t("settings")}</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <label className="admin-label">{t("siteName")}</label>
          <input className="admin-input" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
        </div>
        <ImageUploadField label={t("logo")} value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} />
        <div>
          <label className="admin-label">{t("slogan")}</label>
          <input className="admin-input" value={form.heroSlogan} onChange={(e) => setForm({ ...form, heroSlogan: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">{t("aboutText")}</label>
          <textarea className="admin-input" rows={4} value={form.aboutText} onChange={(e) => setForm({ ...form, aboutText: e.target.value })} />
        </div>
        <ImageUploadField label={t("heroImage")} value={form.heroImageUrl} onChange={(url) => setForm({ ...form, heroImageUrl: url })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">Email</label>
            <input className="admin-input" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div>
            <label className="admin-label">Phone</label>
            <input className="admin-input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="admin-label">{t("address")}</label>
          <input className="admin-input" value={form.contactAddress} onChange={(e) => setForm({ ...form, contactAddress: e.target.value })} />
        </div>

        <LocaleTabs
          fields={[
            { key: "siteName", label: t("siteName") },
            { key: "heroSlogan", label: t("slogan") },
            { key: "aboutText", label: t("aboutText"), type: "textarea" },
            { key: "seoTitle", label: "SEO Title" },
            { key: "seoDescription", label: "SEO Description", type: "textarea" },
            { key: "contactAddress", label: t("address") },
          ]}
          values={translations}
          onChange={updateTranslation}
          baseValues={{
            siteName: form.siteName,
            heroSlogan: form.heroSlogan,
            aboutText: form.aboutText,
            seoTitle: form.defaultSeoTitle,
            seoDescription: form.defaultSeoDescription,
            contactAddress: form.contactAddress,
          }}
        />

        <h3 className="pt-4 font-bold">SEO</h3>
        <div>
          <label className="admin-label">Title</label>
          <input className="admin-input" value={form.defaultSeoTitle} onChange={(e) => setForm({ ...form, defaultSeoTitle: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">Description</label>
          <textarea className="admin-input" rows={2} value={form.defaultSeoDescription} onChange={(e) => setForm({ ...form, defaultSeoDescription: e.target.value })} />
        </div>
        <h3 className="pt-4 font-bold">Social</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="admin-label">YouTube</label><input className="admin-input" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} /></div>
          <div><label className="admin-label">Facebook</label><input className="admin-input" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} /></div>
          <div><label className="admin-label">Instagram</label><input className="admin-input" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
          <div><label className="admin-label">Telegram</label><input className="admin-input" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} /></div>
        </div>
        <button type="submit" className="admin-btn admin-btn-primary">
          {saved ? `${t("saved")} ✓` : tc("save")}
        </button>
      </form>
    </div>
  );
}
