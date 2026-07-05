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

interface FaqItem {
  id: string;
  question: string;
  answerHtml: string;
  order: number;
  translations?: Array<{ locale: string; question: string; answerHtml: string }>;
}

const emptyForm = { question: "", answerHtml: "", order: "0" };

export default function AdminFaqPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [items, setItems] = useState<FaqItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [form, setForm] = useState(emptyForm);

  function load() {
    fetch("/api/admin/faq").then((r) => r.json()).then(setItems);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setTranslations({});
    setEditingId(null);
    setShowForm(false);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  async function startEdit(id: string) {
    const res = await fetch(`/api/admin/faq/${id}`);
    const item: FaqItem = await res.json();
    setEditingId(id);
    setShowForm(true);
    setForm({
      question: item.question || "",
      answerHtml: item.answerHtml || "",
      order: String(item.order ?? 0),
    });
    const tr: TranslationFormData = {};
    for (const row of item.translations || []) {
      tr[row.locale as Locale] = {
        question: row.question || "",
        answerHtml: row.answerHtml || "",
      };
    }
    setTranslations(tr);
  }

  function updateTranslation(locale: Locale, key: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      order: parseInt(form.order, 10),
      translations: buildTranslationPayload(translations),
    };

    if (editingId) {
      await fetch(`/api/admin/faq/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">{t("faq")}</h1>
        <button onClick={startCreate} className="admin-btn admin-btn-primary">
          + {tc("create")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4 rounded-xl bg-white p-6 shadow-md">
          <h2 className="font-semibold text-dark-blue">
            {editingId ? tc("edit") : tc("create")}
          </h2>
          <div>
            <label className="admin-label">{t("question")} *</label>
            <input
              required
              className="admin-input"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">{t("answer")}</label>
            <RichTextEditor
              value={form.answerHtml}
              onChange={(v) => setForm({ ...form, answerHtml: v })}
              minHeight="200px"
            />
          </div>

          <LocaleTabs
            fields={[
              { key: "question", label: t("question") },
              { key: "answerHtml", label: t("answer"), type: "html" },
            ]}
            values={translations}
            onChange={updateTranslation}
            baseValues={{ question: form.question, answerHtml: form.answerHtml }}
          />

          <div>
            <label className="admin-label">{t("order")}</label>
            <input
              className="admin-input"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="admin-btn admin-btn-primary">
              {tc("save")}
            </button>
            <button type="button" onClick={resetForm} className="admin-btn">
              {tc("close")}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-md">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("question")}</th>
              <th>{t("order")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <button
                    type="button"
                    onClick={() => startEdit(item.id)}
                    className="text-left text-ukraine-blue hover:underline"
                  >
                    {item.question}
                  </button>
                </td>
                <td>{item.order}</td>
                <td>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">
                    {tc("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
