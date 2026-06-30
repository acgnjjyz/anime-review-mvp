const placeholders = new Set([
  "https://your-project.supabase.co",
  "your-supabase-anon-key",
  "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres",
  "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?sslmode=require",
]);

function hasRealValue(value: string | undefined) {
  return Boolean(value && value.trim() && !placeholders.has(value.trim()));
}

export function hasDatabaseEnv() {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(hasRealValue(url) && /^(postgresql|postgres):\/\//.test(url ?? ""));
}

export function hasSupabaseEnv() {
  return Boolean(
    hasRealValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      hasRealValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export function getMissingEnvLabels() {
  const missing: string[] = [];

  if (!hasDatabaseEnv()) {
    missing.push("DATABASE_URL");
  }

  if (!hasSupabaseEnv()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return missing;
}
