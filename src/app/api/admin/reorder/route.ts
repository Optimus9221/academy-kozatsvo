import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";

const bodySchema = z.object({
  type: z.enum(["partner", "leader", "branch"]),
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageContent(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const body = bodySchema.parse(await request.json());

    const updates = body.items.map((item) => {
      switch (body.type) {
        case "partner":
          return prisma.partner.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        case "leader":
          return prisma.leader.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        case "branch":
          return prisma.branch.update({
            where: { id: item.id },
            data: { order: item.order },
          });
      }
    });

    await prisma.$transaction(updates);

    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
