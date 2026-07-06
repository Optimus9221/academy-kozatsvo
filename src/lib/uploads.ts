import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

const MAGIC: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

function matchesMagic(buffer: Buffer, mime: string): boolean {
  const patterns = MAGIC[mime];
  if (!patterns) return false;
  return patterns.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

function resolveMimeType(file: File): string | null {
  if (file.type && ALLOWED_MIME[file.type]) {
    return file.type;
  }

  const ext = path.extname(file.name).toLowerCase();
  return EXT_TO_MIME[ext] ?? null;
}

export async function saveUpload(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const mimeType = resolveMimeType(file);
  const ext = mimeType ? ALLOWED_MIME[mimeType] : undefined;
  if (!mimeType || !ext) {
    throw new Error("INVALID_FILE_TYPE");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesMagic(buffer, mimeType)) {
    throw new Error("INVALID_FILE_TYPE");
  }

  const filename = `${randomUUID()}${ext}`;

  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_NOT_CONFIGURED");
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, buffer, {
      access: "public",
      contentType: mimeType,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseSocialLinks(value: string): Record<string, string> {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
