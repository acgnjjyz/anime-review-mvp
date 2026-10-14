import { Tags } from "lucide-react";

import { toggleAnimeTagVote } from "@/app/actions/anime-extras";
import { SubmitButton } from "@/components/SubmitButton";

type TagVote = {
  id: string;
  name: string;
  count: number;
  isVoted: boolean;
};

type TagVotePanelProps = {
  animeId: string;
  tags: TagVote[];
  isLoggedIn: boolean;
};

export function TagVotePanel({ animeId, isLoggedIn, tags }: TagVotePanelProps) {
  return (
    <section className="portal-panel rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-lg font-black text-heading">
        <Tags className="h-5 w-5 text-violet-ink" aria-hidden="true" />
        Component Tags
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Vote for the tags that describe this anime. One vote per tag.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm font-bold text-muted">No tags are available yet.</p>
        ) : (
          tags.map((tag) => (
            <form action={toggleAnimeTagVote} key={tag.id}>
              <input name="animeId" type="hidden" value={animeId} />
              <input name="tagId" type="hidden" value={tag.id} />
              <SubmitButton
                className={
                  tag.isVoted
                    ? "inline-flex h-9 items-center gap-2 rounded-full border border-cyan-300/50 bg-cyan-400/20 px-3 text-xs font-black text-cyan-ink"
                    : "inline-flex h-9 items-center gap-2 rounded-full border border-stroke/25 bg-field/70 px-3 text-xs font-black text-secondary transition hover:border-violet-300/50 hover:text-heading"
                }
                disabled={!isLoggedIn}
                pendingLabel="..."
              >
                {tag.name}
                <span className="rounded-full bg-depth/30 px-1.5 py-0.5">{tag.count}</span>
              </SubmitButton>
            </form>
          ))
        )}
      </div>
      {!isLoggedIn ? (
        <p className="mt-4 text-xs font-bold text-muted">Log in to vote on tags.</p>
      ) : null}
    </section>
  );
}
