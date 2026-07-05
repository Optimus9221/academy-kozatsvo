import { getSiteSettings, getLocaleFromRequest } from "@/lib/settings";
import { jsonOk } from "@/lib/api-utils";

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const settings = await getSiteSettings(locale);
  return jsonOk(settings);
}
