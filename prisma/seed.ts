import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isDatabaseConnectionError(error: unknown) {
  const message = getErrorMessage(error);

  return (
    message.includes("Can't reach database server") ||
    message.includes("P1001")
  );
}

const seedUsers = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    email: "seed-aoi@example.invalid",
    name: "あおい",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "seed-ren@example.invalid",
    name: "レン",
  },
];

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

const animeList = [
  {
    slug: "starlight-railway",
    title: "星明かりのレールウェイ",
    titleEn: "Starlight Railway",
    synopsis:
      "廃線寸前の銀河鉄道を守るため、車掌見習いの少女と機械仕掛けの相棒が星々をめぐるロードムービー。",
    coverImage:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80",
    studio: "Studio North",
    season: "2026 春",
    episodes: 12,
    releaseYear: 2026,
    genres: ["冒険", "SF", "ドラマ"],
  },
  {
    slug: "after-school-alchemy",
    title: "放課後アルケミー",
    titleEn: "After School Alchemy",
    synopsis:
      "普通の高校に隠された錬金術部。失敗だらけの実験から、少しずつ友情と魔法の意味を知っていく青春ファンタジー。",
    coverImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=80",
    studio: "Canvas Works",
    season: "2025 秋",
    episodes: 13,
    releaseYear: 2025,
    genres: ["学園", "ファンタジー", "コメディ"],
  },
  {
    slug: "blue-terminal",
    title: "ブルーターミナル",
    titleEn: "Blue Terminal",
    synopsis:
      "海上都市の巨大ターミナルで働く新人管制官が、空と海をつなぐ事件に巻き込まれていく群像劇。",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    studio: "Portside Pictures",
    season: "2025 夏",
    episodes: 24,
    releaseYear: 2025,
    genres: ["ドラマ", "ミステリー"],
  },
  {
    slug: "neon-kendo-club",
    title: "ネオン剣道部",
    titleEn: "Neon Kendo Club",
    synopsis:
      "近未来の下町を舞台に、剣道部の仲間たちが電脳大会の頂点を目指すスポーツ青春作品。",
    coverImage:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
    studio: "Hibana Studio",
    season: "2024 冬",
    episodes: 12,
    releaseYear: 2024,
    genres: ["スポーツ", "青春", "SF"],
  },
  {
    slug: "library-of-rain",
    title: "雨降る図書館",
    titleEn: "Library of Rain",
    synopsis:
      "雨の日だけ現れる図書館で、忘れられた物語を修復する司書たちの静かなファンタジー。",
    coverImage:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80",
    studio: "Paper Moon",
    season: "2024 秋",
    episodes: 10,
    releaseYear: 2024,
    genres: ["ファンタジー", "癒し", "ドラマ"],
  },
  {
    slug: "orbit-cafe",
    title: "オービット・カフェ",
    titleEn: "Orbit Cafe",
    synopsis:
      "月面カフェで働くスタッフと常連客の日常を描く、軽やかな会話劇と小さな奇跡の物語。",
    coverImage:
      "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&w=900&q=80",
    studio: "Luna Beans",
    season: "2023 春",
    episodes: 12,
    releaseYear: 2023,
    genres: ["日常", "コメディ", "SF"],
  },
  {
    slug: "glass-harbor-letters",
    title: "硝子港の手紙",
    titleEn: "Glass Harbor Letters",
    synopsis:
      "透明な防波堤に囲まれた港町で、届かないはずの手紙を配る郵便配達員が街の秘密に触れていく。",
    coverImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    studio: "Harbor Light",
    season: "2026 夏",
    episodes: 12,
    releaseYear: 2026,
    genres: ["ドラマ", "ミステリー", "青春"],
  },
  {
    slug: "clockwork-orchard",
    title: "歯車果樹園",
    titleEn: "Clockwork Orchard",
    synopsis:
      "機械仕掛けの果樹園を継いだ兄妹が、季節を止めた古い約束と向き合うスチームファンタジー。",
    coverImage:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    studio: "Gear Garden",
    season: "2026 秋",
    episodes: 13,
    releaseYear: 2026,
    genres: ["ファンタジー", "冒険", "ドラマ"],
  },
  {
    slug: "silver-score-symphony",
    title: "銀譜のシンフォニー",
    titleEn: "Silver Score Symphony",
    synopsis:
      "廃校寸前の音楽科に集まった生徒たちが、失われた楽譜を巡って最後の定期演奏会に挑む。",
    coverImage:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
    studio: "Crescendo Films",
    season: "2025 春",
    episodes: 12,
    releaseYear: 2025,
    genres: ["音楽", "学園", "青春"],
  },
  {
    slug: "midnight-bento",
    title: "午前零時の弁当屋",
    titleEn: "Midnight Bento",
    synopsis:
      "終電後だけ開く小さな弁当屋で、夜を越えたい人々の悩みと小さな再出発が描かれる。",
    coverImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    studio: "Kitchen Sink",
    season: "2025 冬",
    episodes: 10,
    releaseYear: 2025,
    genres: ["日常", "癒し", "ドラマ"],
  },
  {
    slug: "polaris-divers",
    title: "ポラリス・ダイバーズ",
    titleEn: "Polaris Divers",
    synopsis:
      "北極星の光が沈む海で、若き潜水士チームが海底都市の記憶を探すSFアドベンチャー。",
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    studio: "Blue Current",
    season: "2026 冬",
    episodes: 24,
    releaseYear: 2026,
    genres: ["SF", "冒険", "アクション"],
  },
  {
    slug: "magnolia-detective",
    title: "木蓮探偵社",
    titleEn: "Magnolia Detective",
    synopsis:
      "花屋の奥にある小さな探偵社で、観察眼の鋭い店主と新人助手が街の奇妙な事件を解く。",
    coverImage:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80",
    studio: "Mokuren Works",
    season: "2024 春",
    episodes: 12,
    releaseYear: 2024,
    genres: ["ミステリー", "日常", "コメディ"],
  },
  {
    slug: "skyline-runners",
    title: "スカイライン・ランナーズ",
    titleEn: "Skyline Runners",
    synopsis:
      "高層都市を舞台に、屋上レースへ挑む配達員たちが家族と夢の間で走り続ける。",
    coverImage:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    studio: "Urban Dash",
    season: "2024 夏",
    episodes: 13,
    releaseYear: 2024,
    genres: ["スポーツ", "アクション", "青春"],
  },
  {
    slug: "violet-planetarium",
    title: "すみれ色のプラネタリウム",
    titleEn: "Violet Planetarium",
    synopsis:
      "閉館が決まったプラネタリウムで、星に詳しい少女と転校生が最後の投影番組を作る。",
    coverImage:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80",
    studio: "Star Dome",
    season: "2023 冬",
    episodes: 12,
    releaseYear: 2023,
    genres: ["青春", "癒し", "ドラマ"],
  },
  {
    slug: "iron-lily-brigade",
    title: "鉄百合旅団",
    titleEn: "Iron Lily Brigade",
    synopsis:
      "荒野を走る装甲列車を守る少女旅団が、失われた都市連盟の真実に近づいていく。",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    studio: "Anvil Frame",
    season: "2025 夏",
    episodes: 24,
    releaseYear: 2025,
    genres: ["アクション", "SF", "冒険"],
  },
  {
    slug: "honeycomb-apartment",
    title: "ハニカム・アパートメント",
    titleEn: "Honeycomb Apartment",
    synopsis:
      "六角形の部屋が連なる不思議な集合住宅で、住人たちのささやかな事件が毎日つながっていく。",
    coverImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    studio: "Room Tone",
    season: "2023 秋",
    episodes: 12,
    releaseYear: 2023,
    genres: ["日常", "コメディ", "癒し"],
  },
  {
    slug: "aurora-mailroom",
    title: "オーロラ郵便室",
    titleEn: "Aurora Mailroom",
    synopsis:
      "空に浮かぶ郵便室で働く見習いたちが、世界各地へ夢と記憶を届けるファンタジー群像劇。",
    coverImage:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=900&q=80",
    studio: "Sky Post",
    season: "2022 冬",
    episodes: 12,
    releaseYear: 2022,
    genres: ["ファンタジー", "冒険", "癒し"],
  },
  {
    slug: "metro-ghost-notes",
    title: "地下鉄ゴーストノーツ",
    titleEn: "Metro Ghost Notes",
    synopsis:
      "深夜の地下鉄にだけ現れる幽霊楽団を追う高校生が、街に眠る未完成の曲を集めていく。",
    coverImage:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
    studio: "Night Line",
    season: "2024 秋",
    episodes: 12,
    releaseYear: 2024,
    genres: ["音楽", "ミステリー", "学園"],
  },
  {
    slug: "tanpopo-spaceport",
    title: "たんぽぽ宇宙港",
    titleEn: "Tanpopo Spaceport",
    synopsis:
      "地方の小さな宇宙港で働く整備士見習いが、旅立つ人々と見送る人々の想いに触れる。",
    coverImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    studio: "Launch Pad",
    season: "2022 春",
    episodes: 13,
    releaseYear: 2022,
    genres: ["SF", "日常", "ドラマ"],
  },
  {
    slug: "paper-sword-chronicle",
    title: "紙刀クロニクル",
    titleEn: "Paper Sword Chronicle",
    synopsis:
      "紙で作った刀に魂を宿す職人の少年が、消えた師匠を探して絵巻の国を旅する。",
    coverImage:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    studio: "Fold Arts",
    season: "2023 夏",
    episodes: 24,
    releaseYear: 2023,
    genres: ["ファンタジー", "アクション", "冒険"],
  },
  {
    slug: "cider-hill-baseball",
    title: "サイダー坂の野球部",
    titleEn: "Cider Hill Baseball",
    synopsis:
      "坂の上の小さな高校野球部が、廃部回避をかけて夏の地区大会に挑む爽やかな青春譚。",
    coverImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    studio: "Summer Ground",
    season: "2022 夏",
    episodes: 12,
    releaseYear: 2022,
    genres: ["スポーツ", "青春", "学園"],
  },
  {
    slug: "mirror-market",
    title: "鏡市場のマルシェ",
    titleEn: "Mirror Market",
    synopsis:
      "満月の夜だけ開く鏡の市場で、見習い商人が本当に欲しいものを探す客たちを案内する。",
    coverImage:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=900&q=80",
    studio: "Moon Bazaar",
    season: "2021 秋",
    episodes: 10,
    releaseYear: 2021,
    genres: ["ファンタジー", "日常", "ミステリー"],
  },
  {
    slug: "carbonated-witches",
    title: "炭酸魔女のレシピ",
    titleEn: "Carbonated Witches",
    synopsis:
      "魔法ドリンク専門店で修業する三人の魔女が、失敗作から街の困りごとを解決していく。",
    coverImage:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
    studio: "Fizz Craft",
    season: "2021 夏",
    episodes: 12,
    releaseYear: 2021,
    genres: ["コメディ", "ファンタジー", "日常"],
  },
  {
    slug: "rust-red-robot",
    title: "錆色ロボットと夏休み",
    titleEn: "Rust Red Robot",
    synopsis:
      "祖父の倉庫で眠っていた旧式ロボットと少年が、ひと夏だけの約束を叶えるため旅に出る。",
    coverImage:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80",
    studio: "Old Circuit",
    season: "2021 春",
    episodes: 11,
    releaseYear: 2021,
    genres: ["SF", "青春", "ドラマ"],
  },
  {
    slug: "lapis-lazuli-rescue",
    title: "瑠璃色レスキュー隊",
    titleEn: "Lapis Lazuli Rescue",
    synopsis:
      "山岳救助隊の新人たちが、厳しい自然と向き合いながら命をつなぐ判断を学んでいく。",
    coverImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    studio: "Peak Signal",
    season: "2026 春",
    episodes: 12,
    releaseYear: 2026,
    genres: ["ドラマ", "アクション", "青春"],
  },
  {
    slug: "cathedral-of-clouds",
    title: "雲上カテドラル",
    titleEn: "Cathedral of Clouds",
    synopsis:
      "雲の上に建つ大聖堂で、鐘守の少女が空を渡る巡礼者たちの願いを聞き届ける。",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    studio: "Bell Tower",
    season: "2025 秋",
    episodes: 12,
    releaseYear: 2025,
    genres: ["ファンタジー", "癒し", "ドラマ"],
  },
  {
    slug: "pixel-rangers",
    title: "ピクセル・レンジャーズ",
    titleEn: "Pixel Rangers",
    synopsis:
      "古いゲームセンターから異世界へ呼ばれた中学生たちが、ドットの王国を守るためチームを組む。",
    coverImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
    studio: "8bit Trail",
    season: "2024 冬",
    episodes: 13,
    releaseYear: 2024,
    genres: ["冒険", "コメディ", "ファンタジー"],
  },
  {
    slug: "quiet-voltage",
    title: "静電気のブルース",
    titleEn: "Quiet Voltage",
    synopsis:
      "触れたものの記憶を読める少年と、感情を音に変える少女が小さなライブハウスで出会う。",
    coverImage:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    studio: "Low Noise",
    season: "2023 冬",
    episodes: 12,
    releaseYear: 2023,
    genres: ["音楽", "青春", "ドラマ"],
  },
  {
    slug: "saffron-school-council",
    title: "サフラン生徒会",
    titleEn: "Saffron School Council",
    synopsis:
      "給食改革を掲げる新生徒会が、校内の小さな不満を料理と作戦会議で解決していく学園コメディ。",
    coverImage:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    studio: "Classroom Spice",
    season: "2022 秋",
    episodes: 12,
    releaseYear: 2022,
    genres: ["学園", "コメディ", "日常"],
  },
  {
    slug: "red-moon-archive",
    title: "赤い月のアーカイブ",
    titleEn: "Red Moon Archive",
    synopsis:
      "赤い月が昇る夜にだけ開く記録庫で、記憶管理官の新人が消された歴史の断片を追う。",
    coverImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    studio: "Archive Nine",
    season: "2021 冬",
    episodes: 12,
    releaseYear: 2021,
    genres: ["ミステリー", "SF", "ドラマ"],
  },
  {
    slug: "mint-green-medics",
    title: "ミントグリーン救護班",
    titleEn: "Mint Green Medics",
    synopsis:
      "移動診療車で島々を巡る若い救護班が、医療と暮らしの間にある答えを探していく。",
    coverImage:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
    studio: "Care Route",
    season: "2026 夏",
    episodes: 24,
    releaseYear: 2026,
    genres: ["ドラマ", "日常", "癒し"],
  },
];

async function main() {
  const animeBySlug = new Map<string, { id: string }>();
  const reviewByKey = new Map<string, { id: string; animeId: string; userId: string }>();

  for (const anime of animeList) {
    const animeData = { ...anime, isPublished: true };
    const savedAnime = await prisma.anime.upsert({
      where: { slug: anime.slug },
      update: animeData,
      create: animeData,
    });

    animeBySlug.set(anime.slug, savedAnime);
  }

  const users = await Promise.all([
    prisma.user.upsert({
      where: { id: seedUsers[0].id },
      update: {
        email: seedUsers[0].email,
        name: seedUsers[0].name,
        role: UserRole.USER,
      },
      create: {
        id: seedUsers[0].id,
        email: seedUsers[0].email,
        name: seedUsers[0].name,
        role: UserRole.USER,
      },
    }),
    prisma.user.upsert({
      where: { id: seedUsers[1].id },
      update: {
        email: seedUsers[1].email,
        name: seedUsers[1].name,
        role: UserRole.USER,
      },
      create: {
        id: seedUsers[1].id,
        email: seedUsers[1].email,
        name: seedUsers[1].name,
        role: UserRole.USER,
      },
    }),
  ]);

  const adminEmails = getAdminEmails();

  if (adminEmails.length > 0) {
    await prisma.user.updateMany({
      where: {
        email: { in: adminEmails },
      },
      data: {
        role: UserRole.ADMIN,
      },
    });
  }

  const demoReviews = [
    {
      animeSlug: "starlight-railway",
      userId: users[0].id,
      score: 92,
      title: "静かな旅情がとても良い",
      body: "一話ごとの目的地がはっきりしていて見やすいです。終盤に向けてキャラクターの距離が縮まる流れも自然でした。",
    },
    {
      animeSlug: "starlight-railway",
      userId: users[1].id,
      score: 88,
      title: "世界観で引っ張ってくれる",
      body: "星の描写と音楽が強い作品です。説明しすぎない余白があり、毎週楽しみに見られました。",
    },
    {
      animeSlug: "after-school-alchemy",
      userId: users[0].id,
      score: 84,
      title: "失敗する部活ものとして楽しい",
      body: "コメディのテンポが軽く、キャラ同士の掛け合いが見どころです。魔法設定も難しくありません。",
    },
    {
      animeSlug: "library-of-rain",
      userId: users[1].id,
      score: 90,
      title: "雨の日に見たくなる作品",
      body: "派手さはないですが、短い話数でまとまりがよく、読後感のような余韻が残ります。",
    },
    {
      animeSlug: "neon-kendo-club",
      userId: users[0].id,
      score: 78,
      title: "試合演出が気持ちいい",
      body: "部活ものの熱さと近未来の演出が合っています。中盤は少し駆け足ですが、試合回は見応えがあります。",
    },
  ];

  for (const review of demoReviews) {
    const anime = animeBySlug.get(review.animeSlug);

    if (!anime) {
      continue;
    }

    const savedReview = await prisma.review.upsert({
      where: {
        animeId_userId: {
          animeId: anime.id,
          userId: review.userId,
        },
      },
      update: {
        score: review.score,
        title: review.title,
        body: review.body,
      },
      create: {
        animeId: anime.id,
        userId: review.userId,
        score: review.score,
        title: review.title,
        body: review.body,
      },
    });

    reviewByKey.set(`${review.animeSlug}:${review.userId}`, savedReview);

    await prisma.rating.upsert({
      where: {
        animeId_userId: {
          animeId: anime.id,
          userId: review.userId,
        },
      },
      update: {
        score: review.score,
      },
      create: {
        animeId: anime.id,
        userId: review.userId,
        score: review.score,
      },
    });
  }

  const demoComments = [
    {
      id: "seed-comment-starlight-ren-to-aoi",
      animeSlug: "starlight-railway",
      reviewUserId: users[0].id,
      userId: users[1].id,
      body: "終盤の余韻、かなり良かったですね。音楽の使い方も好きでした。",
    },
    {
      id: "seed-comment-library-aoi-to-ren",
      animeSlug: "library-of-rain",
      reviewUserId: users[1].id,
      userId: users[0].id,
      body: "静かな作品を探している人にすすめやすい一作だと思います。",
    },
  ];

  for (const comment of demoComments) {
    const anime = animeBySlug.get(comment.animeSlug);
    const review = reviewByKey.get(`${comment.animeSlug}:${comment.reviewUserId}`);

    if (!anime) {
      continue;
    }

    await prisma.comment.upsert({
      where: { id: comment.id },
      update: {
        animeId: anime.id,
        reviewId: review?.id,
        userId: comment.userId,
        body: comment.body,
      },
      create: {
        id: comment.id,
        animeId: anime.id,
        reviewId: review?.id,
        userId: comment.userId,
        body: comment.body,
      },
    });
  }

  const favoritePairs = [
    { animeSlug: "starlight-railway", userId: users[0].id },
    { animeSlug: "library-of-rain", userId: users[0].id },
    { animeSlug: "after-school-alchemy", userId: users[1].id },
  ];

  for (const favorite of favoritePairs) {
    const anime = animeBySlug.get(favorite.animeSlug);

    if (!anime) {
      continue;
    }

    await prisma.favorite.upsert({
      where: {
        animeId_userId: {
          animeId: anime.id,
          userId: favorite.userId,
        },
      },
      update: {},
      create: {
        animeId: anime.id,
        userId: favorite.userId,
      },
    });
  }

  console.log(`Seeded ${animeList.length} anime titles.`);
}

main()
  .catch((error) => {
    if (isDatabaseConnectionError(error)) {
      console.error("DBに接続できませんでした。");
      console.error("先に npm.cmd run db:push が成功する状態にしてください。");
      console.error("SupabaseのDirect connectionでP1001が出る場合は、READMEの「db:push で P1001 が出る場合」を確認してください。");
    } else {
      console.error(error);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
