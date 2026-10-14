import { UserRole } from "@prisma/client";

import { HeaderClient } from "@/components/HeaderClient";
import type { SearchModalItem } from "@/components/SearchModal";
import { getCurrentUserProfile } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

async function getSearchIndex(): Promise<SearchModalItem[]> {
  if (!hasDatabaseEnv()) {
    return [];
  }

  try {
    const animeList = await prisma.anime.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        title: true,
        coverImage: true,
        genres: true,
        reviews: {
          select: {
            title: true,
            body: true,
          },
          take: 4,
        },
        tagVotes: {
          select: {
            tag: { select: { name: true } },
          },
          take: 12,
        },
      },
      orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
      take: 80,
    });

    return animeList.map((anime) => ({
      slug: anime.slug,
      title: anime.title,
      coverImage: anime.coverImage,
      genres: anime.genres,
      tags: Array.from(new Set(anime.tagVotes.map((vote) => vote.tag.name))),
      reviewText: anime.reviews.map((review) => `${review.title} ${review.body}`).join(" "),
    }));
  } catch {
    return [];
  }
}

export async function Header() {
  const user = await getCurrentUserProfile();
  const searchIndex = await getSearchIndex();
  const isAdmin = user?.role === UserRole.ADMIN;
  const randomItem = searchIndex.length
    ? searchIndex[Math.floor(Date.now() / 60000) % searchIndex.length]
    : null;

  return (
    <>
      <HeaderClient
        isAdmin={isAdmin}
        isLoggedIn={Boolean(user)}
        randomHref={randomItem ? `/anime/${randomItem.slug}` : "/anime"}
        searchIndex={searchIndex}
      />
    </>
  );
}
