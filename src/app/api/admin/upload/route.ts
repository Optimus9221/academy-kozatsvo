import { requireSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { saveUpload } from "@/lib/uploads";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageContent(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return jsonError("Файл не обрано");
    }

    const url = await saveUpload(file);
    return jsonOk({ url }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
