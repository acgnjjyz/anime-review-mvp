"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

function redirectWithMessage(path: string, key: "error" | "message", value: string) {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "メール確認が未完了です。届いた確認メールを開くか、開発中はSupabase DashboardのAuthentication設定でConfirm emailをOFFにしてください。";
  }

  if (normalized.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが違います。入力内容を確認してください。";
  }

  if (normalized.includes("email address") && normalized.includes("invalid")) {
    return "このメールアドレス形式はSupabase Authで使えません。別のテスト用メールアドレスを使ってください。";
  }

  return message;
}

async function getOrigin() {
  const headerStore = await headers();
  return (
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export async function signUp(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirectWithMessage(
      "/signup",
      "error",
      "Supabaseの環境変数を設定してください。",
    );
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithMessage("/signup", "error", "メールアドレスとパスワードは必須です。");
  }

  if (password.length < 6) {
    redirectWithMessage("/signup", "error", "パスワードは6文字以上にしてください。");
  }

  let error: { message: string } | null = null;

  try {
    const supabase = await createClient();
    const origin = await getOrigin();
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    error = result.error;
  } catch {
    redirectWithMessage(
      "/signup",
      "error",
      "Supabaseの設定を確認してください。URLまたはanon keyが正しくありません。",
    );
  }

  if (error) {
    redirectWithMessage("/signup", "error", getAuthErrorMessage(error.message));
  }

  redirectWithMessage(
    "/login",
    "message",
    "登録しました。メール確認が有効な場合は、届いたメールを確認してください。",
  );
}

export async function signIn(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirectWithMessage(
      "/login",
      "error",
      "Supabaseの環境変数を設定してください。",
    );
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithMessage("/login", "error", "メールアドレスとパスワードは必須です。");
  }

  let error: { message: string } | null = null;

  try {
    const supabase = await createClient();
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    error = result.error;
  } catch {
    redirectWithMessage(
      "/login",
      "error",
      "Supabaseの設定を確認してください。URLまたはanon keyが正しくありません。",
    );
  }

  if (error) {
    redirectWithMessage("/login", "error", getAuthErrorMessage(error.message));
  }

  redirect("/mypage");
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // If Supabase is unavailable, still return the visitor to the public page.
    }
  }

  redirect("/");
}
