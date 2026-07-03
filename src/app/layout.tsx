import type { Metadata } from "next";

import { BottomDock } from "@/components/BottomDock";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "アニサーチ",
  description: "Anime search and review portal built with Next.js, Prisma, PostgreSQL, and Supabase Auth.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main className="portal-main">{children}</main>
        <footer className="portal-footer border-t border-white/10 bg-[#050509]">
          <div className="mx-auto flex max-w-[1640px] flex-col gap-2 px-4 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-6">
            <p className="font-black tracking-wide text-slate-300">アニサーチ</p>
            <p>Reviews, comments, favorites, reports, and admin tools.</p>
          </div>
        </footer>
        <BottomDock />
      </body>
    </html>
  );
}
