import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider, AuthRequiredModal, CookieConsent } from "@/components/ui";

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
  description: "Votre communauté de lecteurs passionnés",
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
        </AuthProvider>
      </body>
    </html>
  );
}
