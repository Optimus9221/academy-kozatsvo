import { prisma } from "@/lib/db";

export async function logAudit(data: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({ data });
  } catch (error) {
    console.error("[audit]", error);
  }
}
