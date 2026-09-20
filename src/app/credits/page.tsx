import Link from "next/link";
import officialImages from "../../../public/data/official-anime-images.json";

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
      <section>
        <h2 className="text-lg font-bold text-white">画像未登録作品の参照リンク</h2>
        <p>
          確認済みの公式・正規掲載元リンクを優先しています。それ以外の「作品情報」は、
          anime-offline-databaseの作品IDから照合した第三者データベースへのリンクで、公式サイトではありません。
          リンク先の現在の稼働状況は全件確認していません。「掲載元を検索」は検索サービスを開きます。
          いずれも画像の転載許諾を意味しません。
        </p>
        <a className="text-cyan-300 underline" href="/data/catalog-reference-links.json">参照リンクの対応表（JSON）</a>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white">スタジオジブリ公式作品静止画</h2>
        <p>
          一部作品には、スタジオジブリが公開する作品静止画を使用しています。
          <a className="text-cyan-300 underline" href={officialImages.termsUrl}>公式の提供案内</a>
          および各作品ページの利用案内に基づき、作品紹介用に掲載しています。
          これらの画像はCC BY-SAの対象ではありません。著作権は各権利者に帰属します。
        </p>
        <a className="text-cyan-300 underline" href="/data/official-anime-images.json">公式画像の対応表（JSON）</a>
        <ul className="mt-4 divide-y divide-white/10">
          {officialImages.matches.map(image => (
            <li key={image.slug} className="py-3">
              <a className="text-cyan-300 hover:underline" href={image.sourceUrl}>{image.officialTitle}</a>
              <p className="break-words text-xs text-slate-400">{image.copyright}</p>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
