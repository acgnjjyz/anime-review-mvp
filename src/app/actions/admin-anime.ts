"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type AnimeFormValues = {
  title: string;
  synopsis: string;
  genres: string[];
  releaseYear: number;
  coverImage: string;
  isPublished: boolean;
};

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

function parseGenres(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n、，]/)
        .map((genre) => genre.trim())
        .filter(Boolean),
    ),
  );
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function readAnimeForm(formData: FormData, redirectPath: string): AnimeFormValues {
  const title = requireText(formData.get("title"));
  const synopsis = requireText(formData.get("synopsis"));
  const genres = parseGenres(requireText(formData.get("genres")));
  const releaseYear = Number(formData.get("releaseYear"));
  const coverImage = requireText(formData.get("coverImage"));
  const isPublished = formData.get("isPublished") === "on";

  if (!title) {
    redirectWithMessage(redirectPath, "error", "タイトルを入力してください。");
  }

  if (!synopsis) {
    redirectWithMessage(redirectPath, "error", "概要を入力してください。");
  }

  if (genres.length === 0) {
    redirectWithMessage(redirectPath, "error", "ジャンルを1つ以上入力してください。");
  }

  if (Number.isNaN(releaseYear) || releaseYear < 1950 || releaseYear > 2100) {
    redirectWithMessage(redirectPath, "error", "放送年は1950から2100の範囲で入力してください。");
  }

  if (!coverImage || !isValidHttpUrl(coverImage)) {
    redirectWithMessage(redirectPath, "error", "画像URLは http または https で始まるURLを入力してください。");
  }

  if (title.length > 120 || synopsis.length > 2000 || coverImage.length > 1000) {
    redirectWithMessage(redirectPath, "error", "入力内容が長すぎます。文字数を短くしてください。");
  }

  return {
    title,
    synopsis,
    genres,
    releaseYear,
    coverImage,
    isPublished,
  };
}

function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || `anime-${Date.now()}`;
}

async function createUniqueSlug(title: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.anime.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function createAdminAnime(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/anime", "error", "データベース接続の設定が必要です。");
  }

  await requireAdmin();

  const values = readAnimeForm(formData, "/admin/anime/new");

  try {
    await prisma.anime.create({
      data: {
        ...values,
        slug: await createUniqueSlug(values.title),
        titleEn: null,
        studio: "Admin Studio",
        season: `${values.releaseYear} 未定`,
        episodes: 12,
      },
    });
  } catch {
    redirectWithMessage(
      "/admin/anime/new",
      "error",
      "作品の作成に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  revalidatePath("/");
  revalidatePath("/anime");
  revalidatePath("/ranking");
  revalidatePath("/admin");
  revalidatePath("/admin/anime");
  redirectWithMessage("/admin/anime", "message", "作品を追加しました。");
}

export async function updateAdminAnime(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/anime", "error", "データベース接続の設定が必要です。");
  }

  await requireAdmin();

  const animeId = requireText(formData.get("animeId"));

  if (!animeId) {
    redirectWithMessage("/admin/anime", "error", "編集する作品情報が不足しています。");
  }

  const redirectPath = `/admin/anime/${animeId}/edit`;
  const values = readAnimeForm(formData, redirectPath);

  let existingAnime: { id: string } | null = null;

  try {
    existingAnime = await prisma.anime.findUnique({
      where: { id: animeId },
      select: { id: true },
    });
  } catch {
    redirectWithMessage("/admin/anime", "error", "データベースに接続できません。");
  }

  if (!existingAnime) {
    redirectWithMessage("/admin/anime", "error", "編集する作品が見つかりません。");
  }

  try {
    await prisma.anime.update({
      where: { id: animeId },
      data: values,
    });
  } catch {
    redirectWithMessage(
      redirectPath,
      "error",
      "作品の更新に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  revalidatePath("/");
  revalidatePath("/anime");
  revalidatePath("/ranking");
  revalidatePath("/admin");
  revalidatePath("/admin/anime");
  redirectWithMessage("/admin/anime", "message", "作品を更新しました。");
}

export async function deleteAdminAnime(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/anime", "error", "データベース接続の設定が必要です。");
  }

  await requireAdmin();

  const animeId = requireText(formData.get("animeId"));

  if (!animeId) {
    redirectWithMessage("/admin/anime", "error", "削除する作品情報が不足しています。");
  }

  let anime:
    | {
        id: string;
        title: string;
        _count: {
          reviews: number;
          ratings: number;
          comments: number;
          favorites: number;
        };
      }
    | null = null;

  try {
    anime = await prisma.anime.findUnique({
      where: { id: animeId },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            reviews: true,
            ratings: true,
            comments: true,
            favorites: true,
          },
        },
      },
    });
  } catch {
    redirectWithMessage("/admin/anime", "error", "データベースに接続できません。");
  }

  if (!anime) {
    redirectWithMessage("/admin/anime", "error", "削除する作品が見つかりません。");
  }

  const relatedCount =
    anime._count.reviews + anime._count.ratings + anime._count.comments + anime._count.favorites;

  if (relatedCount > 0) {
    redirectWithMessage(
      "/admin/anime",
      "error",
      "レビュー等があるため削除できません。先に関連データを整理してください。",
    );
  }

  try {
    await prisma.anime.delete({
      where: { id: anime.id },
    });
  } catch {
    redirectWithMessage(
      "/admin/anime",
      "error",
      "作品の削除に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  revalidatePath("/");
  revalidatePath("/anime");
  revalidatePath("/ranking");
  revalidatePath("/admin");
  revalidatePath("/admin/anime");
  redirectWithMessage("/admin/anime", "message", "作品を削除しました。");
}

export async function toggleAdminAnimePublished(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/anime", "error", "データベース接続の設定が必要です。");
  }

  await requireAdmin();

  const animeId = requireText(formData.get("animeId"));
  const nextPublished = formData.get("isPublished") === "true";

  if (!animeId) {
    redirectWithMessage("/admin/anime", "error", "公開状態を切り替える作品情報が不足しています。");
  }

  try {
    await prisma.anime.update({
      where: { id: animeId },
      data: { isPublished: nextPublished },
    });
  } catch {
    redirectWithMessage(
      "/admin/anime",
      "error",
      "公開状態の切り替えに失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  revalidatePath("/");
  revalidatePath("/anime");
  revalidatePath("/ranking");
  revalidatePath("/admin");
  revalidatePath("/admin/anime");
  redirectWithMessage(
    "/admin/anime",
    "message",
    nextPublished ? "作品を公開しました。" : "作品を非公開にしました。",
  );
}
