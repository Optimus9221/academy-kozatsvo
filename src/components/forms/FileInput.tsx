"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export function FileInput({
  id,
  accept,
  className = "",
}: {
  id?: string;
  accept?: string;
  className?: string;
}) {
  const t = useTranslations("common");
  const autoId = useId();
  const inputId = id || autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="admin-btn shrink-0"
        >
          {t("chooseFile")}
        </button>
        <span className="text-sm text-text-muted">
          {fileName || t("noFileChosen")}
        </span>
      </div>
    </div>
  );
}
