"use client";

import { useTranslations } from "next-intl";

const APPLICATION_STATUSES = ["NEW", "IN_PROGRESS", "APPROVED", "REJECTED"] as const;

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const tc = useTranslations("common");

  return (
    <div>
      <label className="admin-label">{label}</label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mb-2 h-24 rounded object-cover" />
      )}
      <input
        type="file"
        accept="image/*"
        className="admin-input"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = await uploadFile(file);
            onChange(url);
          }
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={tc("orUrl")}
        className="admin-input mt-2"
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
