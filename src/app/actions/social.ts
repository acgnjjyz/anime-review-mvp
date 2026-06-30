"use server";

import { ReportStatus, ReportTargetType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminAccess } from "@/lib/admin";
import { getSyncedCurrentUser } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

function requireText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function redirectWithMessage(path: string, key: "error" | "message", value: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
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

function readReportStatus(value: FormDataEntryValue | null) {
  const status = requireText(value);

  if (
    status === ReportStatus.PENDING ||
    status === ReportStatus.RESOLVED ||
    status === ReportStatus.REJECTED
  ) {
    return status;
  }

  redirectWithMessage("/admin/reports", "error", "通報ステータスが正しくありません。");
}

export async function toggleReviewLike(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "データベース接続の設定が必要です。");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "レビューにいいねするにはログインしてください。");
  }

  const reviewId = requireText(formData.get("reviewId"));

  if (!reviewId) {
    redirectWithMessage("/anime", "error", "いいねするレビュー情報が不足しています。");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      anime: { select: { slug: true, isPublished: true } },
    },
  });

  if (!review || !review.anime.isPublished) {
    redirectWithMessage("/anime", "error", "レビューが見つかりません。");
  }

  const current = await prisma.reviewLike.findUnique({
    where: {
      reviewId_userId: {
        reviewId,
        userId: user.id,
      },
    },
  });

  if (current) {
    await prisma.reviewLike.delete({ where: { id: current.id } });
  } else {
    await prisma.reviewLike.create({
      data: {
        reviewId,
        userId: user.id,
      },
    });
  }

  revalidatePath(`/anime/${review.anime.slug}`);
  redirectWithMessage(`/anime/${review.anime.slug}`, "message", current ? "いいねを解除しました。" : "レビューにいいねしました。");
}

export async function createReport(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "データベース接続の設定が必要です。");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "通報するにはログインしてください。");
  }

  const targetTypeText = requireText(formData.get("targetType"));
  const targetId = requireText(formData.get("targetId"));
  const selectedReason = requireText(formData.get("selectedReason"));
  const customReason = requireText(formData.get("customReason"));
  const reason = customReason || selectedReason;

  if (!reason) {
    redirectWithMessage("/anime", "error", "通報理由を入力してください。");
  }

  if (reason.length > 500) {
    redirectWithMessage("/anime", "error", "通報理由は500文字以内で入力してください。");
  }

  if (targetTypeText === ReportTargetType.REVIEW) {
    const review = await prisma.review.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        anime: { select: { slug: true, isPublished: true } },
      },
    });

    if (!review || !review.anime.isPublished) {
      redirectWithMessage("/anime", "error", "通報するレビューが見つかりません。");
    }

    const current = await prisma.report.findUnique({
      where: {
        reviewId_reporterId: {
          reviewId: review.id,
          reporterId: user.id,
        },
      },
    });

    if (current) {
      redirectWithMessage(`/anime/${review.anime.slug}`, "error", "このレビューはすでに通報済みです。");
    }

    await prisma.report.create({
      data: {
        targetType: ReportTargetType.REVIEW,
        reviewId: review.id,
        reporterId: user.id,
        reason,
      },
    });

    revalidatePath("/admin/reports");
    revalidatePath(`/anime/${review.anime.slug}`);
    redirectWithMessage(`/anime/${review.anime.slug}`, "message", "レビューを通報しました。");
  }

  if (targetTypeText === ReportTargetType.COMMENT) {
    const comment = await prisma.comment.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        anime: { select: { slug: true, isPublished: true } },
      },
    });

    if (!comment || !comment.anime.isPublished) {
      redirectWithMessage("/anime", "error", "通報するコメントが見つかりません。");
    }

    const current = await prisma.report.findUnique({
      where: {
        commentId_reporterId: {
          commentId: comment.id,
          reporterId: user.id,
        },
      },
    });

    if (current) {
      redirectWithMessage(`/anime/${comment.anime.slug}`, "error", "このコメントはすでに通報済みです。");
    }

    await prisma.report.create({
      data: {
        targetType: ReportTargetType.COMMENT,
        commentId: comment.id,
        reporterId: user.id,
        reason,
      },
    });

    revalidatePath("/admin/reports");
    revalidatePath(`/anime/${comment.anime.slug}`);
    redirectWithMessage(`/anime/${comment.anime.slug}`, "message", "コメントを通報しました。");
  }

  redirectWithMessage("/anime", "error", "通報対象が正しくありません。");
}

export async function updateReportStatus(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/reports", "error", "データベース接続の設定が必要です。");
  }

  const admin = await requireAdmin();
  const reportId = requireText(formData.get("reportId"));
  const status = readReportStatus(formData.get("status"));

  if (!reportId) {
    redirectWithMessage("/admin/reports", "error", "更新する通報情報が不足しています。");
  }

  try {
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        resolvedById: status === ReportStatus.PENDING ? null : admin.id,
      },
    });
  } catch {
    redirectWithMessage("/admin/reports", "error", "通報ステータスの更新に失敗しました。");
  }

  revalidatePath("/admin/reports");
  redirectWithMessage("/admin/reports", "message", "通報ステータスを更新しました。");
}
