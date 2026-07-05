import fs from "fs";
import path from "path";
import { cache } from "react";
import mammoth from "mammoth";

export const STATUTE_DOCX_PATH = path.join(
  process.cwd(),
  "public",
  "documents",
  "statut-mak.docx"
);

export const STATUTE_DOWNLOAD_URL = "/documents/statut-mak.docx";

export const getStatuteHtml = cache(async (): Promise<string> => {
  if (!fs.existsSync(STATUTE_DOCX_PATH)) {
    throw new Error("Statute document not found");
  }

  const result = await mammoth.convertToHtml({ path: STATUTE_DOCX_PATH });
  return result.value;
});
