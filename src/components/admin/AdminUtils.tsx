"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const APPLICATION_STATUSES = ["NEW", "IN_PROGRESS", "APPROVED", "REJECTED"] as const;

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) throw new Error(data.error || "Upload failed");
  if (!data.url) throw new Error("Upload failed");
  return data.url;
}

export function useAdminImageUpload() {
  const [uploading, setUploading] = useState(false);
  return {
    uploading,
    uploadFieldProps: { onUploadingChange: setUploading },
  };
}

export function ImageUploadField({
  label,
  value,
  onChange,
  onUploadingChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const tc = useTranslations("common");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedName, setSelectedName] = useState("");

  async function handleFileSelected(file: File) {
    setUploadError("");
    setSelectedName(file.name);
    setUploading(true);
    onUploadingChange?.(true);

    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : tc("uploadFailed"));
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="admin-label" htmlFor={inputId}>
        {label}
      </label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mb-2 h-24 rounded object-cover" />
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFileSelected(file);
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="admin-btn shrink-0"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? tc("uploading") : tc("chooseFile")}
        </button>
        <span className="text-sm text-text-muted">
          {uploading ? tc("uploading") : selectedName || tc("noFileChosen")}
        </span>
      </div>
      {uploadError && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {uploadError}
        </p>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={tc("orUrl")}
        className="admin-input mt-2"
        disabled={uploading}
      />
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tStatus = useTranslations("status");
  const tAdmin = useTranslations("admin");

  function getLabel(value: string): string {
    if (APPLICATION_STATUSES.includes(value as (typeof APPLICATION_STATUSES)[number])) {
      return tStatus(value as (typeof APPLICATION_STATUSES)[number]);
    }

    const adminLabels: Record<string, string> = {
      DRAFT: tAdmin("draft"),
      PUBLISHED: tAdmin("published"),
      HIDDEN: tAdmin("hidden"),
      UPCOMING: tAdmin("eventUpcoming"),
      PAST: tAdmin("eventPast"),
      CANCELLED: tAdmin("eventCancelled"),
    };

    return adminLabels[value] || value;
  }

  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PUBLISHED: "bg-green-100 text-green-700",
    HIDDEN: "bg-yellow-100 text-yellow-700",
    NEW: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    UPCOMING: "bg-green-100 text-green-700",
    PAST: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100"}`}
    >
      {getLabel(status)}
    </span>
  );
}

export const applicationStatuses = APPLICATION_STATUSES;
