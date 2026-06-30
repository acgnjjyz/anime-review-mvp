import Link from "next/link";
import { redirect } from "next/navigation";

import { AnimeCard } from "@/components/AnimeCard";
import { EmptyState } from "@/components/EmptyState";
import { SetupNotice } from "@/components/SetupNotice";
import { getSyncedCurrentUser } from "@/lib/auth";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import type { AnimeCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  if (!hasDatabaseEnv()) {
    return <SetupNotice />;
  }

  const user = await getSyncedCurrentUser();

  if (!user) {
    redirect("/login?message=お気に入りを見るにはログインしてください。");
  }

  let favorites: { id: string; anime: AnimeCardData }[] = [];

  try {
    favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
        anime: { isPublished: true },
      },
      include: {
        anime: {
          include: {
            reviews: { select: { score: true } },
            ratings: { select: { score: true } },
            _count: { select: { favorites: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return (
      <SetupNotice
        title="お気に入りを読み込めません"
        description="データベース接続に失敗しました。DATABASE_URLとSupabaseのDB状態を確認してください。"
      />
    );
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-9">
          <p className="text-sm font-black text-coral">Favorites</p>
          <h1 className="mt-2 text-3xl font-black text-ink">お気に入り</h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {favorites.length === 0 ? (
          <EmptyState
            actionHref="/anime"
            actionLabel="作品を探す"
            description="作品詳細ページでお気に入りを押すと、ここに保存されます。"
            title="お気に入りはまだありません"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <AnimeCard anime={favorite.anime} isFavorite key={favorite.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
