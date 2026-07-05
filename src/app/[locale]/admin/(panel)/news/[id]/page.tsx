"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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

export default function AdminNewsEditPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const id = params.id as string;
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [form, setForm] = useState({
    title: "",
    slug: "",
    previewText: "",
    body: "",
    mainImageUrl: "",
    status: "DRAFT",
    publishedAt: "",
    author: "",
    youtubeUrl: "",
    tags: "",
  });

  useEffect(() => {
    fetch(`/api/admin/news/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          previewText: data.previewText || "",
          body: data.body || "",
          mainImageUrl: data.mainImageUrl || "",
          status: data.status || "DRAFT",
          publishedAt: data.publishedAt
            ? new Date(data.publishedAt).toISOString().slice(0, 16)
            : "",
          author: data.author || "",
          youtubeUrl: data.youtubeUrl || "",
          tags: data.tags?.map((t: { tag: { name: string } }) => t.tag.name).join(", ") || "",
        });
        const tr: TranslationFormData = {};
        for (const item of data.translations || []) {
          tr[item.locale as Locale] = {
            title: item.title || "",
            previewText: item.previewText || "",
            body: item.body || "",
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
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          publishedAt: form.publishedAt || null,
          translations: buildTranslationPayload(translations),
        }),
      });
      if (res.ok) router.push("/admin/news");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>{tc("loading")}</p>;

  return (
    <div>
      <Link href="/admin/news" className="text-sm text-ukraine-blue hover:underline">
        ← {tc("back")}
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-blue">{t("editNews")}</h1>
        {form.slug && (
          <a
            href={`/${locale}/news/${form.slug}?preview=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-secondary text-sm"
          >
            {t("preview")}
          </a>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <label className="admin-label">{t("title")}</label>
          <input required className="admin-input" value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">{t("slug")}</label>
          <input required className="admin-input" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">{t("preview")}</label>
          <textarea className="admin-input" rows={2} value={form.previewText} onChange={(e) => update("previewText", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">{t("body")} (HTML)</label>
          <RichTextEditor value={form.body} onChange={(body) => update("body", body)} minHeight="300px" />
        </div>

        <CopyFromDefaultLocaleButton
          baseValues={{
            title: form.title,
            previewText: form.previewText,
            body: form.body,
          }}
          onCopy={(copied) =>
            setTranslations((prev) => ({ ...prev, ...copied }))
          }
        />

        <LocaleTabs
          fields={[
            { key: "title", label: t("title") },
            { key: "previewText", label: t("preview"), type: "textarea" },
            { key: "body", label: t("body"), type: "html" },
          ]}
          values={translations}
          onChange={updateTranslation}
          baseValues={{
            title: form.title,
            previewText: form.previewText,
            body: form.body,
          }}
        />

        <ImageUploadField label={t("mainImage")} value={form.mainImageUrl} onChange={(url) => update("mainImageUrl", url)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">{t("status")}</label>
            <select className="admin-input" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="DRAFT">{t("draft")}</option>
              <option value="PUBLISHED">{t("published")}</option>
              <option value="HIDDEN">{t("hidden")}</option>
            </select>
          </div>
          <div>
            <label className="admin-label">{t("publishedAt")}</label>
            <input type="datetime-local" className="admin-input" value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="admin-label">{t("tags")}</label>
          <input className="admin-input" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
        </div>
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? tc("loading") : tc("save")}
        </button>
      </form>
    </div>
  );
}
