import { UiText } from "@/components/UiText";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/components/LocaleProvider";

import { BottomDock } from "@/components/BottomDock";
import { Header } from "@/components/Header";
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
  description: "アニメの検索・評価・レビューサイト。気になる作品やおすすめのアニメを探せます。",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await cookies()).get("animemo-locale")?.value === "en" ? "en" : "ja";
  return (
    <html lang={locale} data-locale={locale} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className={portalFont.variable}>
        <LocaleProvider initialLocale={locale}>
        <Header />
        <main className="portal-main">{children}</main>
        <footer className="portal-footer border-t border-line/10 bg-canvas">
          <div className="mx-auto flex max-w-[1640px] flex-col gap-2 px-4 py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between lg:px-6">
            <p className="font-black tracking-wide text-secondary">アニサーチ</p>
            <p>
              <UiText text={"Poster data:"} /> <a className="underline hover:text-heading" href="https://www.tvmaze.com/" target="_blank" rel="noreferrer">TVmaze</a>
              {" / "}
              <a className="underline hover:text-heading" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
              {" / "}<a className="underline hover:text-heading" href="/credits">出典</a>
            </p>
          </div>
        </footer>
        <BottomDock />
        </LocaleProvider>
      </body>
    </html>
  );
}
