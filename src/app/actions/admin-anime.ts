"use server";

import { AiringDay } from "@prisma/client";
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
  trailerUrl: string | null;
  airingDay: AiringDay | null;
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
    redirectWithMessage("/login", "message", "Log in to use the admin screen.");
  }

  if (!isAdmin) {
    redirectWithMessage("/admin", "error", "Admin permission is required.");
  }

  return user;
}

function parseGenres(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n、]/)
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

function readAiringDay(value: FormDataEntryValue | null) {
  const text = requireText(value);

  if (!text) {
    return null;
  }

  if (
    text === AiringDay.MONDAY ||
    text === AiringDay.TUESDAY ||
    text === AiringDay.WEDNESDAY ||
    text === AiringDay.THURSDAY ||
    text === AiringDay.FRIDAY ||
    text === AiringDay.SATURDAY ||
    text === AiringDay.SUNDAY
  ) {
    return text;
  }

  return null;
}

function readAnimeForm(formData: FormData, redirectPath: string): AnimeFormValues {
  const title = requireText(formData.get("title"));
  const synopsis = requireText(formData.get("synopsis"));
  const genres = parseGenres(requireText(formData.get("genres")));
  const releaseYear = Number(formData.get("releaseYear"));
  const coverImage = requireText(formData.get("coverImage"));
  const trailerUrl = requireText(formData.get("trailerUrl"));
  const airingDay = readAiringDay(formData.get("airingDay"));
  const isPublished = formData.get("isPublished") === "on";

  if (!title) {
    redirectWithMessage(redirectPath, "error", "Title is required.");
  }

  if (!synopsis) {
    redirectWithMessage(redirectPath, "error", "Synopsis is required.");
  }

  if (genres.length === 0) {
    redirectWithMessage(redirectPath, "error", "Enter at least one genre.");
  }

  if (Number.isNaN(releaseYear) || releaseYear < 1950 || releaseYear > 2100) {
    redirectWithMessage(redirectPath, "error", "Release year must be between 1950 and 2100.");
  }

  if (!coverImage || (coverImage !== "/images/catalog-placeholder.svg" && !isValidHttpUrl(coverImage))) {
    redirectWithMessage(redirectPath, "error", "Cover image URL must start with http or https.");
  }

  if (trailerUrl && !isValidHttpUrl(trailerUrl)) {
    redirectWithMessage(redirectPath, "error", "Trailer URL must start with http or https.");
  }

  if (
    title.length > 120 ||
    synopsis.length > 2000 ||
    coverImage.length > 1000 ||
    trailerUrl.length > 1000
  ) {
    redirectWithMessage(redirectPath, "error", "Input is too long.");
  }

  return {
    title,
    synopsis,
    genres,
    releaseYear,
    coverImage,
    trailerUrl: trailerUrl || null,
    airingDay,
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

function revalidateAnimeSurfaces() {
  revalidatePath("/");
  revalidatePath("/anime");
  revalidatePath("/ranking");
  revalidatePath("/schedule");
  revalidatePath("/admin");
  revalidatePath("/admin/anime");
}

export async function createAdminAnime(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/anime", "error", "Database is not configured.");
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
        season: `${values.releaseYear} Season`,
        episodes: 12,
      },
    });
  } catch {
    redirectWithMessage("/admin/anime/new", "error", "Could not create anime.");
  }

  revalidateAnimeSurfaces();
  redirectWithMessage("/admin/anime", "message", "Anime created.");
}

export async function updateAdminAnime(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/anime", "error", "Database is not configured.");
  }

  await requireAdmin();

  const animeId = requireText(formData.get("animeId"));

  if (!animeId) {
    redirectWithMessage("/admin/anime", "error", "Anime id is missing.");
  }

  const redirectPath = `/admin/anime/${animeId}/edit`;
  const values = readAnimeForm(formData, redirectPath);

  const existingAnime = await prisma.anime.findUnique({
    where: { id: animeId },
    select: { id: true, slug: true },
  });

  if (!existingAnime) {
    redirectWithMessage("/admin/anime", "error", "Anime was not found.");
  }

  try {
    await prisma.anime.update({
      where: { id: animeId },
      data: values,
    });
  } catch {
    redirectWithMessage(redirectPath, "error", "Could not update anime.");
  }

  revalidateAnimeSurfaces();
  revalidatePath(`/anime/${existingAnime.slug}`);
  redirectWithMessage("/admin/anime", "message", "Anime updated.");
}

export async function deleteAdminAnime(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/anime", "error", "Database is not configured.");
  }

  await requireAdmin();

  const animeId = requireText(formData.get("animeId"));

  if (!animeId) {
    redirectWithMessage("/admin/anime", "error", "Anime id is missing.");
  }

  const anime = await prisma.anime.findUnique({
    where: { id: animeId },
    select: {
      id: true,
      _count: {
        select: {
          reviews: true,
          ratings: true,
          comments: true,
          favorites: true,
          shelves: true,
          tagVotes: true,
        },
      },
    },
  });

  if (!anime) {
    redirectWithMessage("/admin/anime", "error", "Anime was not found.");
  }

  const relatedCount =
    anime._count.reviews +
    anime._count.ratings +
    anime._count.comments +
    anime._count.favorites +
    anime._count.shelves +
    anime._count.tagVotes;

  if (relatedCount > 0) {
    redirectWithMessage(
      "/admin/anime",
      "error",
      "This anime has reviews, favorites, shelves, or tag votes and cannot be deleted safely.",
    );
  }

  try {
    await prisma.anime.delete({
      where: { id: anime.id },
    });
  } catch {
    redirectWithMessage("/admin/anime", "error", "Could not delete anime.");
  }

  revalidateAnimeSurfaces();
  redirectWithMessage("/admin/anime", "message", "Anime deleted.");
}

export async function toggleAdminAnimePublished(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/anime", "error", "Database is not configured.");
  }

  await requireAdmin();

  const animeId = requireText(formData.get("animeId"));
  const nextPublished = formData.get("isPublished") === "true";

  if (!animeId) {
    redirectWithMessage("/admin/anime", "error", "Anime id is missing.");
  }

  try {
    await prisma.anime.update({
      where: { id: animeId },
      data: { isPublished: nextPublished },
    });
  } catch {
    redirectWithMessage("/admin/anime", "error", "Could not update publish state.");
  }

  revalidateAnimeSurfaces();
  redirectWithMessage(
    "/admin/anime",
    "message",
    nextPublished ? "Anime published." : "Anime unpublished.",
  );
}
