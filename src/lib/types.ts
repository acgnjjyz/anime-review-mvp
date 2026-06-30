import type { Prisma } from "@prisma/client";

export type AnimeCardData = Prisma.AnimeGetPayload<{
  include: {
    reviews: { select: { score: true } };
    ratings: { select: { score: true } };
    _count: { select: { favorites: true } };
  };
}>;
