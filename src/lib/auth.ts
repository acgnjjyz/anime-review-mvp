import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { UserRole } from "@prisma/client";

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
