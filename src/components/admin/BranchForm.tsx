"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ImageUploadField } from "@/components/admin/AdminUtils";
import {
  LocaleTabs,
  buildTranslationPayload,
  type TranslationFormData,
} from "@/components/admin/LocaleTabs";
import type { Locale } from "@/i18n/locales";
import { UKRAINE_REGIONS } from "@/lib/api-utils";

export function BranchForm({
  type,
  basePath,
  editId,
}: {
  type: "UKRAINE" | "INTERNATIONAL";
  basePath: string;
  editId?: string;
}) {
  const router = useRouter();
  const t = useTranslations("admin");
  const tb = useTranslations("branches");
  const tj = useTranslations("join");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(!!editId);
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [form, setForm] = useState({
    name: "",
    city: "",
    region: "",
    country: "",
    headName: "",
    phone: "",
    email: "",
    address: "",
    photoUrl: "",
    latitude: "",
    longitude: "",
    order: "0",
  });

  useEffect(() => {
    if (!editId) return;
    fetch(`/api/admin/branches?type=${type.toLowerCase()}`)
      .then((r) => r.json())
      .then((branches) => {
        const b = branches.find((x: { id: string }) => x.id === editId);
        if (!b) return;
        setForm({
          name: b.name || "",
          city: b.city || "",
          region: b.region || "",
          country: b.country || "",
          headName: b.headName || "",
          phone: b.phone || "",
          email: b.email || "",
          address: b.address || "",
          photoUrl: b.photoUrl || "",
          latitude: b.latitude != null ? String(b.latitude) : "",
          longitude: b.longitude != null ? String(b.longitude) : "",
          order: String(b.order ?? 0),
        });
        const tr: TranslationFormData = {};
        for (const item of b.translations || []) {
          tr[item.locale as Locale] = {
            name: item.name || "",
            headName: item.headName || "",
            address: item.address || "",
          };
        }
        setTranslations(tr);
      })
      .finally(() => setLoading(false));
  }, [editId, type]);

  function updateTranslation(locale: Locale, key: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      type,
      order: parseInt(form.order, 10),
      translations: buildTranslationPayload(translations),
    };
    const url = editId ? `/api/admin/branches/${editId}` : "/api/admin/branches";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) router.push(basePath);
  }

  if (loading) return <p>{tc("loading")}</p>;

  return (
    <div>
      <Link href={basePath} className="text-sm text-ukraine-blue hover:underline">
        ← {tc("back")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">
        {editId ? tc("edit") : t("newBranch")}
      </h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <label className="admin-label">{t("name")}</label>
          <input required className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">{tj("city")}</label>
          <input required className="admin-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        {type === "UKRAINE" ? (
          <div>
            <label className="admin-label">{tb("filterRegion")}</label>
            <select className="admin-input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              <option value="">{tc("select")}</option>
              {UKRAINE_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="admin-label">{tj("country")}</label>
            <input required className="admin-input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
        )}
        <div>
          <label className="admin-label">{tb("head")}</label>
          <input required className="admin-input" value={form.headName} onChange={(e) => setForm({ ...form, headName: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">{tj("phone")}</label>
            <input className="admin-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="admin-label">{tj("email")}</label>
            <input className="admin-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="admin-label">{t("address")}</label>
          <input className="admin-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">{t("latitude")}</label>
            <input type="number" step="any" className="admin-input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="50.4501" />
          </div>
          <div>
            <label className="admin-label">{t("longitude")}</label>
            <input type="number" step="any" className="admin-input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="30.5234" />
          </div>
        </div>

        <LocaleTabs
          fields={[
            { key: "name", label: t("name") },
            { key: "headName", label: tb("head") },
            { key: "address", label: t("address") },
          ]}
          values={translations}
          onChange={updateTranslation}
          baseValues={{
            name: form.name,
            headName: form.headName,
            address: form.address,
          }}
        />

        <ImageUploadField label={t("mainImage")} value={form.photoUrl} onChange={(url) => setForm({ ...form, photoUrl: url })} />
        <button type="submit" className="admin-btn admin-btn-primary">{tc("save")}</button>
      </form>
    </div>
  );
}
