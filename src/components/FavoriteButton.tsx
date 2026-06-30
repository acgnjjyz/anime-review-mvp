import { Heart } from "lucide-react";

import { toggleFavorite } from "@/app/actions/review";
import { SubmitButton } from "@/components/SubmitButton";

type FavoriteButtonProps = {
  animeId: string;
  isFavorite: boolean;
  isLoggedIn: boolean;
};

export function FavoriteButton({ animeId, isFavorite, isLoggedIn }: FavoriteButtonProps) {
  return (
    <div>
      <form action={toggleFavorite}>
        <input name="animeId" type="hidden" value={animeId} />
        <SubmitButton
          className="inline-flex h-11 items-center gap-2 rounded bg-coral px-4 text-sm font-black text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!isLoggedIn}
          pendingLabel="更新中..."
          title={isLoggedIn ? "お気に入りを切り替える" : "ログインするとお気に入りできます"}
        >
          <Heart className={isFavorite ? "h-5 w-5 fill-current" : "h-5 w-5"} aria-hidden="true" />
          {isFavorite ? "お気に入り済み" : "お気に入り"}
        </SubmitButton>
      </form>
      {!isLoggedIn ? (
        <p className="mt-2 text-xs font-medium text-slate-300">ログインするとお気に入りできます。</p>
      ) : null}
    </div>
  );
}
