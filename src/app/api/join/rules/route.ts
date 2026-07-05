import { getJoinRules, getLocaleFromRequest } from "@/lib/settings";
import { jsonOk } from "@/lib/api-utils";
import { parseJsonArray } from "@/lib/uploads";

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const rules = await getJoinRules(locale);
  return jsonOk({
    ...rules,
    pdfUrls: parseJsonArray(rules.pdfUrls),
  });
}
