"use server";

import { WatchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSyncedCurrentUser } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

function readText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function redirectWithMessage(path: string, key: "error" | "message", value: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

function readWatchStatus(value: FormDataEntryValue | null) {
  const status = readText(value);

  if (
    status === WatchStatus.WANT_TO_WATCH ||
    status === WatchStatus.WATCHING ||
    status === WatchStatus.COMPLETED ||
    status === WatchStatus.DROPPED ||
    status === WatchStatus.FAVORITE
  ) {
    return status;
  }

  return null;
}

export async function updateWatchStatus(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "Database is not configured.");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "Log in to save your anime shelf.");
  }

  const animeId = readText(formData.get("animeId"));
  const status = readWatchStatus(formData.get("status"));

  const anime = animeId
    ? await prisma.anime.findUnique({
        where: { id: animeId },
        select: { slug: true, isPublished: true },
      })
    : null;

  if (!anime || !anime.isPublished) {
    redirectWithMessage("/anime", "error", "Anime was not found.");
  }

  try {
    if (!status) {
      await prisma.animeShelf.deleteMany({
        where: {
          animeId,
          userId: user.id,
        },
      });
    } else {
      await prisma.animeShelf.upsert({
        where: {
          animeId_userId: {
            animeId,
            userId: user.id,
          },
        },
        update: { status },
        create: {
          animeId,
          userId: user.id,
          status,
        },
      });
    }
  } catch {
    redirectWithMessage(`/anime/${anime.slug}`, "error", "Could not update your shelf status.");
  }

  revalidatePath("/mypage");
  revalidatePath(`/anime/${anime.slug}`);
  redirectWithMessage(`/anime/${anime.slug}`, "message", "Shelf status updated.");
}

export async function toggleAnimeTagVote(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/anime", "error", "Database is not configured.");
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirectWithMessage("/login", "message", "Log in to vote on tags.");
  }

  const animeId = readText(formData.get("animeId"));
  const tagId = readText(formData.get("tagId"));

  const anime = animeId
    ? await prisma.anime.findUnique({
        where: { id: animeId },
        select: { slug: true, isPublished: true },
      })
    : null;

  if (!anime || !anime.isPublished || !tagId) {
    redirectWithMessage("/anime", "error", "Tag vote target was not found.");
  }

  try {
    const current = await prisma.animeTagVote.findUnique({
      where: {
        animeId_tagId_userId: {
          animeId,
          tagId,
          userId: user.id,
        },
      },
    });

    if (current) {
      await prisma.animeTagVote.delete({ where: { id: current.id } });
    } else {
      await prisma.animeTagVote.create({
        data: {
          animeId,
          tagId,
          userId: user.id,
        },
      });
    }
  } catch {
    redirectWithMessage(`/anime/${anime.slug}`, "error", "Could not update tag vote.");
  }

  revalidatePath("/anime");
  revalidatePath(`/anime/${anime.slug}`);
  redirectWithMessage(`/anime/${anime.slug}`, "message", "Tag vote updated.");
}
