"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ImageUploadField } from "@/components/admin/AdminUtils";
import { CopyFromDefaultLocaleButton } from "@/components/admin/CopyFromDefaultLocaleButton";
import {
  LocaleTabs,
  buildTranslationPayload,
  type TranslationFormData,
} from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Locale } from "@/i18n/locales";

export default function AdminEventEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    startsAt: "",
    endsAt: "",
    imageUrl: "",
    status: "UPCOMING",
  });

  useEffect(() => {
    fetch(`/api/admin/events/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          location: data.location || "",
          startsAt: data.startsAt
            ? new Date(data.startsAt).toISOString().slice(0, 16)
            : "",
          endsAt: data.endsAt
            ? new Date(data.endsAt).toISOString().slice(0, 16)
            : "",
          imageUrl: data.imageUrl || "",
          status: data.status || "UPCOMING",
        });
        const tr: TranslationFormData = {};
        for (const item of data.translations || []) {
          tr[item.locale as Locale] = {
            title: item.title || "",
            description: item.description || "",
            location: item.location || "",
          };
        }
        setTranslations(tr);
      })
      .finally(() => setLoading(false));
  }, [id]);

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
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          endsAt: form.endsAt || null,
          translations: buildTranslationPayload(translations),
        }),
      });
      if (res.ok) router.push("/admin/events");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>{tc("loading")}</p>;

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-ukraine-blue hover:underline">
        ← {tc("back")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-dark-blue">{t("editEvent")}</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <label className="admin-label">{t("title")} *</label>
          <input required className="admin-input" value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">{t("slug")}</label>
          <input className="admin-input" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
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
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? tc("loading") : tc("save")}
        </button>
      </form>
    </div>
  );
}
