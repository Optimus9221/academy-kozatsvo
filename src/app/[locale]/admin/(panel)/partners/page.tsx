"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageUploadField } from "@/components/admin/AdminUtils";
import {
  LocaleTabs,
  buildTranslationPayload,
  type TranslationFormData,
} from "@/components/admin/LocaleTabs";
import type { Locale } from "@/i18n/locales";

interface Partner {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  order: number;
  translations?: Array<{
    locale: string;
    name: string;
    description: string;
  }>;
}

const emptyForm = {
  name: "",
  description: "",
  logoUrl: "",
  websiteUrl: "",
  order: "0",
};

function SortablePartnerRow({
  partner,
  onEdit,
  onDelete,
  deleteLabel,
}: {
  partner: Partner;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deleteLabel: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: partner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="w-10 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        ⠿
      </td>
      <td>
        <button
          type="button"
          onClick={() => onEdit(partner.id)}
          className="text-left text-ukraine-blue hover:underline"
        >
          {partner.name}
        </button>
      </td>
      <td>{partner.order}</td>
      <td>
        <button onClick={() => onDelete(partner.id)} className="text-red-600 hover:underline">
          {deleteLabel}
        </button>
      </td>
    </tr>
  );
}

export default function AdminPartnersPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [form, setForm] = useState(emptyForm);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function load() {
    fetch("/api/admin/partners").then((r) => r.json()).then(setPartners);
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
    const res = await fetch(`/api/admin/partners/${id}`);
    const p: Partner = await res.json();
    setEditingId(id);
    setShowForm(true);
    setForm({
      name: p.name || "",
      description: p.description || "",
      logoUrl: p.logoUrl || "",
      websiteUrl: p.websiteUrl || "",
      order: String(p.order ?? 0),
    });
    const tr: TranslationFormData = {};
    for (const item of p.translations || []) {
      tr[item.locale as Locale] = {
        name: item.name || "",
        description: item.description || "",
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
      await fetch(`/api/admin/partners/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/partners", {
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
    await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    load();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = partners.findIndex((p) => p.id === active.id);
    const newIndex = partners.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(partners, oldIndex, newIndex).map((p, index) => ({
      ...p,
      order: index,
    }));

    setPartners(reordered);

    await fetch("/api/admin/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "partner",
        items: reordered.map((p, index) => ({ id: p.id, order: index })),
      }),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-blue">{t("partners")}</h1>
        <button onClick={startCreate} className="admin-btn admin-btn-primary">
          + {tc("create")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-md">
          <h2 className="font-semibold text-dark-blue">
            {editingId ? tc("edit") : tc("create")}
          </h2>
          <input
            required
            placeholder={t("name")}
            className="admin-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            placeholder={t("description")}
            className="admin-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <LocaleTabs
            fields={[
              { key: "name", label: t("name") },
              { key: "description", label: t("description"), type: "textarea" },
            ]}
            values={translations}
            onChange={updateTranslation}
            baseValues={{ name: form.name, description: form.description }}
          />

          <ImageUploadField
            label={t("logo")}
            value={form.logoUrl}
            onChange={(url) => setForm({ ...form, logoUrl: url })}
          />
          <input
            placeholder={t("website")}
            className="admin-input"
            value={form.websiteUrl}
            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
          />
          <input
            placeholder={t("order")}
            className="admin-input"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th>{t("name")}</th>
                <th>{t("order")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={partners.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {partners.map((p) => (
                  <SortablePartnerRow
                    key={p.id}
                    partner={p}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                    deleteLabel={tc("delete")}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
