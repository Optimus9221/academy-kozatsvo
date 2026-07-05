import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { canManageApplications } from "@/lib/permissions";
import { handleApiError, jsonError, jsonOk } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (!canManageApplications(session.role)) {
      return jsonError("Доступ заборонено", 403);
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
      const header = "ID,ПІБ,Телефон,Email,Місто,Країна,Статус,Дата\n";
      const rows = applications
        .map(
          (a) =>
            `"${a.id}","${a.fullName}","${a.phone}","${a.email}","${a.city}","${a.country}","${a.status}","${a.createdAt.toISOString()}"`
        )
        .join("\n");

      return new Response("\uFEFF" + header + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="applications.csv"',
        },
      });
    }

    return jsonOk(applications);
  } catch (error) {
    return handleApiError(error);
  }
}
