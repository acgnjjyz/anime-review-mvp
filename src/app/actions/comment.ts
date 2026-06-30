"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSyncedCurrentUser } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

function requireText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function redirectWithMessage(path: string, key: "error" | "message", value: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

async function findAnimeSlug(animeId: string) {
  try {
    return await prisma.anime.findUnique({
      where: { id: animeId },
      select: { slug: true, isPublished: true },
    });
  } catch {
    redirectWithMessage("/anime", "error", "データベースに接続できません。DATABASE_URLを確認してください。");
  }
}

export async function createComment(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "データベース接続の設定が必要です。READMEを確認してください。");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "コメント投稿にはログインが必要です。");
  }

  const animeId = requireText(formData.get("animeId"));
  const body = requireText(formData.get("body"));

  if (!animeId) {
    redirectWithMessage("/anime", "error", "コメントする作品情報が不足しています。");
  }

  const anime = await findAnimeSlug(animeId);

  if (!anime) {
    redirectWithMessage("/anime", "error", "作品が見つかりません。");
  }

  if (!anime.isPublished) {
    redirectWithMessage("/anime", "error", "非公開作品にはコメントを投稿できません。");
  }

  if (!body) {
    redirectWithMessage(`/anime/${anime.slug}`, "error", "コメント本文を入力してください。");
  }

  if (body.length > 1000) {
    redirectWithMessage(`/anime/${anime.slug}`, "error", "コメントは1000文字以内で入力してください。");
  }

  try {
    await prisma.comment.create({
      data: {
        animeId,
        userId: user.id,
        body,
      },
    });
  } catch {
    redirectWithMessage(
      `/anime/${anime.slug}`,
      "error",
      "コメントの投稿に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  revalidatePath(`/anime/${anime.slug}`);
  redirectWithMessage(`/anime/${anime.slug}`, "message", "コメントを投稿しました。");
}

export async function updateComment(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "データベース接続の設定が必要です。READMEを確認してください。");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "コメント編集にはログインが必要です。");
  }

  const commentId = requireText(formData.get("commentId"));
  const body = requireText(formData.get("body"));

  if (!commentId) {
    redirectWithMessage("/anime", "error", "編集するコメント情報が不足しています。");
  }

  let comment: { userId: string; anime: { slug: string } } | null = null;

  try {
    comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        userId: true,
        anime: { select: { slug: true } },
      },
    });
  } catch {
    redirectWithMessage("/anime", "error", "データベースに接続できません。DATABASE_URLを確認してください。");
  }

  if (!comment) {
    redirectWithMessage("/anime", "error", "コメントが見つかりません。");
  }

  if (comment.userId !== user.id) {
    redirectWithMessage(`/anime/${comment.anime.slug}`, "error", "自分のコメントだけ編集できます。");
  }

  if (!body) {
    redirectWithMessage(`/anime/${comment.anime.slug}`, "error", "コメント本文を入力してください。");
  }

  if (body.length > 1000) {
    redirectWithMessage(`/anime/${comment.anime.slug}`, "error", "コメントは1000文字以内で入力してください。");
  }

  let updatedCount = 0;

  try {
    const result = await prisma.comment.updateMany({
      where: {
        id: commentId,
        userId: user.id,
      },
      data: { body },
    });

    updatedCount = result.count;
  } catch {
    redirectWithMessage(
      `/anime/${comment.anime.slug}`,
      "error",
      "コメントの更新に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  if (updatedCount === 0) {
    redirectWithMessage(`/anime/${comment.anime.slug}`, "error", "編集できる自分のコメントが見つかりません。");
  }

  revalidatePath(`/anime/${comment.anime.slug}`);
  redirectWithMessage(`/anime/${comment.anime.slug}`, "message", "コメントを更新しました。");
}

export async function deleteComment(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "データベース接続の設定が必要です。READMEを確認してください。");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "コメント削除にはログインが必要です。");
  }

  const commentId = requireText(formData.get("commentId"));

  if (!commentId) {
    redirectWithMessage("/anime", "error", "削除するコメント情報が不足しています。");
  }

  let comment: { userId: string; anime: { slug: string } } | null = null;

  try {
    comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        userId: true,
        anime: { select: { slug: true } },
      },
    });
  } catch {
    redirectWithMessage("/anime", "error", "データベースに接続できません。DATABASE_URLを確認してください。");
  }

  if (!comment) {
    redirectWithMessage("/anime", "error", "コメントが見つかりません。");
  }

  if (comment.userId !== user.id) {
    redirectWithMessage(`/anime/${comment.anime.slug}`, "error", "自分のコメントだけ削除できます。");
  }

  let deletedCount = 0;

  try {
    const result = await prisma.comment.deleteMany({
      where: {
        id: commentId,
        userId: user.id,
      },
    });

    deletedCount = result.count;
  } catch {
    redirectWithMessage(
      `/anime/${comment.anime.slug}`,
      "error",
      "コメントの削除に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  if (deletedCount === 0) {
    redirectWithMessage(`/anime/${comment.anime.slug}`, "error", "削除できる自分のコメントが見つかりません。");
  }

  revalidatePath(`/anime/${comment.anime.slug}`);
  redirectWithMessage(`/anime/${comment.anime.slug}`, "message", "コメントを削除しました。");
}
