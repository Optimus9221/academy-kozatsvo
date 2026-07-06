"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ImageUploadField, useAdminImageUpload } from "@/components/admin/AdminUtils";
import {
  LocaleTabs,
  buildTranslationPayload,
  type TranslationFormData,
} from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Locale } from "@/i18n/locales";

export default function AdminLeaderEditPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const { uploading: imageUploading, uploadFieldProps } = useAdminImageUpload();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [form, setForm] = useState({
    name: "",
    position: "",
    bio: "",
    photoUrl: "",
    order: "0",
    phone: "",
    email: "",
    youtubeUrl: "",
    showHomeMessage: true,
  });

  useEffect(() => {
    fetch(`/api/admin/leadership/${id}`)
      .then((r) => r.json())
      .then((l) => {
        if (!l?.id) {
          setError(t("loadError"));
          return;
        }
        setForm({
          name: l.name || "",
          position: l.position || "",
          bio: l.bio || "",
          photoUrl: l.photoUrl || "",
          order: String(l.order ?? 0),
          phone: l.phone || "",
          email: l.email || "",
          youtubeUrl: l.videos?.[0]?.youtubeUrl || "",
          showHomeMessage: l.showHomeMessage !== false,
        });
        const tr: TranslationFormData = {};
        for (const item of l.translations || []) {
          tr[item.locale as Locale] = {
            name: item.name || "",
            position: item.position || "",
            bio: item.bio || "",
          };
        }
        setTranslations(tr);
      })
      .catch(() => setError(t("loadError")))
      .finally(() => setLoading(false));
  }, [id, t]);

  function updateTranslation(locale: Locale, key: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const order = Number.parseInt(form.order, 10);
    if (Number.isNaN(order)) {
      setError(t("orderInvalid"));
      setSaving(false);
      return;
    }

    if (imageUploading) {
      setError(t("waitForUpload"));
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/leadership/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          position: form.position.trim(),
          bio: form.bio,
          photoUrl: form.photoUrl || null,
          order,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          showHomeMessage: form.showHomeMessage,
          videos: form.youtubeUrl.trim() ? [{ youtubeUrl: form.youtubeUrl.trim() }] : [],
          translations: buildTranslationPayload(translations),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t("saveError"));
        return;
      }

      setSaved(true);
      if (data.photoUrl) {
        setForm((prev) => ({ ...prev, photoUrl: data.photoUrl || "" }));
      }
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>{tc("loading")}</p>;

  return (
    <div>
      <Link href="/admin/leadership" className="text-sm text-ukraine-blue hover:underline">
        ← {tc("back")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{tc("edit")}</h1>
      <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-md">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {saved && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {t("saved")} ✓
          </div>
        )}
        <div>
          <label className="admin-label">{t("name")}</label>
          <input required className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">{t("position")}</label>
          <input required className="admin-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">{t("bio")}</label>
          <RichTextEditor value={form.bio} onChange={(bio) => setForm({ ...form, bio })} />
        </div>

        <LocaleTabs
          fields={[
            { key: "name", label: t("name") },
            { key: "position", label: t("position") },
            { key: "bio", label: t("bio"), type: "html" },
          ]}
          values={translations}
          onChange={updateTranslation}
          baseValues={{
            name: form.name,
            position: form.position,
            bio: form.bio,
          }}
        />

        <ImageUploadField
          label={t("mainImage")}
          value={form.photoUrl}
          onChange={(url) => setForm({ ...form, photoUrl: url })}
          {...uploadFieldProps}
        />
        <div>
          <label className="admin-label">{t("order")}</label>
          <input
            className="admin-input"
            type="number"
            min={0}
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />
        </div>
        <div>
          <label className="admin-label">{t("youtubeUrl")}</label>
          <input
            className="admin-input"
            type="text"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.youtubeUrl}
            onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">{t("youtubeUrlHint")}</p>
        </div>
        {Number.parseInt(form.order, 10) === 0 && (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.showHomeMessage}
              onChange={(e) => setForm({ ...form, showHomeMessage: e.target.checked })}
            />
            <span>
              <span className="block font-medium text-dark-blue">{t("showHomeMessage")}</span>
              <span className="mt-1 block text-xs text-gray-500">{t("showHomeMessageHint")}</span>
            </span>
          </label>
        )}
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || imageUploading}>
          {imageUploading ? tc("uploading") : saving ? t("loginLoading") : saved ? `${t("saved")} ✓` : tc("save")}
        </button>
      </form>
    </div>
  );
}
