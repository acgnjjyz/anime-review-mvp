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
          className={
            isFavorite
              ? "inline-flex h-11 items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/20 px-4 text-sm font-black text-rose-ink transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              : "portal-button-primary inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
          }
          disabled={!isLoggedIn}
          pendingLabel="Updating..."
          title={isLoggedIn ? "Toggle favorite" : "Login to favorite"}
        >
          <Heart className={isFavorite ? "h-5 w-5 fill-current" : "h-5 w-5"} aria-hidden="true" />
          {isFavorite ? "Favorited" : "Favorite"}
        </SubmitButton>
      </form>
      {!isLoggedIn ? (
        <p className="mt-2 text-xs font-medium text-muted">Login to save this anime.</p>
      ) : null}
    </div>
  );
}
