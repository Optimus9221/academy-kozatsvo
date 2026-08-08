import { getSession } from "@/lib/auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Не авторизовано", 401);

    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { totpEnabled: true },
    });

    return jsonOk({
      user: {
        ...session,
        totpEnabled: Boolean(dbUser?.totpEnabled),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
