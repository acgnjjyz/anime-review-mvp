import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
try {
  const [role] = await db.$queryRaw`
    select current_user as database_role, rolsuper or rolbypassrls as bypasses_rls
    from pg_roles where rolname = current_user
  `;
  const buckets = await db.$queryRaw`
    select id, public, file_size_limit, allowed_mime_types
    from storage.buckets where id = 'anime-posters'
  `;
  const policies = await db.$queryRaw`
    select schemaname, tablename, policyname, cmd
    from pg_policies where policyname in ('admins_insert_anime_posters', 'poster_upload_read_own_role')
  `;
  const authorization = buckets.length ? await db.$transaction(async (tx) => {
    const admin = await tx.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
    if (!admin) throw new Error("No application admin exists.");
    await tx.$executeRaw`select set_config('request.jwt.claims', ${JSON.stringify({ sub: admin.id, role: "authenticated" })}, true)`;
    await tx.$executeRawUnsafe("set local role authenticated");
    const ownRows = await tx.$queryRaw`select id, role from public."User"`;
    const [grants] = await tx.$queryRaw`
      select has_table_privilege('authenticated', 'public."User"', 'UPDATE') as can_change_roles,
        has_table_privilege('anon', 'public."User"', 'SELECT') as anonymous_can_read_users
    `;
    await tx.$executeRaw`select set_config('request.jwt.claims', ${JSON.stringify({ sub: "00000000-0000-4000-8000-000000000001", role: "authenticated" })}, true)`;
    const nonAdminRows = await tx.$queryRaw`select id, role from public."User"`;
    const result = { adminCanReadOwnRole: ownRows.length === 1 && ownRows[0].role === "ADMIN", nonAdminCanReadAdmin: nonAdminRows.some((row) => row.role === "ADMIN"), ...grants };
    if (!result.adminCanReadOwnRole || result.nonAdminCanReadAdmin || result.can_change_roles || result.anonymous_can_read_users) throw new Error("Storage authorization check failed.");
    return result;
  }) : null;
  console.log(JSON.stringify({ role, buckets, policies, authorization }, (_, value) => typeof value === "bigint" ? Number(value) : value, 2));
  if (!role.bypasses_rls) throw new Error("Application database connection must retain server-side access.");
  if (buckets.length !== 1 || policies.length !== 2) process.exitCode = 1;
} finally {
  await db.$disconnect();
}
