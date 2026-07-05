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

const PDF_EMBED_HTML = `<div class="statute-pdf-viewer">
<iframe src="${STATUTE_DEMO_PDF_URL}" title="Статут МАК" class="h-[80vh] w-full rounded-lg border border-gray-200" loading="lazy"></iframe>
<p class="mt-4 text-sm text-text-muted">
<a href="${STATUTE_DEMO_PDF_URL}" target="_blank" rel="noopener noreferrer" class="text-ukraine-blue hover:underline">Відкрити статут у новій вкладці (PDF)</a>
</p>
</div>`;

const DEMO_FALLBACK_HTML = `<div class="statute-fallback">
<p>Текстова версія статуту тимчасово недоступна. Перегляньте PDF нижче.</p>
${PDF_EMBED_HTML}
</div>`;

export function getStatuteDownloadUrl(): string {
  return fs.existsSync(STATUTE_DOCX_PATH) ? STATUTE_DOWNLOAD_URL : STATUTE_DEMO_PDF_URL;
}

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
