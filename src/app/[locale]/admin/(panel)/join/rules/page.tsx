"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LocaleTabs,
  buildTranslationPayload,
  type TranslationFormData,
} from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Locale } from "@/i18n/locales";

export default function AdminJoinRulesPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [contentHtml, setContentHtml] = useState("");
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/join/rules")
      .then((r) => r.json())
      .then((d) => {
        setContentHtml(d.contentHtml || "");
        const tr: TranslationFormData = {};
        for (const item of d.translations || []) {
          tr[item.locale as Locale] = { contentHtml: item.contentHtml || "" };
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
    await fetch("/api/admin/join/rules", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentHtml,
        pdfUrls: [],
        translations: buildTranslationPayload(translations),
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-blue">{t("joinRules")}</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <label className="admin-label">{t("body")} (HTML)</label>
          <RichTextEditor value={contentHtml} onChange={setContentHtml} minHeight="400px" />
        </div>

        <LocaleTabs
          fields={[{ key: "contentHtml", label: t("body"), type: "html" }]}
          values={translations}
          onChange={updateTranslation}
          baseValues={{ contentHtml }}
        />

        <button type="submit" className="admin-btn admin-btn-primary">
          {saved ? `${t("saved")} ✓` : tc("save")}
        </button>
      </form>
    </div>
  );
}
