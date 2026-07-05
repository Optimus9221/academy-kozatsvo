import { getSession } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Не авторизовано", 401);
    return jsonOk({ user: session });
  } catch (error) {
    return handleApiError(error);
  }
}
