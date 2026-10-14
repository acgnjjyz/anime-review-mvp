import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import { BottomDock } from "@/components/BottomDock";
import { Header } from "@/components/Header";
import { ThemeToggle } from "@/components/ThemeToggle";
import { themeInitializationScript } from "@/lib/theme";
import "./globals.css";

const portalFont = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-portal-ui",
});

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
    <html lang="ja" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className={portalFont.variable}>
        <Header />
        <main className="portal-main">{children}</main>
        <footer className="portal-footer border-t border-line/10 bg-canvas">
          <div className="mx-auto flex max-w-[1640px] flex-col gap-2 px-4 py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between lg:px-6">
            <div className="flex items-center gap-3">
              <p className="font-black tracking-wide text-secondary">アニサーチ</p>
              <ThemeToggle />
            </div>
            <p>
              Poster data: <a className="underline hover:text-heading" href="https://www.tvmaze.com/" target="_blank" rel="noreferrer">TVmaze</a>
              {" / "}
              <a className="underline hover:text-heading" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
              {" / "}<a className="underline hover:text-heading" href="/credits">出典</a>
            </p>
          </div>
        </footer>
        <BottomDock />
      </body>
    </html>
  );
}
