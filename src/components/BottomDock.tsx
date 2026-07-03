import { UserRole } from "@prisma/client";
import { Suspense } from "react";

import { BottomDockClient, type BottomDockItem } from "@/components/BottomDockClient";
import { getCurrentUserProfile } from "@/lib/auth";

const baseItems: BottomDockItem[] = [
  { href: "/", kind: "home", labelEn: "Home", labelJa: "\u30db\u30fc\u30e0" },
  { href: "/anime", kind: "anime", labelEn: "Anime", labelJa: "\u30a2\u30cb\u30e1" },
  { href: "/ranking", kind: "ranking", labelEn: "Ranking", labelJa: "\u30e9\u30f3\u30ad\u30f3\u30b0" },
  { href: "/mypage", kind: "mypage", labelEn: "MyPage", labelJa: "\u30de\u30a4\u30da\u30fc\u30b8" },
  { href: "/anime?dock=search#anime-search", kind: "search", labelEn: "Search", labelJa: "\u691c\u7d22" },
];

export async function BottomDock() {
  const user = await getCurrentUserProfile();
  const isAdmin = user?.role === UserRole.ADMIN;
  const items = isAdmin
    ? [
        ...baseItems,
        { href: "/admin", kind: "admin", labelEn: "Admin", labelJa: "\u7ba1\u7406" } satisfies BottomDockItem,
      ]
    : baseItems;

  return (
    <Suspense fallback={null}>
      <BottomDockClient items={items} />
    </Suspense>
  );
}
