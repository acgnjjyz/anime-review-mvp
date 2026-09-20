import Link from "next/link";

export default function CreditsPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 px-5 py-10 text-sm leading-7 text-slate-300">
      <h1 className="text-2xl font-bold text-white">作品データの出典</h1>
      <p>
        ポスター情報は <a className="text-cyan-300 underline" href="https://www.tvmaze.com/">TVmaze</a> のAPIを利用しています。
        APIデータの利用条件は <a className="text-cyan-300 underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> です。
        各画像の著作権はそれぞれの権利者に帰属します。
      </p>
      <p>
        作品の照合には <a className="text-cyan-300 underline" href="https://github.com/manami-project/anime-offline-database">anime-offline-database</a> の
        2026-07-04版を使用しています。
        <a className="text-cyan-300 underline" href="https://github.com/manami-project/anime-offline-database/blob/2026-27/LICENSE">ODbL 1.0 / DbCL 1.0</a> に基づくデータです。
        日本語タイトルの照合元は <a className="text-cyan-300 underline" href="https://anidb.net/">AniDB</a> です。
      </p>
      <p>
        元データから作品ID・別名・年を照合し、このサイトの作品と画像提供元の対応表を作成しています。
        <a className="ml-1 text-cyan-300 underline" href="/data/anime-posters.json">対応表と出典（JSON）</a>
      </p>
      <Link className="inline-block text-cyan-300 hover:underline" href="/anime">作品一覧へ</Link>
    </section>
  );
}
