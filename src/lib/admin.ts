import { UserRole, type User } from "@prisma/client";

import { getCurrentUserProfile } from "@/lib/auth";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function getAdminAccess(): Promise<{
  user: User | null;
  isAdmin: boolean;
}> {
  const user = await getCurrentUserProfile();

  return {
    user,
    isAdmin: user?.role === UserRole.ADMIN,
  };
}
