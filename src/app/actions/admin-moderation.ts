"use server";

import { ModerationTargetType, ReportStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

function requireText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function redirectWithMessage(path: string, key: "error" | "message", value: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

function readReturnPath(value: FormDataEntryValue | null, fallback: string) {
  return requireText(value) === "reports" ? "/admin/reports" : fallback;
}

async function requireAdmin() {
  const { user, isAdmin } = await getAdminAccess();

  if (!user) {
    redirectWithMessage("/login", "message", "管理画面にはログインが必要です。");
  }

  if (!isAdmin) {
    redirectWithMessage("/admin", "error", "管理者権限が必要です。");
  }
  return user;
}

export async function deleteAdminReview(formData: FormData) {
  const returnPath = readReturnPath(formData.get("source"), "/admin/reviews");

  if (!hasDatabaseEnv()) {
    redirectWithMessage(returnPath, "error", "データベース接続の設定が必要です。");
  }

  const admin = await requireAdmin();

  const reviewId = requireText(formData.get("reviewId"));
  const reason = requireText(formData.get("reason"));

  if (!reviewId) {
    redirectWithMessage(returnPath, "error", "削除するレビュー情報が不足しています。");
  }

  if (!reason) {
    redirectWithMessage(returnPath, "error", "削除理由を入力してください。");
  }

  let review:
    | {
        id: string;
        animeId: string;
        userId: string;
        title: string;
        body: string;
        anime: { slug: string; title: string };
        user: { email: string; name: string | null };
      }
    | null = null;

  try {
    review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        animeId: true,
        userId: true,
        title: true,
        body: true,
        anime: { select: { slug: true, title: true } },
        user: { select: { email: true, name: true } },
      },
    });
  } catch {
    redirectWithMessage(returnPath, "error", "データベースに接続できません。");
  }

  if (!review) {
    redirectWithMessage(returnPath, "error", "削除するレビューが見つかりません。");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.moderationLog.create({
        data: {
          targetType: ModerationTargetType.REVIEW,
          targetId: review.id,
          animeId: review.animeId,
          animeTitle: review.anime.title,
          authorId: review.userId,
          authorEmail: review.user.email,
          authorName: review.user.name,
          targetTitle: review.title,
          targetBody: review.body,
          reason,
          deletedById: admin.id,
        },
      });

      await tx.report.updateMany({
        where: { reviewId: review.id },
        data: { status: ReportStatus.RESOLVED, resolvedById: admin.id },
      });

      await tx.review.deleteMany({ where: { id: review.id } });
      await tx.rating.deleteMany({
        where: {
          animeId: review.animeId,
          userId: review.userId,
        },
      });
    });
  } catch {
    redirectWithMessage(
      returnPath,
      "error",
      "レビューの削除に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  revalidatePath("/");
  revalidatePath("/anime");
  revalidatePath("/ranking");
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/moderation-logs");
  revalidatePath(`/anime/${review.anime.slug}`);
  redirectWithMessage(returnPath, "message", "レビューを削除しました。");
}

export async function deleteAdminComment(formData: FormData) {
  const returnPath = readReturnPath(formData.get("source"), "/admin/comments");

  if (!hasDatabaseEnv()) {
    redirectWithMessage(returnPath, "error", "データベース接続の設定が必要です。");
  }

  const admin = await requireAdmin();

  const commentId = requireText(formData.get("commentId"));
  const reason = requireText(formData.get("reason"));

  if (!commentId) {
    redirectWithMessage(returnPath, "error", "削除するコメント情報が不足しています。");
  }

  if (!reason) {
    redirectWithMessage(returnPath, "error", "削除理由を入力してください。");
  }

  let comment:
    | {
        id: string;
        animeId: string;
        userId: string;
        body: string;
        anime: { slug: string; title: string };
        user: { email: string; name: string | null };
      }
    | null = null;

  try {
    comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        animeId: true,
        userId: true,
        body: true,
        anime: { select: { slug: true, title: true } },
        user: { select: { email: true, name: true } },
      },
    });
  } catch {
    redirectWithMessage(returnPath, "error", "データベースに接続できません。");
  }

  if (!comment) {
    redirectWithMessage(returnPath, "error", "削除するコメントが見つかりません。");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.moderationLog.create({
        data: {
          targetType: ModerationTargetType.COMMENT,
          targetId: comment.id,
          animeId: comment.animeId,
          animeTitle: comment.anime.title,
          authorId: comment.userId,
          authorEmail: comment.user.email,
          authorName: comment.user.name,
          targetBody: comment.body,
          reason,
          deletedById: admin.id,
        },
      });

      await tx.report.updateMany({
        where: { commentId: comment.id },
        data: { status: ReportStatus.RESOLVED, resolvedById: admin.id },
      });

      await tx.comment.deleteMany({ where: { id: comment.id } });
    });
  } catch {
    redirectWithMessage(
      returnPath,
      "error",
      "コメントの削除に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/comments");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/moderation-logs");
  revalidatePath(`/anime/${comment.anime.slug}`);
  redirectWithMessage(returnPath, "message", "コメントを削除しました。");
}
