"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ImageUploadField } from "@/components/admin/AdminUtils";
import { CopyFromDefaultLocaleButton } from "@/components/admin/CopyFromDefaultLocaleButton";
import {
  LocaleTabs,
  buildTranslationPayload,
  type TranslationFormData,
} from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Locale } from "@/i18n/locales";

export default function AdminEventNewPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    startsAt: "",
    endsAt: "",
    imageUrl: "",
    status: "UPCOMING",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateTranslation(locale: Locale, key: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          endsAt: form.endsAt || null,
          translations: buildTranslationPayload(translations),
        }),
      });
      if (res.ok) router.push("/admin/events");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-ukraine-blue hover:underline">
        ← {tc("back")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-dark-blue">{t("newEvent")}</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <label className="admin-label">{t("title")} *</label>
          <input required className="admin-input" value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">{t("description")}</label>
          <RichTextEditor value={form.description} onChange={(v) => update("description", v)} minHeight="200px" />
        </div>

        <CopyFromDefaultLocaleButton
          baseValues={{ title: form.title, description: form.description, location: form.location }}
          onCopy={(copied) => setTranslations((prev) => ({ ...prev, ...copied }))}
        />

        <LocaleTabs
          fields={[
            { key: "title", label: t("title") },
            { key: "description", label: t("description"), type: "html" },
            { key: "location", label: t("eventLocation") },
          ]}
          values={translations}
          onChange={updateTranslation}
          baseValues={{ title: form.title, description: form.description, location: form.location }}
        />

        <div>
          <label className="admin-label">{t("eventLocation")}</label>
          <input className="admin-input" value={form.location} onChange={(e) => update("location", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">{t("startsAt")} *</label>
            <input type="datetime-local" required className="admin-input" value={form.startsAt} onChange={(e) => update("startsAt", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">{t("endsAt")}</label>
            <input type="datetime-local" className="admin-input" value={form.endsAt} onChange={(e) => update("endsAt", e.target.value)} />
          </div>
        </div>
        <ImageUploadField label={t("mainImage")} value={form.imageUrl} onChange={(url) => update("imageUrl", url)} />
        <div>
          <label className="admin-label">{t("status")}</label>
          <select className="admin-input" value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option value="UPCOMING">{t("eventUpcoming")}</option>
            <option value="PAST">{t("eventPast")}</option>
            <option value="CANCELLED">{t("eventCancelled")}</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="admin-btn admin-btn-primary">
          {loading ? tc("loading") : tc("create")}
        </button>
      </form>
    </div>
  );
}
