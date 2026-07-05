import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  return request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.news.updateMany({
    where: {
      status: "DRAFT",
      publishedAt: { lte: now },
    },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json({ published: result.count });
}
