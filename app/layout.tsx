import type { Metadata, Viewport } from "next";
import { Montserrat, Pixelify_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/header";
import { ToastProvider } from "@/components/ui/toast";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap"
});

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Boutique officielle`,
    template: `%s — ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "games",
  keywords: [
    "TBNK-SMP",
    "Minecraft",
    "serveur Minecraft",
    "boutique Minecraft",
    "Tebex",
    "rangs Minecraft",
    "clés Minecraft"
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Boutique officielle`,
    description: siteConfig.description
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Boutique officielle`,
    description: siteConfig.description
  },
  icons: {
    icon: [{ url: siteConfig.favicon, type: "image/svg+xml" }],
    shortcut: [siteConfig.favicon]
  },
  robots: {
    index: true,
    follow: true
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: siteConfig.background,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr-CA" data-scroll-behavior="smooth">
      <body className={`${montserrat.variable} ${pixelify.variable}`}>
        <a className="skip-link" href="#main">
          Aller au contenu
        </a>
        <ToastProvider>
          <div className="site-shell">
            <SiteHeader />
            <main id="main" className="site-content">
              {children}
            </main>
            <SiteFooter />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
