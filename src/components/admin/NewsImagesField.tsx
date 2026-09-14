"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { uploadFile } from "@/components/admin/ImageUploadField";

export type NewsGalleryImageDraft = {
  /** Server id when editing an existing row */
  id?: string;
  clientId: string;
  imageUrl: string;
  caption: string;
};

export function createNewsGalleryDraft(
  partial: Partial<NewsGalleryImageDraft> & { imageUrl: string }
): NewsGalleryImageDraft {
  return {
    id: partial.id,
    clientId: partial.clientId || crypto.randomUUID(),
    imageUrl: partial.imageUrl,
    caption: partial.caption || "",
  };
}

export function NewsImagesField({
  images,
  onChange,
  onUploadingChange,
}: {
  images: NewsGalleryImageDraft[];
  onChange: (images: NewsGalleryImageDraft[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function setBusy(busy: boolean) {
    setUploading(busy);
    onUploadingChange?.(busy);
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadError("");
    setBusy(true);
    try {
      const next = [...images];
      for (const file of Array.from(fileList)) {
        const url = await uploadFile(file);
        next.push(createNewsGalleryDraft({ imageUrl: url }));
      }
      onChange(next);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : tc("uploadFailed"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateCaption(clientId: string, caption: string) {
    onChange(
      images.map((img) => (img.clientId === clientId ? { ...img, caption } : img))
    );
  }

  function removeImage(clientId: string) {
    onChange(images.filter((img) => img.clientId !== clientId));
  }

  function moveImage(clientId: string, direction: -1 | 1) {
    const index = images.findIndex((img) => img.clientId === clientId);
    if (index < 0) return;
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="admin-label" htmlFor={inputId}>
          {t("additionalImages")}
        </label>
        <p className="mb-2 text-xs text-text-muted">{t("additionalImagesHint")}</p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          className="admin-input"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        {uploading && (
          <p className="mt-1 text-xs text-ukraine-blue">{t("uploadingImages")}</p>
        )}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-text-muted">{t("noAdditionalImages")}</p>
      ) : (
        <ul className="space-y-3">
          {images.map((img, index) => (
            <li
              key={img.clientId}
              className="flex flex-col gap-3 rounded border p-3 sm:flex-row sm:items-start"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  className="admin-input"
                  placeholder={t("imageCaption")}
                  value={img.caption}
                  onChange={(e) => updateCaption(img.clientId, e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="text-sm text-ukraine-blue hover:underline disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => moveImage(img.clientId, -1)}
                  >
                    ↑ {t("moveUp")}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-ukraine-blue hover:underline disabled:opacity-40"
                    disabled={index === images.length - 1}
                    onClick={() => moveImage(img.clientId, 1)}
                  >
                    ↓ {t("moveDown")}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => removeImage(img.clientId)}
                  >
                    {tc("delete")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
