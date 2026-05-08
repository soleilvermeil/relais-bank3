import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/organisms/site-header";
import { getLocale } from "@/lib/i18n/get-locale";
import { getServerT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";
import { isUserConnectedFromCookie } from "@/lib/bank-cookies";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("meta.title", { ns: "common" }),
    description: t("meta.description", { ns: "common" }),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const t = await getServerT();
  const isConnected = await isUserConnectedFromCookie();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <I18nProvider locale={locale}>
          <a
            href="#main-content"
            className="sr-only print:hidden focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:m-0 focus:inline-block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
          >
            {t("skipToContent", { ns: "common" })}
          </a>
          <div className="bg-primary py-2 text-center text-sm text-primary-foreground print:hidden">
            <p className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              {t("prevention", { ns: "common" })}
            </p>
          </div>
          <SiteHeader locale={locale} isConnected={isConnected} />
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="mt-auto border-t border-card-border bg-card py-6 text-center text-sm text-muted-foreground print:hidden">
            <a
              href="https://github.com/soleilvermeil/relais-bank"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {t("footerProjectLink", { ns: "common" })}
            </a>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
