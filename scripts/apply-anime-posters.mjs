import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const prisma = new PrismaClient();
const placeholder = "/images/catalog-placeholder.svg";
const originalPhotos = ["photo-1446776811953-b23d57bd21aa", "photo-1519608487953-e999c86e7455", "photo-1454789548928-9efd52dc4031", "photo-1495567720989-cebdbdd97913", "photo-1518709268805-4e9042af2176", "photo-1523050854058-8df90110c9f1", "photo-1500530855697-b586d89ba3ee", "photo-1519681393784-d120267933ba"];
const replaceable = new Set(originalPhotos.map((photo) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=80`));
replaceable.add(placeholder);
try {
  const data = JSON.parse(await readFile(new URL("../public/data/anime-posters.json", import.meta.url), "utf8"));
  const official = JSON.parse(await readFile(new URL("../public/data/official-anime-images.json", import.meta.url), "utf8"));
  const matches = new Map([...data.matches, ...official.matches].map((match) => [match.slug, match]));
  const rows = await prisma.anime.findMany({ where: { studio: "Title Import" }, select: { id: true, slug: true, title: true, coverImage: true } });
  const changes = rows.flatMap((row) => {
    if (!replaceable.has(row.coverImage)) return [];
    const match = matches.get(row.slug);
    if (match && match.title !== row.title) return [];
    const newImage = match?.coverImage ?? placeholder;
    return newImage !== row.coverImage ? [{ ...row, newImage }] : [];
  });
  console.log(JSON.stringify({ catalog: rows.length, posters: changes.filter((row) => row.newImage !== placeholder).length, placeholders: changes.filter((row) => row.newImage === placeholder).length, apply: process.argv.includes("--apply") }));
  if (process.argv.includes("--apply")) {
    await mkdir(new URL("../work/", import.meta.url), { recursive: true });
    await writeFile(new URL(`../work/poster-backup-${Date.now()}.json`, import.meta.url), JSON.stringify(changes, null, 2));
    let updated = 0;
    for (let offset = 0; offset < changes.length; offset += 200) {
      const values = Prisma.join(changes.slice(offset, offset + 200).map((row) => Prisma.sql`(${row.id}, ${row.coverImage}, ${row.newImage}, ${row.title})`));
      updated += await prisma.$executeRaw(Prisma.sql`UPDATE "Anime" AS anime SET "coverImage" = images.new_image, "updatedAt" = NOW() FROM (VALUES ${values}) AS images(id, old_image, new_image, old_title) WHERE anime."id" = images.id AND anime."coverImage" = images.old_image AND anime."title" = images.old_title AND anime."studio" = 'Title Import'`);
    }
    const after = await prisma.anime.findMany({ where: { studio: "Title Import" }, select: { id: true, coverImage: true } });
    const verified = new Map(after.map((row) => [row.id, row.coverImage]));
    const failed = changes.filter((row) => verified.get(row.id) !== row.newImage).length;
    console.log(JSON.stringify({ updated, failedVerification: failed }));
    if (failed) throw new Error("Verification failed");
  }
} catch (error) {
  const code = error?.code ?? error?.errorCode;
  if (typeof code === "string" && /^P\d{4}$/.test(code)) console.error(`Database error code: ${code}`);
  console.error("Poster update failed. Credentials are not printed; local backups are retained in work/.");
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
