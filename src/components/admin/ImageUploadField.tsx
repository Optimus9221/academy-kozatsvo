"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export type ImageAspect = "video" | "photo" | "square" | "portrait" | "hero" | "logo";

export const IMAGE_ASPECT_RATIO: Record<ImageAspect, number> = {
  video: 16 / 9,
  photo: 4 / 3,
  square: 1,
  portrait: 3 / 4,
  hero: 21 / 9,
  logo: 1,
};

type CoverLayout = {
  scale: number;
  drawW: number;
  drawH: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function getCoverLayout(
  imgW: number,
  imgH: number,
  frameW: number,
  frameH: number
): CoverLayout {
  const scale = Math.max(frameW / imgW, frameH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  return {
    scale,
    drawW,
    drawH,
    minX: frameW - drawW,
    maxX: 0,
    minY: frameH - drawH,
    maxY: 0,
  };
}

function clamp(value: number, min: number, max: number) {
  if (min > max) return (min + max) / 2;
  return Math.min(max, Math.max(min, value));
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
  return img;
}

export async function cropImageToBlob(
  src: string,
  aspectRatio: number,
  offset: { x: number; y: number },
  frame: { width: number; height: number },
  outputWidth = 1600
): Promise<Blob> {
  const img = await loadImage(src);
  const layout = getCoverLayout(img.naturalWidth, img.naturalHeight, frame.width, frame.height);
  const x = clamp(offset.x, layout.minX, layout.maxX);
  const y = clamp(offset.y, layout.minY, layout.maxY);

  const sx = (-x) / layout.scale;
  const sy = (-y) / layout.scale;
  const sw = frame.width / layout.scale;
  const sh = frame.height / layout.scale;

  const outW = outputWidth;
  const outH = Math.round(outputWidth / aspectRatio);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );
  if (!blob) throw new Error("Crop failed");
  return blob;
}

export function ImageFrameEditor({
  src,
  aspectRatio,
  open,
  onClose,
  onApply,
}: {
  src: string;
  aspectRatio: number;
  open: boolean;
  onClose: () => void;
  onApply: (blob: Blob) => Promise<void>;
}) {
  const tc = useTranslations("common");
  const frameRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [frame, setFrame] = useState({ width: 360, height: 203 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadImage(src)
      .then((img) => {
        if (cancelled) return;
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      })
      .catch(() => {
        if (!cancelled) setError(tc("uploadFailed"));
      });
    return () => {
      cancelled = true;
    };
  }, [open, src, tc]);

  useEffect(() => {
    if (!open || !frameRef.current) return;
    const el = frameRef.current;
    const update = () => {
      const width = el.clientWidth;
      const height = Math.round(width / aspectRatio);
      setFrame({ width, height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, aspectRatio]);

  useEffect(() => {
    if (!natural.w || !frame.width) return;
    const layout = getCoverLayout(natural.w, natural.h, frame.width, frame.height);
    setOffset({
      x: (layout.minX + layout.maxX) / 2,
      y: (layout.minY + layout.maxY) / 2,
    });
  }, [natural, frame.width, frame.height]);

  const layout =
    natural.w > 0
      ? getCoverLayout(natural.w, natural.h, frame.width, frame.height)
      : null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!layout) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !layout) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({
      x: clamp(dragStart.current.ox + dx, layout.minX, layout.maxX),
      y: clamp(dragStart.current.oy + dy, layout.minY, layout.maxY),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  const centerImage = () => {
    if (!layout) return;
    setOffset({
      x: (layout.minX + layout.maxX) / 2,
      y: (layout.minY + layout.maxY) / 2,
    });
  };

  const handleApply = async () => {
    setApplying(true);
    setError("");
    try {
      const blob = await cropImageToBlob(src, aspectRatio, offset, frame);
      await onApply(blob);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : tc("uploadFailed"));
    } finally {
      setApplying(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4">
      <div
        className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={tc("imageFrameTitle")}
      >
        <h3 className="text-lg font-bold text-dark-blue">{tc("imageFrameTitle")}</h3>
        <p className="mt-1 text-sm text-text-muted">{tc("imageFrameHint")}</p>

        <div
          ref={frameRef}
          className={`relative mt-4 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-900 ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ aspectRatio: String(aspectRatio) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {layout && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none select-none"
              style={{
                width: layout.drawW,
                height: layout.drawH,
                left: offset.x,
                top: offset.y,
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-ukraine-yellow/80" />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="admin-btn" onClick={centerImage} disabled={applying}>
            {tc("imageCenter")}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => void handleApply()}
            disabled={applying || !layout}
          >
            {applying ? tc("uploading") : tc("imageApplyFrame")}
          </button>
          <button type="button" className="admin-btn" onClick={onClose} disabled={applying}>
            {tc("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  aspect = "video",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  aspect?: ImageAspect;
}) {
  const tc = useTranslations("common");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [revokeOnClose, setRevokeOnClose] = useState<string | null>(null);

  const aspectRatio = IMAGE_ASPECT_RATIO[aspect];

  const setBusy = useCallback(
    (busy: boolean) => {
      setUploading(busy);
      onUploadingChange?.(busy);
    },
    [onUploadingChange]
  );

  async function handleFileSelected(file: File) {
    setUploadError("");
    setSelectedName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setRevokeOnClose(objectUrl);
    setEditorSrc(objectUrl);
  }

  async function applyCrop(blob: Blob) {
    setBusy(true);
    setUploadError("");
    try {
      const file = new File([blob], `crop-${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = await uploadFile(file);
      onChange(url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : tc("uploadFailed"));
      throw error;
    } finally {
      setBusy(false);
    }
  }

  function closeEditor() {
    if (revokeOnClose) {
      URL.revokeObjectURL(revokeOnClose);
      setRevokeOnClose(null);
    }
    setEditorSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="admin-label" htmlFor={inputId}>
        {label}
      </label>

      {value && (
        <div className="mb-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          <div
            className="relative w-full max-w-md overflow-hidden bg-gray-200"
            style={{ aspectRatio: String(aspectRatio) }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-gray-200 bg-white p-2">
            <button
              type="button"
              className="admin-btn"
              disabled={uploading}
              onClick={() => {
                setRevokeOnClose(null);
                setEditorSrc(value);
              }}
            >
              {tc("imageAdjustFrame")}
            </button>
          </div>
        </div>
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

      {editorSrc && (
        <ImageFrameEditor
          src={editorSrc}
          aspectRatio={aspectRatio}
          open={Boolean(editorSrc)}
          onClose={closeEditor}
          onApply={applyCrop}
        />
      )}
    </div>
  );
}
