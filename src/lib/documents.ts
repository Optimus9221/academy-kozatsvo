import fs from "fs";
import path from "path";
import { unstable_cache } from "next/cache";
import mammoth from "mammoth";

export const STATUTE_DOCX_PATH = path.join(
  process.cwd(),
  "public",
  "documents",
  "statut-mak.docx"
);

export const STATUTE_DOWNLOAD_URL = "/documents/statut-mak.docx";
export const STATUTE_DEMO_PDF_URL = "/documents/statut-mak-demo.pdf";

const DEMO_FALLBACK_HTML = `<div class="statute-fallback">
<p>Текстова версія статуту тимчасово недоступна. Завантажте демонстраційну PDF-версію документа.</p>
<p><a href="${STATUTE_DEMO_PDF_URL}" target="_blank" rel="noopener noreferrer">Відкрити статут (PDF)</a></p>
</div>`;

async function loadStatuteHtml(): Promise<string> {
  if (!fs.existsSync(STATUTE_DOCX_PATH)) {
    return DEMO_FALLBACK_HTML;
  }

  const result = await mammoth.convertToHtml({ path: STATUTE_DOCX_PATH });
  return result.value;
}

export const getStatuteHtml = unstable_cache(loadStatuteHtml, ["statute-html"], {
  revalidate: 3600,
  tags: ["statute"],
});
