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
      <h2 className="flex items-center gap-2 text-lg font-black text-white">
        <Tags className="h-5 w-5 text-violet-200" aria-hidden="true" />
        Component Tags
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Vote for the tags that describe this anime. One vote per tag.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm font-bold text-slate-500">No tags are available yet.</p>
        ) : (
          tags.map((tag) => (
            <form action={toggleAnimeTagVote} key={tag.id}>
              <input name="animeId" type="hidden" value={animeId} />
              <input name="tagId" type="hidden" value={tag.id} />
              <SubmitButton
                className={
                  tag.isVoted
                    ? "inline-flex h-9 items-center gap-2 rounded-full border border-cyan-300/50 bg-cyan-400/20 px-3 text-xs font-black text-cyan-50"
                    : "inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-3 text-xs font-black text-slate-300 transition hover:border-violet-300/50 hover:text-white"
                }
                disabled={!isLoggedIn}
                pendingLabel="..."
              >
                {tag.name}
                <span className="rounded-full bg-black/30 px-1.5 py-0.5">{tag.count}</span>
              </SubmitButton>
            </form>
          ))
        )}
      </div>
      {!isLoggedIn ? (
        <p className="mt-4 text-xs font-bold text-slate-500">Log in to vote on tags.</p>
      ) : null}
    </section>
  );
}
