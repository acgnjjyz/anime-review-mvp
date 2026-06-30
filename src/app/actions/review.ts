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

export async function saveReview(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "データベース接続の設定が必要です。READMEを確認してください。");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "レビュー投稿にはログインが必要です。");
  }

  const animeId = requireText(formData.get("animeId"));
  const score = Number(formData.get("score"));
  const title = requireText(formData.get("title"));
  const body = requireText(formData.get("body"));

  if (!animeId || Number.isNaN(score) || score < 1 || score > 100) {
    redirectWithMessage("/anime", "error", "レビューの点数は1から100で入力してください。");
  }

  let anime: { slug: string; isPublished: boolean } | null = null;

  try {
    anime = await prisma.anime.findUnique({
      where: { id: animeId },
      select: { slug: true, isPublished: true },
    });
  } catch {
    redirectWithMessage("/anime", "error", "データベースに接続できません。DATABASE_URLを確認してください。");
  }

  if (!anime) {
    redirectWithMessage("/anime", "error", "作品が見つかりません。");
  }

  if (!anime.isPublished) {
    redirectWithMessage("/anime", "error", "非公開作品にはレビューを投稿できません。");
  }

  if (!title || !body) {
    redirectWithMessage(`/anime/${anime.slug}`, "error", "レビュータイトルと本文を入力してください。");
  }

  if (title.length > 80 || body.length > 2000) {
    redirectWithMessage(`/anime/${anime.slug}`, "error", "レビューが長すぎます。文字数を短くしてください。");
  }

  if (body.length < 10) {
    redirectWithMessage(`/anime/${anime.slug}`, "error", "本文は10文字以上で入力してください。");
  }

  try {
    await prisma.$transaction([
      prisma.review.upsert({
        where: {
          animeId_userId: {
            animeId,
            userId: user.id,
          },
        },
        update: {
          score,
          title,
          body,
        },
        create: {
          animeId,
          userId: user.id,
          score,
          title,
          body,
        },
      }),
      prisma.rating.upsert({
        where: {
          animeId_userId: {
            animeId,
            userId: user.id,
          },
        },
        update: {
          score,
        },
        create: {
          animeId,
          userId: user.id,
          score,
        },
      }),
    ]);
  } catch {
    redirectWithMessage(
      `/anime/${anime.slug}`,
      "error",
      "レビューの保存に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  revalidatePath("/");
  revalidatePath("/anime");
  revalidatePath("/ranking");
  revalidatePath("/mypage");
  revalidatePath(`/anime/${anime.slug}`);
  redirectWithMessage(`/anime/${anime.slug}`, "message", "レビューを保存しました。");
}

export async function deleteReview(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "データベース接続の設定が必要です。READMEを確認してください。");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "レビュー削除にはログインが必要です。");
  }

  const animeId = requireText(formData.get("animeId"));

  if (!animeId) {
    redirectWithMessage("/anime", "error", "削除するレビューの作品情報が不足しています。");
  }

  let anime: { slug: string; isPublished: boolean } | null = null;

  try {
    anime = await prisma.anime.findUnique({
      where: { id: animeId },
      select: { slug: true, isPublished: true },
    });
  } catch {
    redirectWithMessage("/anime", "error", "データベースに接続できません。DATABASE_URLを確認してください。");
  }

  if (!anime) {
    redirectWithMessage("/anime", "error", "作品が見つかりません。");
  }

  if (!anime.isPublished) {
    redirectWithMessage("/anime", "error", "非公開作品のレビューは操作できません。");
  }

  let deletedReviewCount = 0;

  try {
    const [deletedReview] = await prisma.$transaction([
      prisma.review.deleteMany({
        where: {
          animeId,
          userId: user.id,
        },
      }),
      prisma.rating.deleteMany({
        where: {
          animeId,
          userId: user.id,
        },
      }),
    ]);

    deletedReviewCount = deletedReview.count;
  } catch {
    redirectWithMessage(
      `/anime/${anime.slug}`,
      "error",
      "レビューの削除に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  if (deletedReviewCount === 0) {
    redirectWithMessage(`/anime/${anime.slug}`, "error", "削除できる自分のレビューが見つかりません。");
  }

  revalidatePath("/");
  revalidatePath("/anime");
  revalidatePath("/ranking");
  revalidatePath("/mypage");
  revalidatePath(`/anime/${anime.slug}`);
  redirectWithMessage(`/anime/${anime.slug}`, "message", "レビューを削除しました。");
}

export async function toggleFavorite(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "データベース接続の設定が必要です。READMEを確認してください。");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "お気に入りにはログインが必要です。");
  }

  const animeId = requireText(formData.get("animeId"));
  let anime: { slug: string; isPublished: boolean } | null = null;

  try {
    anime = await prisma.anime.findUnique({
      where: { id: animeId },
      select: { slug: true, isPublished: true },
    });
  } catch {
    redirectWithMessage("/anime", "error", "データベースに接続できません。DATABASE_URLを確認してください。");
  }

  if (!anime) {
    redirectWithMessage("/anime", "error", "作品が見つかりません。");
  }

  if (!anime.isPublished) {
    redirectWithMessage("/anime", "error", "非公開作品はお気に入りに追加できません。");
  }

  try {
    const current = await prisma.favorite.findUnique({
      where: {
        animeId_userId: {
          animeId,
          userId: user.id,
        },
      },
    });

    if (current) {
      await prisma.favorite.delete({ where: { id: current.id } });
    } else {
      await prisma.favorite.create({
        data: {
          animeId,
          userId: user.id,
        },
      });
    }
  } catch {
    redirectWithMessage(`/anime/${anime.slug}`, "error", "お気に入りの更新に失敗しました。再度お試しください。");
  }

  revalidatePath("/favorites");
  revalidatePath("/mypage");
  revalidatePath(`/anime/${anime.slug}`);
  redirectWithMessage(`/anime/${anime.slug}`, "message", "お気に入りを更新しました。");
}
