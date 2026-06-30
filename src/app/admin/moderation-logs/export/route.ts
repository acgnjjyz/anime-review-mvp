import { ModerationTargetType, type Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function readTargetType(value: string | null) {
  if (value === ModerationTargetType.REVIEW || value === ModerationTargetType.COMMENT) {
    return value;
  }

  return "";
}

function buildWhere(query: string, targetType: "" | ModerationTargetType): Prisma.ModerationLogWhereInput | undefined {
  const filters: Prisma.ModerationLogWhereInput[] = [];

  if (targetType) {
    filters.push({ targetType });
  }

  if (query) {
    filters.push({
      OR: [
        { deletedBy: { email: { contains: query, mode: "insensitive" } } },
        { authorEmail: { contains: query, mode: "insensitive" } },
        { animeTitle: { contains: query, mode: "insensitive" } },
        { reason: { contains: query, mode: "insensitive" } },
        { targetTitle: { contains: query, mode: "insensitive" } },
        { targetBody: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  return filters.length > 0 ? { AND: filters } : undefined;
}

function escapeCsv(value: string | null | undefined) {
  const text = value ?? "";
  return `"${text.replaceAll('"', '""')}"`;
}

function formatDate(date: Date) {
  return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

export async function GET(request: NextRequest) {
  if (!hasDatabaseEnv()) {
    return new Response("Database settings are required.", { status: 503 });
  }

  const { isAdmin } = await getAdminAccess();

  if (!isAdmin) {
    return new Response("Forbidden", { status: 403 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const targetType = readTargetType(request.nextUrl.searchParams.get("targetType"));
  const where = buildWhere(query, targetType);

  const logs = await prisma.moderationLog.findMany({
    where,
    include: {
      deletedBy: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["日時", "対象種別", "作品名", "投稿者", "管理者", "削除理由", "削除前本文"],
    ...logs.map((log) => [
      formatDate(log.createdAt),
      log.targetType === ModerationTargetType.REVIEW ? "レビュー" : "コメント",
      log.animeTitle ?? "",
      log.authorEmail ?? log.authorName ?? "",
      log.deletedBy.email,
      log.reason,
      log.targetBody ?? "",
    ]),
  ];

  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="moderation-logs.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
