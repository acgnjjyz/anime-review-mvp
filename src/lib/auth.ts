import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";

import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

function getUserName(authUser: SupabaseAuthUser, email: string) {
  const metadataName = authUser.user_metadata?.name;
  const metadataFullName = authUser.user_metadata?.full_name;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  if (typeof metadataFullName === "string" && metadataFullName.trim()) {
    return metadataFullName.trim();
  }

  return email.split("@")[0];
}

function getImageUrl(authUser: SupabaseAuthUser) {
  const avatarUrl = authUser.user_metadata?.avatar_url;
  return typeof avatarUrl === "string" && avatarUrl.trim() ? avatarUrl.trim() : null;
}

function isInitialAdminEmail(email: string) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((adminEmail) => adminEmail.trim().toLowerCase())
    .filter(Boolean)
    .includes(email);
}

function getSupabaseStorageKey() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  try {
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    return projectRef ? `sb-${projectRef}-auth-token` : null;
  } catch {
    return null;
  }
}

function decodeSupabaseCookie(value: string) {
  if (value.startsWith("base64-")) {
    return Buffer.from(value.slice("base64-".length), "base64url").toString("utf8");
  }

  return decodeURIComponent(value);
}

async function hasUsableStoredSession() {
  const storageKey = getSupabaseStorageKey();

  if (!storageKey) {
    return false;
  }

  const cookieStore = await cookies();
  const authCookies = cookieStore
    .getAll()
    .filter((cookie) => cookie.name === storageKey || cookie.name.startsWith(`${storageKey}.`))
    .sort((a, b) => {
      if (a.name === storageKey) {
        return -1;
      }

      if (b.name === storageKey) {
        return 1;
      }

      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });

  if (authCookies.length === 0) {
    return false;
  }

  try {
    const rawSession = decodeSupabaseCookie(authCookies.map((cookie) => cookie.value).join(""));
    const session = JSON.parse(rawSession) as {
      access_token?: unknown;
      expires_at?: unknown;
    };
    const expiresAt = typeof session.expires_at === "number" ? session.expires_at : 0;

    return typeof session.access_token === "string" && expiresAt * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function syncSupabaseUserToPrisma(authUser: SupabaseAuthUser) {
  const email = authUser.email?.trim().toLowerCase() ?? `${authUser.id}@supabase.local`;
  const name = getUserName(authUser, email);
  const imageUrl = getImageUrl(authUser);
  const existingUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true },
  });

  return prisma.user.upsert({
    where: { id: authUser.id },
    update: {
      email,
      name,
      imageUrl,
    },
    create: {
      id: authUser.id,
      email,
      name,
      imageUrl,
      role: !existingUser && isInitialAdminEmail(email) ? UserRole.ADMIN : UserRole.USER,
    },
  });
}

export async function getCurrentSupabaseUser() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!(await hasUsableStoredSession())) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getSyncedCurrentUser() {
  if (!hasDatabaseEnv() || !hasSupabaseEnv()) {
    return null;
  }

  try {
    const authUser = await getCurrentSupabaseUser();

    if (!authUser) {
      return null;
    }

    return await syncSupabaseUserToPrisma(authUser);
  } catch {
    return null;
  }
}

export const getCurrentUserProfile = getSyncedCurrentUser;
