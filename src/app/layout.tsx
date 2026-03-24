import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider, AuthRequiredModal, CookieConsent } from "@/components/ui";
import { Analytics } from "@vercel/analytics/react";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mediamoure = localFont({
  src: [
    {
      path: "../fonts/mediamoure-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/mediamoure-regularitalic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-mediamoure",
});

export const metadata: Metadata = {
  title: "The Book Club",
  description: "Votre communaute de lecteurs passionnes",
  metadataBase: new URL("https://thebookclub.cafe"),
  icons: {
    icon: "/images/icon.svg",
    shortcut: "/images/icon.svg",
    apple: "/images/icon.svg",
  },
  openGraph: {
    title: "The Book Club",
    description: "Votre communaute de lecteurs passionnes",
    url: "https://thebookclub.cafe",
    siteName: "The Book Club",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "The Book Club",
    description: "Votre communaute de lecteurs passionnes",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="fr">
      <body
        className={`${manrope.variable} ${mediamoure.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-dark focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Aller au contenu principal
        </a>
        <AuthProvider initialSession={session}>
          <ToastProvider>
            {children}
            <AuthRequiredModal />
            <CookieConsent />
          </ToastProvider>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
