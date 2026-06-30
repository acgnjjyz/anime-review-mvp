"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminAccess } from "@/lib/admin";
import { hasDatabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

function requireText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function redirectWithMessage(path: string, key: "error" | "message", value: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

async function requireAdmin() {
  const { user, isAdmin } = await getAdminAccess();

  if (!user) {
    redirectWithMessage("/login", "message", "管理画面にはログインが必要です。");
  }

  if (!isAdmin) {
    redirectWithMessage("/admin", "error", "管理者権限が必要です。");
  }

  return user;
}

function readRole(value: FormDataEntryValue | null) {
  const role = requireText(value);

  if (role === UserRole.ADMIN || role === UserRole.USER) {
    return role;
  }

  redirectWithMessage("/admin/users", "error", "変更先のroleが正しくありません。");
}

export async function updateAdminUserRole(formData: FormData) {
  if (!hasDatabaseEnv()) {
    redirectWithMessage("/admin/users", "error", "データベース接続の設定が必要です。");
  }

  const admin = await requireAdmin();

  const userId = requireText(formData.get("userId"));
  const nextRole = readRole(formData.get("role"));

  if (!userId) {
    redirectWithMessage("/admin/users", "error", "roleを変更するユーザー情報が不足しています。");
  }

  let targetUser: { id: string; email: string; role: UserRole } | null = null;

  try {
    targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
  } catch {
    redirectWithMessage("/admin/users", "error", "データベースに接続できません。");
  }

  if (!targetUser) {
    redirectWithMessage("/admin/users", "error", "roleを変更するユーザーが見つかりません。");
  }

  if (targetUser.role === nextRole) {
    redirectWithMessage("/admin/users", "message", "roleはすでに選択された状態です。");
  }

  if (targetUser.role === UserRole.ADMIN && nextRole === UserRole.USER) {
    const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });

    if (adminCount <= 1) {
      redirectWithMessage("/admin/users", "error", "最後のADMINはUSERに変更できません。");
    }
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUser.id },
        data: { role: nextRole },
      }),
      prisma.userRoleChangeLog.create({
        data: {
          targetUserId: targetUser.id,
          targetUserEmail: targetUser.email,
          oldRole: targetUser.role,
          newRole: nextRole,
          adminId: admin.id,
          adminEmail: admin.email,
        },
      }),
    ]);
  } catch {
    redirectWithMessage(
      "/admin/users",
      "error",
      "roleの変更に失敗しました。少し時間をおいて再度お試しください。",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/role-logs");
  redirectWithMessage("/admin/users", "message", "ユーザーroleを更新しました。");
}
