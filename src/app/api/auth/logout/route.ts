import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { jsonOk } from "@/lib/api-utils";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return jsonOk({ success: true });
}
