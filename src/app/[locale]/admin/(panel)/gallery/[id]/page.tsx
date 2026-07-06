"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ImageUploadField } from "@/components/admin/AdminUtils";
import { getYoutubeThumbnail } from "@/lib/api-utils";
import {
  LocaleTabs,
  buildTranslationPayload,
  type TranslationFormData,
} from "@/components/admin/LocaleTabs";
import type { Locale } from "@/i18n/locales";

interface GalleryItem {
  id: string;
  type: "PHOTO" | "VIDEO";
  imageUrl?: string;
  youtubeUrl?: string;
  title?: string;
  caption?: string;
}

export default function AdminGalleryEditPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [album, setAlbum] = useState<{
    title: string;
    slug: string;
    description: string;
    coverImageUrl: string;
    items: GalleryItem[];
  } | null>(null);
  const [translations, setTranslations] = useState<TranslationFormData>({});
  const [newItem, setNewItem] = useState({ type: "PHOTO", imageUrl: "", youtubeUrl: "", title: "", caption: "" });

  const load = useCallback(() => {
    fetch(`/api/admin/gallery/albums/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAlbum({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          coverImageUrl: data.coverImageUrl || "",
          items: data.items || [],
        });
        const tr: TranslationFormData = {};
        for (const item of data.translations || []) {
          tr[item.locale as Locale] = {
            title: item.title || "",
            description: item.description || "",
          };
        }
        setTranslations(tr);
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function updateTranslation(locale: Locale, key: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  async function saveAlbum(e: React.FormEvent) {
    e.preventDefault();
    if (!album) return;
    await fetch(`/api/admin/gallery/albums/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...album,
        translations: buildTranslationPayload(translations),
      }),
    });
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/gallery/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, albumId: id }),
    });
    setNewItem({ type: "PHOTO", imageUrl: "", youtubeUrl: "", title: "", caption: "" });
    load();
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/admin/gallery/items/${itemId}`, { method: "DELETE" });
    load();
  }

  if (!album) return <p>{tc("loading")}</p>;

  return (
    <div>
      <Link href="/admin/gallery" className="text-sm text-ukraine-blue hover:underline">
        ← {tc("back")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t("editAlbum")}: {album.title}</h1>

      <form onSubmit={saveAlbum} className="mt-6 max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <label className="admin-label">{t("title")}</label>
          <input className="admin-input" value={album.title} onChange={(e) => setAlbum({ ...album, title: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">{t("slug")}</label>
          <input className="admin-input" value={album.slug} onChange={(e) => setAlbum({ ...album, slug: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">{t("description")}</label>
          <textarea className="admin-input" rows={3} value={album.description} onChange={(e) => setAlbum({ ...album, description: e.target.value })} />
        </div>

        <LocaleTabs
          fields={[
            { key: "title", label: t("title") },
            { key: "description", label: t("description"), type: "textarea" },
          ]}
          values={translations}
          onChange={updateTranslation}
          baseValues={{ title: album.title, description: album.description }}
        />

        <ImageUploadField label={t("cover")} value={album.coverImageUrl} onChange={(url) => setAlbum({ ...album, coverImageUrl: url })} />
        <button type="submit" className="admin-btn admin-btn-primary">{tc("save")}</button>
      </form>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-md">
        <h2 className="font-bold">{tc("elements")} ({album.items.length})</h2>
        <div className="mt-4 space-y-2">
          {album.items.map((item) => {
            const thumb =
              item.type === "PHOTO"
                ? item.imageUrl
                : item.youtubeUrl
                  ? getYoutubeThumbnail(item.youtubeUrl)
                  : null;
            const label =
              item.title || item.caption || item.youtubeUrl || item.imageUrl || item.type;

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded border p-3"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={label}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
                      {item.type === "VIDEO" ? "▶️" : "🖼️"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dark-blue">
                    {item.title || item.caption || label}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {item.type}
                    {item.imageUrl ? ` · ${item.imageUrl}` : item.youtubeUrl ? ` · ${item.youtubeUrl}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  className="shrink-0 text-sm text-red-600 hover:underline"
                >
                  {tc("delete")}
                </button>
              </div>
            );
          })}
        </div>

        <form onSubmit={addItem} className="mt-6 space-y-3 border-t pt-6">
          <h3 className="font-medium">{tc("create")}</h3>
          <select className="admin-input" value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as "PHOTO" | "VIDEO" })}>
            <option value="PHOTO">PHOTO</option>
            <option value="VIDEO">VIDEO</option>
          </select>
          {newItem.type === "PHOTO" ? (
            <ImageUploadField label={t("mainImage")} value={newItem.imageUrl} onChange={(url) => setNewItem({ ...newItem, imageUrl: url })} />
          ) : (
            <input className="admin-input" placeholder="YouTube URL" value={newItem.youtubeUrl} onChange={(e) => setNewItem({ ...newItem, youtubeUrl: e.target.value })} />
          )}
          <input className="admin-input" placeholder={t("title")} value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
          <button type="submit" className="admin-btn admin-btn-primary">{tc("create")}</button>
        </form>
      </div>
    </div>
  );
}
