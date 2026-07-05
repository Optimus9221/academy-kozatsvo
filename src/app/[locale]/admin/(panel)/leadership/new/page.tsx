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
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Locale } from "@/i18n/locales";

export default function AdminLeaderNewPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const tc = useTranslations("common");
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

  function updateTranslation(locale: Locale, key: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/leadership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        order: parseInt(form.order, 10),
        showHomeMessage: form.showHomeMessage,
        videos: form.youtubeUrl ? [{ youtubeUrl: form.youtubeUrl }] : [],
        translations: buildTranslationPayload(translations),
      }),
    });
    if (res.ok) router.push("/admin/leadership");
  }

  return (
    <div>
      <Link href="/admin/leadership" className="text-sm text-ukraine-blue hover:underline">
        ← {tc("back")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t("newLeader")}</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-md">
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

        <ImageUploadField label={t("mainImage")} value={form.photoUrl} onChange={(url) => setForm({ ...form, photoUrl: url })} />
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
        {parseInt(form.order, 10) === 0 && (
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
        <button type="submit" className="admin-btn admin-btn-primary">{tc("save")}</button>
      </form>
    </div>
  );
}
