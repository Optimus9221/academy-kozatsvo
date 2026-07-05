"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ImageUploadField } from "@/components/admin/AdminUtils";
import {
  LocaleTabs,
  buildTranslationPayload,
  type TranslationFormData,
} from "@/components/admin/LocaleTabs";
import type { Locale } from "@/i18n/locales";

export default function AdminGalleryNewPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [form, setForm] = useState({ title: "", description: "", coverImageUrl: "" });

  function updateTranslation(locale: Locale, key: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/gallery/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        translations: buildTranslationPayload(translations),
      }),
    });
    if (res.ok) router.push("/admin/gallery");
  }

  return (
    <div>
      <Link href="/admin/gallery" className="text-sm text-ukraine-blue hover:underline">
        ← {tc("back")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t("newAlbum")}</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <label className="admin-label">{t("title")}</label>
          <input required className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">{t("description")}</label>
          <textarea className="admin-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <LocaleTabs
          fields={[
            { key: "title", label: t("title") },
            { key: "description", label: t("description"), type: "textarea" },
          ]}
          values={translations}
          onChange={updateTranslation}
          baseValues={{ title: form.title, description: form.description }}
        />

        <ImageUploadField label={t("cover")} value={form.coverImageUrl} onChange={(url) => setForm({ ...form, coverImageUrl: url })} />
        <button type="submit" className="admin-btn admin-btn-primary">{tc("create")}</button>
      </form>
    </div>
  );
}
