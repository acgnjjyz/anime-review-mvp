import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const prisma = new PrismaClient();
try {
  const catalog = JSON.parse(await readFile(new URL("../prisma/japanese-title-matches.json", import.meta.url), "utf8"));
  const matches = new Map(catalog.matches.map((match) => [match.slug, match]));
  const rows = await prisma.anime.findMany({
    where: { studio: "Title Import" },
    select: { id: true, slug: true, title: true },
  });
  const changes = rows.flatMap((row) => {
    const match = matches.get(row.slug);
    return match && row.title === match.originalTitle && row.title !== match.title
      ? [{ ...row, newTitle: match.title }]
      : [];
  });
  console.log(JSON.stringify({ importedRows: rows.length, plannedUpdates: changes.length, apply: process.argv.includes("--apply") }));
  if (process.argv.includes("--apply")) {
    await mkdir(new URL("../work/", import.meta.url), { recursive: true });
    await writeFile(new URL(`../work/japanese-title-backup-${Date.now()}.json`, import.meta.url), JSON.stringify(changes, null, 2));
    let updated = 0;
    for (let offset = 0; offset < changes.length; offset += 200) {
      const chunk = changes.slice(offset, offset + 200);
      // Compare the original title too, preserving any concurrent administrator edits.
      const values = Prisma.join(chunk.map((row) => Prisma.sql`(${row.id}, ${row.title}, ${row.newTitle})`));
      updated += await prisma.$executeRaw(Prisma.sql`
        UPDATE "Anime" AS anime SET "title" = names.new_title, "updatedAt" = NOW()
        FROM (VALUES ${values}) AS names(id, old_title, new_title)
        WHERE anime."id" = names.id AND anime."title" = names.old_title
          AND anime."studio" = 'Title Import'
      `);
    }
    const verified = await prisma.anime.findMany({ where: { studio: "Title Import" }, select: { slug: true, title: true } });
    const count = verified.filter((row) => matches.get(row.slug)?.title === row.title).length;
    console.log(JSON.stringify({ updated, verifiedJapaneseTitles: count }));
    if (changes.some((change) => !verified.some((row) => row.slug === change.slug && row.title === change.newTitle))) {
      throw new Error("Some titles changed concurrently or could not be verified");
    }
  }
} catch {
  console.error("Title update failed. No credentials are printed. Inspect the local backup and database connectivity before retrying.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
