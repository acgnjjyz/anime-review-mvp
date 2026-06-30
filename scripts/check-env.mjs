import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env");

const requiredKeys = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "ADMIN_EMAILS",
];

const placeholderValues = new Set([
  "https://your-project.supabase.co",
  "your-supabase-anon-key",
  "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?sslmode=require",
  "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres",
]);

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseEnvFile(content) {
  const values = new Map();

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match) {
      continue;
    }

    values.set(match[1], stripQuotes(match[2]));
  }

  return values;
}

function isMissing(value) {
  return !value || placeholderValues.has(value) || value.includes("your-project");
}

function printNextSteps() {
  console.log("");
  console.log("次にやること:");
  console.log("1. Supabase Dashboard を開く");
  console.log("2. Project Settings > API で Project URL と anon/publishable key を確認");
  console.log("3. Project Settings > Database で Connection string と Database password を確認");
  console.log("4. .env の値を置き換える");
  console.log("5. もう一度 npm.cmd run env:check を実行");
  console.log("");
  console.log("詳しい場所は README.md の「Supabase Dashboardで値を探す場所」を見てください。");
}

if (!fs.existsSync(envPath)) {
  console.error("NG: .env が見つかりません。");
  console.error(".env.example をコピーして .env を作成してください。");
  printNextSteps();
  process.exit(1);
}

const env = parseEnvFile(fs.readFileSync(envPath, "utf8"));
const missingKeys = requiredKeys.filter((key) => isMissing(env.get(key)));
const warnings = [];
const errors = [];
const databaseUrl = env.get("DATABASE_URL") ?? "";
const siteUrl = env.get("NEXT_PUBLIC_SITE_URL") ?? "";
const supabaseUrl = env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const directUrl = env.get("DIRECT_URL") ?? "";

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

const databaseUrlObject = parseUrl(databaseUrl);
const directUrlObject = parseUrl(directUrl);

function isPoolerUrl(url) {
  return Boolean(url?.hostname.endsWith("pooler.supabase.com"));
}

function hasEllipsis(value, url) {
  return value.includes("...") || Boolean(url?.hostname.includes("..."));
}

function hasPasswordPlaceholder(value) {
  return value.includes("[YOUR-PASSWORD]") || value.includes("YOUR-PASSWORD");
}

function hasSpecialPasswordChars(url) {
  if (!url?.password) {
    return false;
  }

  let password = url.password;

  try {
    password = decodeURIComponent(password);
  } catch {
    return true;
  }

  return /[@#%/?&:]/.test(password);
}

if (databaseUrl && !/^postgres(ql)?:\/\//.test(databaseUrl)) {
  warnings.push("DATABASE_URL は postgresql:// または postgres:// で始まる必要があります。");
}

if (supabaseUrl && !/^https:\/\/.+\.supabase\.co$/.test(supabaseUrl)) {
  warnings.push("NEXT_PUBLIC_SUPABASE_URL は https://...supabase.co の形式か確認してください。");
}

if (siteUrl && !/^https?:\/\//.test(siteUrl)) {
  warnings.push("NEXT_PUBLIC_SITE_URL は http:// または https:// で始まる必要があります。");
}

if (directUrl && !/^postgres(ql)?:\/\//.test(directUrl)) {
  warnings.push("DIRECT_URL を使う場合は postgresql:// または postgres:// で始めてください。");
}

if (databaseUrl && hasEllipsis(databaseUrl, databaseUrlObject)) {
  errors.push("DATABASE_URL のホスト名に ... が含まれています。Supabase ORM画面のCopyボタンで完全なURLをコピーしてください。");
}

if (directUrl && hasEllipsis(directUrl, directUrlObject)) {
  errors.push("DIRECT_URL のホスト名に ... が含まれています。Supabase ORM画面のCopyボタンで完全なURLをコピーしてください。");
}

if (databaseUrl && hasPasswordPlaceholder(databaseUrl)) {
  errors.push("DATABASE_URL に [YOUR-PASSWORD] が残っています。Database passwordに置き換えてください。");
}

if (directUrl && hasPasswordPlaceholder(directUrl)) {
  errors.push("DIRECT_URL に [YOUR-PASSWORD] が残っています。Database passwordに置き換えてください。");
}

if (databaseUrlObject && (!isPoolerUrl(databaseUrlObject) || databaseUrlObject.port !== "6543")) {
  errors.push("DATABASE_URL は pooler.supabase.com:6543 のURLを入れてください。");
}

if (directUrlObject && (!isPoolerUrl(directUrlObject) || directUrlObject.port !== "5432")) {
  errors.push("DIRECT_URL は pooler.supabase.com:5432 のURLを入れてください。");
}

if (hasSpecialPasswordChars(databaseUrlObject) || hasSpecialPasswordChars(directUrlObject)) {
  errors.push("Database password に @ # % / ? & : などの記号が含まれている可能性があります。Supabaseで英数字だけのDatabase passwordに変更し、ORM画面のCopyボタンでURLをコピーし直してください。");
}

if (
  databaseUrlObject?.hostname.startsWith("db.") &&
  databaseUrlObject.hostname.endsWith(".supabase.co") &&
  !databaseUrlObject.searchParams.has("sslmode")
) {
  warnings.push("SupabaseのDirect connectionを使う場合は、DATABASE_URLの末尾に ?sslmode=require を付けてください。");
}

if (
  databaseUrlObject?.hostname.startsWith("db.") &&
  databaseUrlObject.hostname.endsWith(".supabase.co")
) {
  warnings.push("DATABASE_URLはSupabaseのDirect connectionです。db:pushでP1001が出る場合は、READMEの「P1001が出る場合」を見て、Session pooler URLの利用を検討してください。");
}

if (missingKeys.length > 0 || errors.length > 0) {
  console.error("NG: .env の必須項目が未設定、またはサンプル値のままです。");
  console.error("");
  for (const key of missingKeys) {
    console.error(`- ${key}`);
  }
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  printNextSteps();
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("注意: .env の形式を確認してください。");
  console.warn("");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
  console.warn("");
  console.warn("値が正しければ次へ進めますが、接続に失敗する場合はREADMEを確認してください。");
}

console.log("OK: .env の必須項目は設定されています。");
