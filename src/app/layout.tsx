import type { Metadata } from "next";

import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "AniMemo",
  description: "Next.js, Prisma, Supabase Authで作るアニメレビューMVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>AniMemo MVP</p>
            <p>Next.js + TypeScript + Tailwind CSS + Prisma + Supabase Auth</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
